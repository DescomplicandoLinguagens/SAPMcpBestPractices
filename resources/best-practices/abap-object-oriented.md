# ABAP OOP — Boas Práticas para IA

> Referência objetiva para geração e revisão de código ABAP orientado a objetos.
> Aplica conceitos de classes locais, globais, interfaces, modificadores e princípios SOLID.

---

## 1. Classes Locais vs. Globais

### Classe Local
- Definida dentro de um programa ABAP (`REPORT`, `FUNCTION GROUP`, `INCLUDE`).
- Visível **apenas** dentro do próprio programa.
- Declarada no `CLASS DEFINITION` e implementada no `CLASS IMPLEMENTATION` do mesmo source.
- **Quando usar:** lógica auxiliar, helpers internos, testes unitários locais (ABAP Unit), protótipos rápidos.
- **Onde NÃO usar:** quando a lógica precisar ser reutilizada em outros programas — extraia para classe global.

```abap
CLASS lcl_helper DEFINITION.
  PUBLIC SECTION.
    METHODS: format_date IMPORTING iv_date TYPE d RETURNING VALUE(rv_result) TYPE string.
ENDCLASS.

CLASS lcl_helper IMPLEMENTATION.
  METHOD format_date.
    rv_result = |{ iv_date+6(2) }.{ iv_date+4(2) }.{ iv_date(4) }|.
  ENDMETHOD.
ENDCLASS.
```

### Classe Global
- Criada na **SE24** (Class Builder) ou via ADT (Eclipse).
- Armazenada como objeto de repositório — reutilizável em qualquer programa.
- Possui includes gerados automaticamente: `CPUB`, `CPRO`, `CPRI`, `CIMP`, `CCMAC`, `CTEST`.
- **Quando usar:** serviços de negócio, utilitários transversais, implementações de BAdI, handlers de eventos.
- Siga o padrão de nomenclatura do projeto (ex.: `ZCL_`, `YCL_`).

---

## 2. Visibilidade: PUBLIC, PROTECTED, PRIVATE

| Seção       | Acessível de                          | Uso ideal                                      |
|-------------|---------------------------------------|------------------------------------------------|
| `PUBLIC`    | Qualquer lugar                        | Interface pública da classe (contrato)         |
| `PROTECTED` | Classe própria + subclasses           | Extensão controlada por herança                |
| `PRIVATE`   | Apenas a própria classe               | Encapsulamento de detalhes de implementação    |

**Regra:** exponha o mínimo necessário. Comece `PRIVATE`, promova apenas quando houver motivo claro.

**Objetos imutáveis (Immutable):** para objetos que nunca mudam após a construção, prefira atributos públicos `READ-ONLY` a métodos getter — mais simples e sem overhead:

```abap
" Preferido — imutável com READ-ONLY
CLASS zcl_order_key DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS constructor IMPORTING iv_id TYPE vbeln iv_year TYPE gjahr.
    DATA order_id TYPE vbeln READ-ONLY.
    DATA fiscal_year TYPE gjahr READ-ONLY.
ENDCLASS.

" Anti-pattern — getters desnecessários para imutável
CLASS zcl_order_key DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS get_order_id    RETURNING VALUE(rv_id)   TYPE vbeln.
    METHODS get_fiscal_year RETURNING VALUE(rv_year) TYPE gjahr.
  PRIVATE SECTION.
    DATA mv_order_id    TYPE vbeln.
    DATA mv_fiscal_year TYPE gjahr.
ENDCLASS.
```

> **Atenção:** `READ-ONLY` só funciona na `PUBLIC SECTION` e ainda permite modificação pela própria classe e subclasses. Para objetos que **têm** valores mutáveis, não use atributos públicos — use métodos.

```abap
CLASS zcl_order DEFINITION PUBLIC CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS: calculate_total RETURNING VALUE(rv_total) TYPE decfloat34.

  PROTECTED SECTION.
    METHODS: apply_discount IMPORTING iv_rate TYPE p.

  PRIVATE SECTION.
    DATA: mv_items TYPE STANDARD TABLE OF zs_order_item.
ENDCLASS.
```

---

## 3. Instâncias vs. Estáticos

### Métodos e Atributos de Instância
- Pertencem a um objeto criado com `CREATE OBJECT` / `NEW`.
- Mantêm estado individual por objeto.
- **Usar quando:** o comportamento depende de dados específicos de cada objeto (pedido, cliente, documento).

### Métodos e Atributos Estáticos (`CLASS-DATA`, `CLASS-METHODS`)
- Pertencem à **classe**, não à instância — compartilhados por todos.
- Acessados com `zcl_classe=>metodo( )`.
- **Usar quando:** utilitários puros (conversão, formatação), factories, singletons, constantes.
- **Evitar:** estado mutável estático compartilhado — cria acoplamento oculto e dificulta testes.

```abap
CLASS zcl_currency_util DEFINITION PUBLIC FINAL CREATE PRIVATE.
  PUBLIC SECTION.
    CLASS-METHODS:
      convert
        IMPORTING iv_amount   TYPE decfloat34
                  iv_from_cur TYPE waers
                  iv_to_cur   TYPE waers
        RETURNING VALUE(rv_result) TYPE decfloat34.
ENDCLASS.
```

---

## 4. Interfaces

- Definem um **contrato** sem implementação.
- Permitem polimorfismo sem herança de implementação.
- Nome padrão: `ZIF_`, `YIF_`.
- Uma classe pode implementar **múltiplas** interfaces.
- **Quando usar:** sempre que dois ou mais objetos distintos precisarem ser tratados de forma uniforme, ou quando quiser desacoplar o chamador da implementação concreta.

```abap
INTERFACE zif_notifier.
  METHODS: send IMPORTING is_message TYPE zs_notification.
ENDINTERFACE.

CLASS zcl_email_notifier DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    INTERFACES: zif_notifier.
ENDCLASS.

CLASS zcl_sms_notifier DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    INTERFACES: zif_notifier.
ENDCLASS.
```

> Prefira receber `zif_notifier` como parâmetro ao invés da classe concreta — código desacoplado.

---

## 5. Herança: INHERITING FROM

- Use herança apenas quando a relação **"é um"** for genuína.
- Subclasse pode sobrescrever métodos com `REDEFINITION`.
- Sempre chame `super->method( )` quando necessário preservar comportamento da superclasse.
- **Evite** hierarquias profundas (>2 níveis) — preferir composição.

```abap
CLASS zcl_base_validator DEFINITION PUBLIC ABSTRACT.
  PUBLIC SECTION.
    METHODS: validate IMPORTING iv_value TYPE string RETURNING VALUE(rv_valid) TYPE abap_bool.
  PROTECTED SECTION.
    METHODS: check_not_empty IMPORTING iv_value TYPE string RETURNING VALUE(rv_ok) TYPE abap_bool.
ENDCLASS.

CLASS zcl_email_validator DEFINITION PUBLIC FINAL
  INHERITING FROM zcl_base_validator.
  PUBLIC SECTION.
    METHODS: validate REDEFINITION.
ENDCLASS.
```

---

## 6. ABSTRACT

- Classe que **não pode ser instanciada diretamente**.
- Serve como template/base para subclasses.
- Pode ter métodos abstratos (`ABSTRACT`) — obrigam a subclasse a implementar.
- **Quando usar:** quando há comportamento comum + partes que variam por subtipo (Template Method pattern).

```abap
CLASS zcl_base_report DEFINITION PUBLIC ABSTRACT.
  PUBLIC SECTION.
    METHODS: run.
  PROTECTED SECTION.
    METHODS: fetch_data   ABSTRACT,
             process_data ABSTRACT,
             display_data ABSTRACT.
ENDCLASS.

CLASS zcl_base_report IMPLEMENTATION.
  METHOD run.
    fetch_data( ).
    process_data( ).
    display_data( ).
  ENDMETHOD.
ENDCLASS.
```

---

## 7. FINAL

- Classe ou método que **não pode ser herdado/sobrescrito**.
- Aplique em classes utilitárias, value objects, e implementações que não devem ser estendidas.
- Benefício: sinaliza intenção de design e permite otimizações do compilador.

```abap
CLASS zcl_uuid_generator DEFINITION PUBLIC FINAL CREATE PRIVATE.
  PUBLIC SECTION.
    CLASS-METHODS: generate RETURNING VALUE(rv_uuid) TYPE sysuuid_x16.
ENDCLASS.
```

---

## 8. CREATE PRIVATE / Singleton / Factory

- `CREATE PUBLIC` — qualquer um pode instanciar.
- `CREATE PROTECTED` — apenas a própria classe e subclasses.
- `CREATE PRIVATE` — instanciação controlada — use com factory method ou singleton.

```abap
CLASS zcl_config DEFINITION PUBLIC FINAL CREATE PRIVATE.
  PUBLIC SECTION.
    CLASS-METHODS: get_instance RETURNING VALUE(ro_instance) TYPE REF TO zcl_config.
    METHODS: get_value IMPORTING iv_key RETURNING VALUE(rv_value) TYPE string.
  PRIVATE SECTION.
    CLASS-DATA: mo_instance TYPE REF TO zcl_config.
ENDCLASS.

CLASS zcl_config IMPLEMENTATION.
  METHOD get_instance.
    IF mo_instance IS NOT BOUND.
      mo_instance = NEW #( ).
    ENDIF.
    ro_instance = mo_instance.
  ENDMETHOD.
ENDCLASS.
```

---

## 9. FRIENDS

- Declara outra classe como "amiga" — concede acesso a membros `PRIVATE` e `PROTECTED`.
- **Use com extrema parcimônia** — quebra encapsulamento.
- Casos válidos: classes de teste unitário (ABAP Unit) que precisam injetar dependências privadas, ou duplas de classes estreitamente acopladas por design (ex.: iterator + coleção).

```abap
CLASS zcl_order DEFINITION PUBLIC FRIENDS zcl_order_test.
  PRIVATE SECTION.
    DATA: mv_status TYPE char1.
ENDCLASS.
```

---

## 10. Exceções (cx_*)

- Prefira exceções tipadas (`cx_static_check`, `cx_dynamic_check`, `cx_no_check`) a `SY-SUBRC`.
- `cx_static_check` — o chamador é forçado a tratar (checked).
- `cx_dynamic_check` — declarada mas não obriga tratamento (unchecked runtime).
- `cx_no_check` — erros graves/não recuperáveis.
- Crie hierarquias de exceção de negócio: `zcx_order_error` → `zcx_order_not_found`.

```abap
CLASS zcx_order_not_found DEFINITION PUBLIC INHERITING FROM cx_static_check.
  PUBLIC SECTION.
    DATA: mv_order_id TYPE vbeln.
    METHODS: constructor IMPORTING iv_order_id TYPE vbeln.
ENDCLASS.
```

---

## 11. Princípios SOLID em ABAP

### S — Single Responsibility
Cada classe tem **uma razão para mudar**.
❌ `zcl_order_processor` que busca dados, valida, persiste e envia e-mail.
✅ Separe: `zcl_order_repository`, `zcl_order_validator`, `zcl_order_service`, `zcl_order_notifier`.

---

### O — Open/Closed
Aberto para extensão, fechado para modificação.
Use interfaces e herança para adicionar comportamento sem alterar código existente.

```abap
" Ruim: IF/CASE no service para cada tipo de desconto
" Bom: interface zif_discount_strategy com implementações
"      zcl_vip_discount, zcl_seasonal_discount, etc.
```

---

### L — Liskov Substitution
Subclasses devem poder substituir a superclasse sem quebrar o sistema.
- Não enfraqueça pré-condições nem fortaleça pós-condições na subclasse.
- Se a subclasse precisa ignorar ou lançar exceção em método herdado → repense a herança.

---

### I — Interface Segregation
Prefira interfaces pequenas e focadas a interfaces "gordas".
❌ `zif_document` com 20 métodos que nenhuma classe implementa por completo.
✅ `zif_document_reader`, `zif_document_writer`, `zif_document_printer` separadas.

---

### D — Dependency Inversion
Dependa de abstrações (interfaces), não de implementações concretas.
Injete dependências via construtor ou setter — facilita mocks em ABAP Unit.

```abap
CLASS zcl_order_service DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS:
      constructor
        IMPORTING
          io_repo     TYPE REF TO zif_order_repository
          io_notifier TYPE REF TO zif_notifier.
  PRIVATE SECTION.
    DATA: mo_repo     TYPE REF TO zif_order_repository,
          mo_notifier TYPE REF TO zif_notifier.
ENDCLASS.

CLASS zcl_order_service IMPLEMENTATION.
  METHOD constructor.
    mo_repo     = io_repo.
    mo_notifier = io_notifier.
  ENDMETHOD.
ENDCLASS.
```

---

## 12. Checklist Rápido ao Criar uma Classe ABAP

```
[ ] É reutilizável entre programas? → Classe Global (SE24/ADT)
[ ] É auxiliar local?               → Classe Local no programa
[ ] Tem uma única responsabilidade? → SOLID S
[ ] Exposição mínima de membros?    → PUBLIC só o necessário
[ ] Depende de abstração?           → Recebe interface, não classe concreta
[ ] Pode ser estendida com segurança? → ABSTRACT + REDEFINITION ou FINAL
[ ] Utilitário puro sem estado?     → CLASS-METHODS + CREATE PRIVATE
[ ] Testa unitariamente?            → ABAP Unit + injeção de dependência
[ ] Exceções tipadas?               → cx_* ao invés de SY-SUBRC
[ ] Herança necessária?             → "é um"? Máx. 2 níveis.
[ ] Objeto imutável?                → Atributos READ-ONLY ao invés de getters
[ ] Parâmetros booleanos?           → Dividir em dois métodos distintos
[ ] RETURNING ou EXPORTING único?   → Nunca misturar tipos de saída
[ ] EXPORTING por referência?       → CLEAR no início do método
[ ] Factory methods nomeados?       → Prefixo new_/create_/construct_ + complemento
```

---

## 13. Antipadrões a Evitar

| Antipadrão                             | Problema                                      | Solução                                 |
|----------------------------------------|-----------------------------------------------|-----------------------------------------|
| God Class                              | Classe faz tudo                               | Separar responsabilidades (SOLID S)     |
| Herança por reuso de código            | Acoplamento rígido, LSP violado               | Usar composição + interfaces            |
| Atributos estáticos mutáveis           | Estado global, dificulta testes               | Injeção de dependência                  |
| `FRIENDS` indiscriminado               | Quebra encapsulamento                         | Refatorar design                        |
| SY-SUBRC em vez de exceções            | Erros ignorados silenciosamente               | `cx_*` com mensagens descritivas        |
| Classe com só métodos estáticos        | Namespace glorificado, difícil de testar      | Instanciar + injetar                    |
| Parâmetros booleanos em métodos        | Baixa legibilidade, viola SRP                 | Dois métodos distintos                  |

---

---

## 14. Chamadas de Métodos — Sintaxe Limpa

### Prefira chamadas funcionais a procedurais

```abap
" Correto — chamada funcional
DATA(result) = calculate_total( items ).

modify->update( node           = my_bo=>node-item
                key            = item->key
                data           = item
                changed_fields = changed_fields ).

" Anti-pattern — CALL METHOD procedural (use apenas com dispatch dinâmico)
CALL METHOD modify->update
  EXPORTING
    node           = my_bo=>node-item
    key            = item->key.
```

### Omitir RECEIVING, EXPORTING e nome de parâmetro único

```abap
" Correto — inline compacto
DATA(sum) = aggregate_values( values ).
DATA(unique) = remove_duplicates( list ).

" Anti-pattern — verboso sem necessidade
aggregate_values(
  EXPORTING
    values = values
  RECEIVING
    result = DATA(sum) ).

DATA(unique) = remove_duplicates( list = list ).  " parâmetro único não precisa de nome
```

> Quando o método tem um único parâmetro IMPORTING e ele é evidente, omita o nome. Se o nome ajuda a entender (ex.: `update( asynchronous = abap_true )`), mantenha.

### Omitir me-> ao chamar método ou atributo de instância

```abap
" Correto
DATA(result) = aggregate_values( values ).

" Anti-pattern — me-> desnecessário
DATA(result) = me->aggregate_values( me->values ).
```

> Use `me->` apenas quando há conflito de escopo entre variável local e atributo de instância:
> ```abap
> me->logger = logger.   " necessário: parâmetro e atributo têm o mesmo nome
> ```

### Chamar métodos estáticos pela classe, não pela instância

```abap
" Correto
cl_uuid_generator=>generate( ).

" Anti-pattern
lo_instance->generate( ).   " generate é CLASS-METHOD — use =>
```

---

## 15. Corpo do Método — Design Interno

### Um método faz uma coisa, bem e apenas ela

Indicadores de que um método faz **uma** coisa:
- Poucos parâmetros IMPORTING (ideal ≤ 3)
- Sem parâmetros booleanos
- Exatamente um parâmetro de saída
- ≤ 20 instruções (ideal 3–5)
- Todas as instruções no mesmo nível de abstração

### Foco: happy path **ou** tratamento de erro — nunca os dois misturados

```abap
" Anti-pattern — lógica de negócio misturada com validação
METHOD append_xs.
  IF input > 0.
    DATA(remainder) = input.
    WHILE remainder > 0.
      result = result && `X`.
      remainder = remainder - 1.
    ENDWHILE.
  ELSEIF input = 0.
    RAISE EXCEPTION NEW zcx_invalid_input( ).
  ELSE.
    RAISE EXCEPTION NEW cx_sy_illegal_argument( ).
  ENDIF.
ENDMETHOD.

" Correto — validação separada em método próprio
METHOD append_xs.
  validate_input( input ).
  DATA(remainder) = input.
  WHILE remainder > 0.
    result = result && `X`.
    remainder = remainder - 1.
  ENDWHILE.
ENDMETHOD.

METHOD validate_input.
  IF input = 0.
    RAISE EXCEPTION NEW zcx_invalid_input( ).
  ENDIF.
  IF input < 0.
    RAISE EXCEPTION NEW cx_sy_illegal_argument( ).
  ENDIF.
ENDMETHOD.
```

### Descer apenas um nível de abstração por método

```abap
" Correto — método orquestra chamadas no mesmo nível de abstração
METHOD create_and_publish.
  post = create_post( user_input ).
  post->publish( ).
ENDMETHOD.

" Anti-pattern — mistura alto nível (publish) com baixo nível (trim/to_upper)
METHOD create_and_publish.
  post = NEW blog_post( ).
  DATA(user_name) = trim( to_upper( sy-uname ) ).
  post->set_author( user_name ).
  post->publish( ).
ENDMETHOD.
```

### Manter métodos pequenos

- **Ideal:** 3–5 instruções
- **Máximo:** ~20 instruções
- Se o método precisa de muitas declarações `DATA` up-front → sinal de que faz coisas demais

---

## 16. Controle de Fluxo

### Falhar rápido (Fail Fast)

Valide e lance exceção o mais cedo possível — antes de operações custosas:

```abap
" Correto — valida logo no início
METHOD process.
  IF iv_input IS INITIAL.
    RAISE EXCEPTION NEW cx_sy_illegal_argument( ).
  ENDIF.
  DATA(lo_obj) = build_expensive_object_from( iv_input ).
  rv_result = lo_obj->calculate( ).
ENDMETHOD.

" Anti-pattern — valida tarde, depois de trabalho caro
METHOD process.
  DATA(lo_obj) = build_expensive_object_from( iv_input ).
  IF lo_obj IS NOT BOUND.
    RAISE EXCEPTION NEW cx_sy_illegal_argument( ).
  ENDIF.
  rv_result = lo_obj->calculate( ).
ENDMETHOD.
```

### CHECK vs. RETURN na inicialização do método

Prefira `IF ... RETURN.` ao `CHECK` — intenção mais explícita:

```abap
" Preferido — intenção explícita
METHOD read_customizing.
  IF keys IS INITIAL.
    RETURN.
  ENDIF.
  " lógica principal
ENDMETHOD.

" Aceitável mas menos claro
METHOD read_customizing.
  CHECK keys IS NOT INITIAL.
  " lógica principal
ENDMETHOD.

" Anti-pattern — nesting desnecessário
METHOD read_customizing.
  IF keys IS NOT INITIAL.
    " lógica principal
  ENDIF.
ENDMETHOD.
```

### Não use CHECK fora da inicialização do método

`CHECK` dentro de `LOOP` continua para a próxima iteração (não sai do método). Use `IF ... CONTINUE.`:

```abap
" Correto — dentro de loop
LOOP AT lt_items INTO DATA(ls_item).
  IF ls_item-active = abap_false.
    CONTINUE.
  ENDIF.
  process_item( ls_item ).
ENDLOOP.

" Anti-pattern — CHECK em loop confunde: sai do loop ou do método?
LOOP AT lt_items INTO DATA(ls_item).
  CHECK ls_item-active = abap_true.
  process_item( ls_item ).
ENDLOOP.
```

---

## 17. Design de Parâmetros de Métodos

### Tipos de parâmetro de saída

- Preferir `RETURNING` a `EXPORTING` — permite chamada funcional e method chaining
- Usar **apenas um** tipo de saída por método: `RETURNING` **ou** `EXPORTING` **ou** `CHANGING`, nunca combinados
- `RETURNING` tabelas grandes é aceitável (kernel ABAP otimiza o repasse)
- `CHANGING` apenas quando uma variável local já preenchida precisa ser atualizada parcialmente

```abap
" Correto — RETURNING para saída única
METHODS calculate_discount
  IMPORTING iv_amount   TYPE decfloat34
  RETURNING VALUE(rv_discount) TYPE decfloat34.

" Anti-pattern — mistura de tipos de saída
METHODS calculate_discount
  IMPORTING  iv_amount      TYPE decfloat34
  RETURNING  VALUE(rv_disc) TYPE decfloat34
  EXPORTING  ev_error_flag  TYPE abap_bool.   " <— errado
```

### Parâmetros booleanos — dividir em dois métodos

Parâmetros booleanos geralmente indicam que o método faz **duas coisas**. Divida:

```abap
" Anti-pattern — booleano obscurece a intenção
METHODS update IMPORTING iv_save TYPE abap_bool.
update( abap_true ).  " o que significa true aqui?

" Correto — dois métodos com nomes descritivos
METHODS update_without_saving.
METHODS update_and_save.
```

### Nomear o parâmetro RETURNING como RESULT (ou rv_result)

Se o nome do método já é descritivo o suficiente, use simplesmente `rv_result` (ou `result`) para o `RETURNING`. Nomes que repetem o método criam conflito com atributos da classe:

```abap
" Anti-pattern — nome do retorno conflita com atributo
METHODS get_name RETURNING VALUE(name) TYPE string.
METHOD get_name.
  name = me->name.  " ambíguo: me-> necessário
ENDMETHOD.

" Correto — usar rv_result evita o conflito
METHODS get_name RETURNING VALUE(rv_result) TYPE string.
METHOD get_name.
  rv_result = mv_name.
ENDMETHOD.
```

### Parâmetros EXPORTING por referência — limpar antes de usar

Parâmetros `EXPORTING` por referência (sem `VALUE`) apontam para memória existente — podem conter dados do chamador. Limpe-os explicitamente no início:

```abap
METHODS get_result
  EXPORTING result TYPE zs_result.

METHOD get_result.
  CLEAR result.   " garante estado limpo
  " ... preenche result
ENDMETHOD.
```

> Parâmetros `VALUE(...)` já são áreas de memória novas e vazias — **não** precisam de `CLEAR`.

### Métodos factory — nomes descritivos com prefixo new_/create_/construct_

```abap
" Correto — prefixo + complemento descritivo
CLASS-METHODS create_from_template  IMPORTING io_template TYPE REF TO zif_order.
CLASS-METHODS create_empty          RETURNING VALUE(ro_result) TYPE REF TO zcl_order.
CLASS-METHODS new_from_id           IMPORTING iv_id TYPE vbeln.

" Anti-pattern
CLASS-METHODS create_1 IMPORTING ...
CLASS-METHODS create_2 IMPORTING ...
```

---

> **Resumo de ouro:** use interfaces para contratos, `PRIVATE` por padrão, `FINAL` quando não for herdar, `ABSTRACT` para templates, `CREATE PRIVATE` para factories/singletons, e injete dependências pelo construtor. SOLID não é teoria — é a forma de manter o sistema SAP evolutivo e testável.
