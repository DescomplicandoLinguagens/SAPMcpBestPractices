# Boas Práticas ABAP no S/4HANA

Este guia foca nas funcionalidades modernas do ABAP (7.40+) e otimizações para HANA.

## 1. Sintaxe ABAP Moderna (7.40+)

Aproveite as novas funcionalidades para deixar o código mais conciso.

### Declarações Inline

Evite declarações de dados no topo da rotina quando possível.

```abap
" Antes
DATA: lv_name TYPE string.
lv_name = 'SAP'.

" Depois
DATA(lv_name) = 'SAP'.
```

### Operadores de Construtor

Utilize `VALUE`, `CORRESPONDING`, `COND`, `SWITCH`, etc.

```abap
" VALUE para estruturas
DATA(ls_data) = VALUE ty_data( id = 1 name = 'Test' ).

" VALUE para tabelas internas
DATA(lt_data) = VALUE ty_t_data(
  ( id = 1 name = 'A' )
  ( id = 2 name = 'B' )
).
```

### Loops com Referência ou Assign

Para performance em loops grandes, prefira `ASSIGNING FIELD-SYMBOL` ou `REFERENCE INTO`.

```abap
LOOP AT lt_large_table ASSIGNING FIELD-SYMBOL(<fs_line>).
  <fs_line>-status = 'X'.
ENDLOOP.

LOOP AT lt_large_table REFERENCE INTO DATA(rf_line).
  rf_line->status = 'X'.
ENDLOOP.
```

## 2. Performance e Banco de Dados (HANA)

### SELECTs Otimizados

- Selecione apenas as colunas necessárias (`SELECT col1, col2...`).
- Evite `SELECT *` a menos que realmente precise de todas as colunas.
- Utilize `INTO TABLE` para buscar múltiplos registros de uma vez.
- Prefira JOINS a `FOR ALL ENTRIES` quando possível e performático.
- Procure utilizar o code pushdown quando possível.
- Transforme selects complexos em CDSs.

## 3. Documentação de Padrões: S/4HANA & HANA Native

### 1. Core Data Services (CDS)

As CDS Views devem ser organizadas em camadas seguindo o princípio do **Virtual Data Model (VDM)**.

#### 1.1. Camadas de Desenvolvimento (VDM)

| Camada          | Prefixo        | Descrição                                                                                                                  |
| :-------------- | :------------- | :------------------------------------------------------------------------------------------------------------------------- |
| **Basic**       | `ZI_`          | Views básicas criadas apenas com os campos preenchidos no ambiente (ex: se a BSEG usa 20 colunas, criar apenas com as 20). |
| **Composite**   | `ZI_` ou `ZR_` | **ZI** para quando há reutilização; **ZR** quando restrito a um contexto de negócio.                                       |
| **Consumption** | `ZC_`          | Camada de consumo final para a UI.                                                                                         |

#### 1.2. Padrões Adicionais de CDS

- **Search Help**: Para CDS utilizadas como Search Help, utilizar o sufixo `_SH` (ex: `ZI_SD_PEDIDO_SH`).
- **Access Control (DCL)**: Deve utilizar o **mesmo nome** da View de dados à qual se refere.
- **Metadata Extension**: Utilizar exatamente o **mesmo nome** da CDS a que se refere.

### 2. Objetos HANA e AMDP

Nomenclatura para objetos que executam lógica diretamente no banco de dados.

| Objeto                      | Padrão de Nome                                                        |
| :-------------------------- | :-------------------------------------------------------------------- |
| **Table Function (AMDP)**   | `ZTB_[MD]_[Descrição]`                                                |
| **Classe de Implementação** | `ZCL_[MD]_[Descrição]`                                                |
| **Método AMDP**             | Deve iniciar com `AMDP_` seguido da ação (ex: `AMDP_GET_DATA`).       |
| **Calculation View**        | A external view no dicionário deve seguir o padrão `ZEXV[MD]_[Nome]`. |

### 3. Comunicação e Serviços (OData)

Padrões para exposição de dados via Gateway ou RAP.

#### 3.1. Service Definition & Binding

- **Service Definition**: `ZUI_[MD]_[Desc]` para UI5 ou `ZAPI_[MD]_[Desc]` para APIs externas.
- **Service Binding**:
  - **OData V2 (UI5)**: `ZUI_[MD]_[Desc]_02`
  - **OData V4 (UI5)**: `ZUI_[MD]_[Desc]_04`
  - **OData V2 (API)**: `ZAPI_[MD]_[Desc]_02`

#### 3.2. Projeto SEGW (Classic OData)

- **Projeto**: `Z[MD]_[Descrição]`
- **Classes Geradas**: Ao gerar classes via SEGW, os nomes devem ser alterados manualmente para o padrão:
  - `ZCL[MD]_[Desc]_MPC_EXT`
  - `ZCL[MD]_[Desc]_DPC_EXT`

### 4. Integrações via SPROXY

- **Prefixo de Geração**: Todos os objetos gerados via SPROXY devem utilizar o prefixo `Z[MD]_` no momento da criação da Interface de Serviço.
- **Nota**: Objetos gerados automaticamente pelo proxy podem ter prefixos diferentes do padrão ABAP Doc, mas devem ser mantidos conforme a geração automática para evitar erros de ativação.

## 5. Diretrizes Clean ABAP (S/4HANA Moderno)

Baseado no guia [SAP Clean ABAP](https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md).

### Variáveis e Strings

- **Declaração Inline**: Sempre prefira `DATA(var) = ...` onde a variável é usada pela primeira vez.
- **Escopo**: Variáveis não devem ser usadas fora do bloco onde foram declaradas (ex: variável declarada dentro de `LOOP` não deve ser acessada fora).
- **Literais**:
  - Use crase `` `Texto` `` para strings (`string`).
  - Use aspas simples `'Texto'` apenas para `char` fixo de tamanho definido (legado).
  - Use templates `|Texto { var }|` para concatenação.

### Tabelas Internas

- **Chaves**: Evite `WITH DEFAULT KEY`. Sempre especifique a chave (`WITH EMPTY KEY` ou chaves explícitas).
- **Inserção**: Prefira `INSERT ... INTO TABLE` em vez de `APPEND TO`.
- **Verificação**: Prefira `line_exists( ... )` em vez de `READ TABLE ... TRANSPORTING NO FIELDS`.
- **Leitura**: Prefira `try. result = itab[ ... ]. catch cx_sy_itab_line_not_found. endtry.` para leituras simples.

### Nomenclatura Moderna (Opcional/Clean)

O Clean ABAP sugere **abandonar a Notação Húngara** (prefixos de tipo como `lv_`, `gt_`) em favor de nomes descritivos, pois os IDEs modernos (Eclipse/ADT) já mostram os tipos.
_Nota: Siga o padrão do projeto (se Classic ou Modern)._

- **Preferir**: `customer_name`, `invoice_items`.
- **Evitar**: `lv_kunnr`, `lt_vbap`.

### Métodos e Classes

- **Booleanos**: Use `xsdbool( )` para setar variáveis booleanas e métodos que retornam booleanos (`is_valid`, `has_error`).
- **Tamanho**: Métodos devem ser curtos e fazer apenas uma coisa (Single Responsibility).
