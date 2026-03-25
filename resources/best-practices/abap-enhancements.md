# ABAP Enhancements — Boas Práticas

> Referência para implementação de exits, BADIs, BTEs e Enhancement Spots. Regra de ouro: **o código de negócio nunca fica dentro do ponto de saída** — sempre delegado para uma classe.

---

## Regra Central (obrigatória)

```
Ponto de Saída / BADI / BTE / Exit
  └── Chama método de classe de negócio
        └── Toda a lógica está na classe
```

**Por quê:**
- Pontos de saída são difíceis de testar unitariamente
- Lógica em classe pode ser reutilizada, versionada e testada com ABAP Unit
- Facilita manutenção — a lógica está em um único lugar rastreável
- Evita duplicação entre exits similares

---

## 1. BADIs (Business Add-Ins)

### Quando usar
- Customização de comportamento padrão SAP sem modificar o standard
- Preferir BADIs a User Exits quando ambos estiverem disponíveis — BADIs são OO e suportam múltiplas implementações

### Estrutura obrigatória

```
SE18 — Verificar a BADI e seus métodos
SE19 — Criar implementação da BADI
  └── Implementação chama classe de negócio Z
        └── ZCL_[MODULO]_[NOME_NEGOCIO]
```

### Exemplo — BADI com delegação para classe

```abap
" Implementação da BADI (SE19 / ADT)
CLASS zbadi_sd_pricing_impl DEFINITION PUBLIC FINAL
  CREATE PUBLIC.

  PUBLIC SECTION.
    INTERFACES: badi_interface_name.  " interface da BADI

ENDCLASS.

CLASS zbadi_sd_pricing_impl IMPLEMENTATION.

  METHOD badi_interface_name~calculate_price.
    " REGRA: nenhuma lógica de negócio aqui
    " Delegar 100% para a classe de negócio
    NEW zsdcl_pricing_handler( )->calculate(
      IMPORTING
        is_condition = is_condition
      CHANGING
        cs_komv      = cs_komv ).
  ENDMETHOD.

ENDCLASS.
```

```abap
" Classe de negócio — aqui fica TODA a lógica
CLASS zsdcl_pricing_handler DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS: calculate
      IMPORTING is_condition TYPE ...
      CHANGING  cs_komv      TYPE komv.
  PRIVATE SECTION.
    METHODS: apply_discount
               IMPORTING iv_rate TYPE p
               CHANGING  cs_komv TYPE komv,
             validate_condition
               IMPORTING is_condition TYPE ...
               RETURNING VALUE(rv_valid) TYPE abap_bool.
ENDCLASS.

CLASS zsdcl_pricing_handler IMPLEMENTATION.
  METHOD calculate.
    IF NOT validate_condition( is_condition ).
      RETURN.
    ENDIF.
    apply_discount( iv_rate = '10' CHANGING cs_komv = cs_komv ).
  ENDMETHOD.

  METHOD validate_condition.
    rv_valid = xsdbool( is_condition-kschl IS NOT INITIAL ).
  ENDMETHOD.

  METHOD apply_discount.
    cs_komv-kwert = cs_komv-kwert * ( 1 - iv_rate / 100 ).
  ENDMETHOD.
ENDCLASS.
```

### BADI com filtro (Context-Dependent)

```abap
METHOD badi_interface~process.
  " Verificar filtro antes de delegar (quando a BADI não filtra automaticamente)
  CHECK iv_sales_org = 'ZBRA'.
  NEW zsdcl_brazil_handler( )->process( CHANGING cs_data = cs_data ).
ENDMETHOD.
```

---

## 2. User Exits (Clássicos)

> User Exits são a forma legada de enhancement em SAP. Use **apenas quando não houver BADI equivalente**. A regra de delegação para classe é ainda mais importante aqui — exits clássicos são FORMs, não OO.

### Tipos comuns

| Tipo | Onde | Como encontrar |
|------|------|----------------|
| EXIT_ Function Module | Grupos de função | SE37 — buscar `EXIT_[PROGRAMA]_*` |
| User-Exit includes | Includes `MV45AFZZ`, `LV60AU01`, etc. | SMOD / CMOD |
| Screen exits | Telas com subscreen areas | CMOD |

### Estrutura obrigatória — Exit via CMOD/SMOD

```abap
" Include do exit (ex: ZXV45U01) — MÍNIMO possível aqui
INCLUDE zxv45u01.

" Dentro do include:
CASE sy-uname.  " raramente necessário
  WHEN OTHERS.
ENDCASE.

" Delegar para classe — SEMPRE
NEW zsdcl_sales_order_exit( )->process_save(
  CHANGING cs_vbak = vbak
           cs_vbap = vbap ).
```

```abap
" EXIT_SAPMV45A_001 (exemplo de Function Module exit)
FUNCTION exit_sapmv45a_001.
  " Sem lógica aqui — apenas delegação
  NEW zsdcl_va01_exit_handler( )->on_save(
    IMPORTING
      is_vbak = vbak
    CHANGING
      cs_vbap = vbap ).
ENDFUNCTION.
```

### Classe de negócio para Exit

```abap
CLASS zsdcl_va01_exit_handler DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS: on_save
      IMPORTING is_vbak TYPE vbak
      CHANGING  cs_vbap TYPE vbap.
  PRIVATE SECTION.
    METHODS: enrich_item_data
               CHANGING cs_vbap TYPE vbap,
             validate_partner
               IMPORTING is_vbak TYPE vbak
               RETURNING VALUE(rv_valid) TYPE abap_bool.
ENDCLASS.

CLASS zsdcl_va01_exit_handler IMPLEMENTATION.
  METHOD on_save.
    CHECK validate_partner( is_vbak ).
    enrich_item_data( CHANGING cs_vbap = cs_vbap ).
  ENDMETHOD.

  METHOD validate_partner.
    rv_valid = xsdbool( is_vbak-kunnr IS NOT INITIAL ).
  ENDMETHOD.

  METHOD enrich_item_data.
    " lógica de enriquecimento
  ENDMETHOD.
ENDCLASS.
```

---

## 3. BTEs (Business Transaction Events)

> BTEs são eventos publicados por módulos FI/CO/MM que permitem enriquecer ou modificar dados de transações. Existem dois tipos: **Process** (substitui lógica SAP) e **Publish** (notificação, sem retorno).

### Onde encontrar BTEs disponíveis
- Transação `FIBF` — lista todos os BTEs disponíveis por produto
- Menu: Environment → Info System (P&S)

### Tipos de BTE

| Tipo | Descrição | Retorno |
|------|-----------|---------|
| **00001xxx** — Process | Substitui ou complementa processo SAP | Sim — dados modificados |
| **00002xxx** — Publish | Notificação de evento ocorrido | Não |

### Implementação de BTE

```abap
" 1. Criar Function Module no grupo de funções ZFI_BTE (ou equivalente)
"    Seguir exatamente a interface do BTE (parâmetros obrigatórios)

FUNCTION zfi_bte_00001020_posting.
*"---------------------------------------------------------------------
*"  Importing: I_FKKVK, I_FKKOP, etc. (conforme interface do BTE)
*"  Changing:  C_FKKVKZ, C_FKKOPZ
*"---------------------------------------------------------------------

  " REGRA: sem lógica aqui — delegar para classe
  NEW zficl_bte_posting_handler( )->on_posting(
    IMPORTING
      is_header   = i_fkkvk
    CHANGING
      cs_header_x = c_fkkvkz ).

ENDFUNCTION.
```

```abap
" 2. Registrar o BTE na FIBF
"    - Transação FIBF
"    - Settings → Products → ...of a customer
"    - Criar produto Z (ex: ZFIBT_001)
"    - Associar o Function Module ao evento
```

```abap
" Classe de negócio para o BTE
CLASS zficl_bte_posting_handler DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS: on_posting
      IMPORTING is_header   TYPE fkkvk
      CHANGING  cs_header_x TYPE fkkvkz.
  PRIVATE SECTION.
    METHODS: enrich_posting_data
               IMPORTING is_header   TYPE fkkvk
               CHANGING  cs_header_x TYPE fkkvkz.
ENDCLASS.

CLASS zficl_bte_posting_handler IMPLEMENTATION.
  METHOD on_posting.
    enrich_posting_data(
      IMPORTING is_header   = is_header
      CHANGING  cs_header_x = cs_header_x ).
  ENDMETHOD.

  METHOD enrich_posting_data.
    " Lógica de enriquecimento de lançamento
    " Ex: setar campo customizado de acordo com regra de negócio
  ENDMETHOD.
ENDCLASS.
```

### BTE do tipo Publish (apenas notificação)

```abap
FUNCTION zfi_bte_00002020_after_post.
*" Sem parâmetros de retorno — apenas notificação
  NEW zficl_bte_after_post( )->handle( is_header = i_fkkvk ).
ENDFUNCTION.
```

---

## 4. Enhancement Spots (Implicit / Explicit)

### Implicit Enhancement
- Existe automaticamente no início e no fim de todo include/function module
- Acessar via ADT (Eclipse) ou SE80: botão direito → Enhancement Operations → Show Implicit Enhancement Options

```abap
" Implicit Enhancement no início de um include (ex: MV45AFZZ)
ENHANCEMENT 1 ZSD_VA01_IMPLICIT.
  " Sem lógica aqui — delegar
  NEW zsdcl_va01_implicit_handler( )->before_processing( ).
ENDENHANCEMENT.
```

### Explicit Enhancement Spot
- Definido explicitamente no código standard com `ENHANCEMENT-POINT` ou `ENHANCEMENT-SECTION`
- Verificar pontos disponíveis via SE18 ou ADT

```abap
" Ponto definido no standard (não modificar)
ENHANCEMENT-POINT ZSD_PRICING_BEFORE_CALC SPOTS ZSD_PRICING_SPOT.

" Implementação do Explicit Enhancement
ENHANCEMENT 1 ZSD_PRICING_SPOT_IMPL.
  " Apenas delegação — código de negócio fora do ponto
  NEW zsdcl_pricing_pre_handler( )->before_calculate(
    CHANGING cs_komv = komv ).
ENDENHANCEMENT.
```

### Enhancement Section (substituição de bloco)

```abap
" No standard (não modificar):
ENHANCEMENT-SECTION ZSD_CALC_SECTION SPOTS ZSD_CALC_SPOT STATIC.
  " código original SAP
ENDENHANCEMENT-SECTION.

" Implementação que substitui o bloco:
ENHANCEMENT 1 ZSD_CALC_IMPL.
  NEW zsdcl_calc_override( )->execute( CHANGING cs_result = lv_result ).
ENDENHANCEMENT.
```

---

## 5. Padrão de Nomenclatura para Enhancements

| Objeto | Padrão | Exemplo |
|--------|--------|---------|
| Implementação BADI | `Z[MOD]CL_[BADI]_IMPL` | `ZSDCL_PRICING_IMPL` |
| Classe de negócio do exit | `Z[MOD]CL_[TRANS]_EXIT_HANDLER` | `ZSDCL_VA01_EXIT_HANDLER` |
| Classe de negócio da BADI | `Z[MOD]CL_[BADI]_HANDLER` | `ZSDCL_PRICING_HANDLER` |
| Classe de negócio do BTE | `Z[MOD]CL_BTE_[EVENTO]` | `ZFICL_BTE_POSTING_HANDLER` |
| Function Module BTE | `Z[MOD]_BTE_[NUMERO_EVENTO]_[DESCRICAO]` | `ZFI_BTE_00001020_POSTING` |
| Enhancement (CMOD) | `Z[MOD]_[TRANSACAO]_[DESCRICAO]` | `ZSD_VA01_PRICING` |

---

## 6. Checklist ao Criar um Enhancement

```
[ ] Existe BADI disponível para o caso? → Preferir BADI a User Exit
[ ] Existe BTE para eventos FI/CO?      → Usar BTE para eventos financeiros
[ ] Código de negócio está em classe?   → NUNCA lógica dentro do exit/BADI diretamente
[ ] Classe tem responsabilidade única?  → SOLID S — um handler por funcionalidade
[ ] Classe é testável com ABAP Unit?    → Injetar dependências via construtor
[ ] Nomenclatura segue o padrão?        → Ver tabela acima
[ ] Enhancement está documentado?       → Comentário mínimo: propósito e ticket/demanda
[ ] Enhancement tem tratamento de erro? → TRY/CATCH na classe, nunca deixar DUMP no exit
[ ] Está ativo no ambiente correto?     → Verificar em DEV/QAS/PRD (CMOD, SE19, FIBF)
```

---

## 7. LUW — Logical Unit of Work em Enhancements

> **Risco crítico:** usar `COMMIT WORK` ou `ROLLBACK WORK` dentro de um enhancement **quebra a sequência de save do SAP**, podendo causar inconsistência de dados, locks não liberados e comportamento imprevisível na transação.

### Por que é perigoso

O SAP gerencia a gravação de dados através de uma LUW (unidade lógica de trabalho). A sequência é:

```
Transação SAP (ex: VA01)
  │
  ├── Dialog Work Process (tela, validações, enriquecimentos)
  │     └── Enhancement / Exit / BADI executam AQUI
  │
  └── Update Work Process (gravação real no banco)
        └── COMMIT WORK do SAP dispara aqui
```

Se você emitir `COMMIT WORK` dentro de um exit/BADI/BTE **antes** do SAP fazê-lo:
- Dados parciais são gravados — o SAP ainda não terminou de preparar todos os objetos
- O `ROLLBACK` subsequente do SAP (em caso de erro) **não consegue desfazer** o que já foi commitado
- Locks de enqueue são liberados prematuramente — outro usuário pode modificar o mesmo objeto
- Tabelas Z ficam gravadas enquanto tabelas standard são revertidas → **inconsistência permanente**

### Regra

```
NUNCA usar COMMIT WORK / ROLLBACK WORK dentro de:
  - User Exits (CMOD/SMOD)
  - BADIs
  - BTEs
  - Enhancement Spots
  - Function Modules de exit (EXIT_*)
```

### O que fazer ao invés de COMMIT WORK

**Opção 1 — UPDATE TASK (para gravações Z independentes)**
Quando precisar gravar dados Z como parte do mesmo LUW do SAP, registrar a gravação para execução via update task — ela é disparada junto com o COMMIT do SAP.

```abap
" Na classe de negócio chamada pelo exit — NÃO fazer COMMIT aqui
METHOD on_save.
  " Preparar dados para gravação
  DATA(ls_log) = VALUE zfit_enhancement_log(
    order_id   = iv_order_id
    changed_by = sy-uname
    changed_at = sy-datum ).

  " Registrar para gravação via update task — executa no COMMIT do SAP
  CALL FUNCTION 'ZFICL_SAVE_LOG' IN UPDATE TASK
    EXPORTING is_log = ls_log.
  " O COMMIT WORK é feito pela transação SAP, não por nós
ENDMETHOD.
```

**Opção 2 — Acumular e gravar no BTE Publish (pós-save)**
Para BTEs do tipo Publish (00002xxx), o evento é disparado **após** o commit do SAP — aqui é seguro gravar dados Z com COMMIT próprio, pois o LUW SAP já foi encerrado.

```abap
FUNCTION zfi_bte_00002020_after_post.
  " BTE Publish: SAP já fez COMMIT — seguro gravar dados Z próprios
  NEW zficl_bte_after_post( )->handle_and_save( is_header = i_fkkvk ).
ENDFUNCTION.
```

```abap
CLASS zficl_bte_after_post DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS: handle_and_save IMPORTING is_header TYPE fkkvk.
ENDCLASS.

CLASS zficl_bte_after_post IMPLEMENTATION.
  METHOD handle_and_save.
    " Aqui é seguro — SAP já commitou
    INSERT zfit_my_log FROM VALUE #(
      bukrs      = is_header-bukrs
      belnr      = is_header-belnr
      created_at = sy-datum ).
    COMMIT WORK.  " Permitido apenas em Publish BTE (pós-commit SAP)
  ENDMETHOD.
ENDCLASS.
```

**Opção 3 — Verificar se realmente precisa de gravação no exit**
Na maioria dos casos, exits de enriquecimento apenas **modificam estruturas em memória** — o SAP grava tudo junto no seu COMMIT. Não é necessário nenhum COMMIT Z.

```abap
" Correto — apenas enriquece dados em memória, SAP grava junto
METHOD enrich_order_data.
  cs_vbak-zzcustom_field = calculate_value( cs_vbak ).
  " Sem COMMIT — o SAP cuida disso
ENDMETHOD.
```

### Resumo por tipo de enhancement

| Tipo | COMMIT WORK permitido? | Observação |
|------|----------------------|------------|
| User Exit (CMOD) | ❌ Nunca | Está dentro do LUW da transação |
| BADI | ❌ Nunca | Está dentro do LUW da transação |
| BTE Process (00001xxx) | ❌ Nunca | Está dentro do LUW do posting |
| BTE Publish (00002xxx) | ⚠️ Com cuidado | SAP já commitou — dados Z próprios OK |
| UPDATE TASK function | ✅ Sim | É o mecanismo correto para gravação no LUW |
| Enhancement Spot | ❌ Nunca | Contexto depende do programa, mas nunca assumir seguro |

---

## 8. Antipadrões a Evitar

| Antipadrão | Problema | Solução |
|-----------|----------|---------|
| `COMMIT WORK` dentro de exit/BADI/BTE Process | Quebra sequência de save, inconsistência de dados | UPDATE TASK ou gravar apenas em BTE Publish |
| `ROLLBACK WORK` dentro de exit | Desfaz dados do SAP parcialmente gravados | Lançar exceção / retornar sy-subrc — deixar o SAP decidir |
| Lógica de negócio inline no exit | Impossível testar, difícil manter | Delegar para classe |
| `SELECT` direto no ponto de saída | Performance, dificulta rastreio | Encapsular no método da classe |
| Múltiplas responsabilidades em uma BADI | Viola SOLID S | Separar em classes especializadas |
| Ignorar exceções (`CATCH cx_root.`) silenciosamente | Erros ocultos | Logar ou relançar com contexto |
| Modificar tabela standard dentro do exit sem backup | Dados corrompidos | Trabalhar em cópia local |
| BTE sem registro na FIBF | Enhancement não executa | Sempre registrar produto e evento |
| Gravar tabela Z com `INSERT/MODIFY` direto no exit sem UPDATE TASK | Tabela Z gravada, standard revertido = inconsistência | Usar UPDATE TASK ou BTE Publish |
