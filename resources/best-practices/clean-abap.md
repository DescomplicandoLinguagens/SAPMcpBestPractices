## Clean ABAP

> Adoção do Clean Code de Robert C. Martin para ABAP. Referência para geração e revisão de código limpo, moderno e testável em SAP.

---

## Names

- **Use descriptive names** — nome deve revelar intenção, não tipo ou codificação técnica
- Prefer solution domain and problem domain terms (ex.: `queue`, `ledger`, `account`)
- **Use plural** for collections: `countries` não `country`, `orders` não `order_tab`
- Use pronounceable names — `detection_object_types`, não `dobjt`
- **Use snake_case** — mesmo quando próximo do limite de 30 chars; abrevie palavras menos importantes
- Avoid abbreviations (exceto as padronizadas no projeto — ver `abap-nomenclaturas.md`)
- Use the same abbreviations consistently everywhere — escolha um termo e mantenha
- **Use nouns for classes, verbs for methods** — Boolean methods com `is_` / `has_` prefixo
- **Avoid noise words** such as "data", "info", "object" — `account` ao invés de `account_data`
- **Pick one word per concept** — não misture `read`, `retrieve`, `query` para a mesma ação
- Use pattern names only if you actually mean and implement that pattern (Factory, Observer, etc.)
- Avoid obscuring built-in functions with your own method names (`lines`, `condense`, `strlen`, etc.)

```abap
" Bom — nomes descritivos
CONSTANTS max_wait_time_in_seconds TYPE i VALUE 30.
DATA customizing_entries TYPE STANDARD TABLE OF zs_customizing.
METHODS read_user_preferences IMPORTING iv_user TYPE uname.
CLASS zcl_user_preference_reader DEFINITION ...

" Anti-pattern — nomes técnicos sem significado
CONSTANTS sysubrc_04 TYPE sysubrc VALUE 4.
DATA iso3166tab TYPE STANDARD TABLE OF t005.
METHODS read_t005.
CLASS zcl_t005_reader DEFINITION ...
```

```abap
" Bom — substantivo para classe, verbo para método, is_ para booleano
CLASS zcl_order_validator ...
METHODS validate_header.
METHODS is_complete RETURNING VALUE(rv_result) TYPE abap_bool.

" Bom — uma palavra por conceito
METHODS read_order.
METHODS read_item.
METHODS read_header.

" Anti-pattern — sinônimos criam confusão
METHODS read_order.
METHODS retrieve_item.
METHODS query_header.
```

> **Nota para IA:** respeitar sempre os prefixos definidos em `abap-nomenclaturas.md` (lv_, lt_, lo_, iv_, rv_, etc.). Eles são obrigatórios neste projeto.

## Language

- Mind the legacy – balance modernization with readability and maintainability
- Mind the performance – clean code should not come at unacceptable cost
- Prefer object orientation to procedural programming
- Prefer functional to procedural language constructs
- Avoid obsolete language elements (`MOVE`, `WRITE TO`, `COMPUTE`, `ADD ... TO`, etc.)
- Use design patterns wisely – only when they clearly improve the code
- Prefer ABAP 7.40+ syntax: inline declarations `DATA(...)`, string templates `|...|`, `NEW #( )`, `VALUE #( )`

## Constants

- Use constants instead of magic numbers and magic strings
- Constants also need descriptive names
- Prefer ENUM (or enumeration classes) to constants interfaces
- If ENUM or enumeration patterns are not used, group related constants logically

```abap
" Ruim
IF lv_status = '01'.

" Bom — usar constante ou enum
CONSTANTS: c_status_open TYPE char2 VALUE '01'.
IF lv_status = c_status_open.
```

## Variables

- Prefer inline declarations to up-front declarations (`DATA(lv_result) = method( )`)
- Do not use variables outside of the statement block they are declared in
- Do not chain up-front declarations
- Do not use field symbols for dynamic data access unless truly necessary
- Choose the right targets for your loops (e.g. TABLE or ASSIGNING)
- Use `FINAL` for variables that should not be reassigned (ABAP 7.56+): `FINAL(lv_result) = ...`

```abap
" Preferido — inline declaration
DATA(lo_order) = NEW zcl_order( iv_id = lv_id ).
DATA(lt_items) = lo_order->get_items( ).

" Loop com referência (evita cópia)
LOOP AT lt_items REFERENCE INTO DATA(lr_item).
  lr_item->quantity += 1.
ENDLOOP.

" Loop com ASSIGNING quando precisar modificar
LOOP AT lt_items ASSIGNING FIELD-SYMBOL(<lfs_item>).
  <lfs_item>-status = c_status_open.
ENDLOOP.
```

## Tables

- Use the right table type for the use case
- Avoid DEFAULT KEY
- Prefer INSERT INTO TABLE to APPEND TO
- Prefer LINE_EXISTS to READ TABLE or LOOP AT when checking existence
- Prefer READ TABLE to LOOP AT when reading a single entry
- Prefer LOOP AT … WHERE to nested IF inside LOOP
- Avoid unnecessary table reads
- Use HASHED TABLE for lookups por chave única (acesso O(1))
- Use SORTED TABLE quando precisar de leitura por faixa ou binary search

```abap
" Tipo de tabela adequado ao uso
DATA: lt_orders   TYPE STANDARD TABLE OF zs_order WITH EMPTY KEY,
      lht_config  TYPE HASHED TABLE  OF zs_config WITH UNIQUE KEY id,
      lst_items   TYPE SORTED TABLE  OF zs_item   WITH UNIQUE KEY order_id line_id.

" LINE_EXISTS ao invés de READ TABLE apenas para checar
IF line_exists( lt_orders[ order_id = lv_id ] ).
  ...
ENDIF.

" Leitura direta sem SY-SUBRC
DATA(ls_order) = lt_orders[ order_id = lv_id ].

" LOOP com WHERE ao invés de IF aninhado
LOOP AT lt_items ASSIGNING FIELD-SYMBOL(<lfs_item>) WHERE status = c_status_open.
  ...
ENDLOOP.
```

## Strings

- Use `` ` `` to define string literals (não `'` para strings)
- Use `|` to assemble text (string templates)

```abap
DATA(lv_msg) = |Order { lv_id } created on { lv_date DATE = USER }|.
```

## Booleans

- Use Booleans wisely – only for true yes/no decisions
- Use `abap_bool` for Boolean variables
- Use `abap_true` and `abap_false` for comparisons
- Use `xsdbool` to set Boolean variables from conditions

```abap
DATA(lv_is_valid) = xsdbool( lv_amount > 0 AND lv_status = c_status_open ).
```

## Conditions

- Try to make conditions positive
- Prefer `IS NOT` to `NOT IS`
- Consider using predicative method calls for Boolean methods
- Consider decomposing complex conditions into helper variables or methods
- Consider extracting complex conditions into appropriately named methods

## Ifs

- No empty IF branches
- Prefer CASE to ELSE IF chains for multiple alternative conditions
- Keep the nesting depth low (máx. 3 níveis)

```abap
" Ruim — ELSE IF chain
IF lv_type = 'A'.
ELSEIF lv_type = 'B'.
ELSEIF lv_type = 'C'.
ENDIF.

" Bom — CASE
CASE lv_type.
  WHEN 'A'. ...
  WHEN 'B'. ...
  WHEN 'C'. ...
ENDCASE.
```

## Regular expressions

- Prefer simpler methods to regular expressions when possible
- Prefer basis checks to regular expressions when sufficient
- Consider assembling complex regular expressions from smaller, named parts

## Classes

### Object orientation

- Prefer objects to static classes
- Prefer composition to inheritance
- Don't mix stateful and stateless behavior in the same class

### Scope

- Global by default, local only where appropriate
- Use `FINAL` if the class is not designed for inheritance
- Members `PRIVATE` by default, `PROTECTED` only if really needed
- Consider using immutable objects instead of getters
- Use `READ-ONLY` sparingly

### Constructors

- Prefer `NEW` to `CREATE OBJECT`
- If a global class is `CREATE PRIVATE`, leave the `CONSTRUCTOR` public
- Prefer multiple static creation methods to optional parameters
- Use descriptive names for multiple creation methods
- Make singletons only where multiple instances genuinely don't make sense

```abap
" Preferido
DATA(lo_order) = NEW zcl_order( iv_id = lv_order_id ).

" Factory method quando construção é complexa
DATA(lo_report) = zcl_sales_report=>create_for_period(
  iv_from = lv_from
  iv_to   = lv_to ).
```

## Methods

### Calls

- Don't call static methods through instance references
- Don't access types through instance references
- Prefer functional to procedural calls
- Omit `RECEIVING` when possible
- Omit the optional keyword `EXPORTING`
- Omit the parameter name in single-parameter calls
- Omit the self-reference `me->` when calling instance attributes or methods

```abap
" Ruim
CALL METHOD lo_order->calculate_total( RECEIVING rv_total = lv_total ).

" Bom
lv_total = lo_order->calculate_total( ).
```

### Object orientation

- Prefer instance methods to static methods
- Public instance methods should usually be part of an interface

### Parameter Number

- Aim for few IMPORTING parameters (ideally fewer than three)
- Split methods instead of adding OPTIONAL parameters
- Use `PREFERRED PARAMETER` sparingly
- `RETURN`, `EXPORT`, or `CHANGE` exactly one parameter

### Parameter Types

- Prefer `RETURNING` to `EXPORTING`
- `RETURNING` large tables is usually acceptable
- Use either `RETURNING` or `EXPORTING` or `CHANGING`, but not a combination
- Use `CHANGING` sparingly and only where it clearly fits the semantics

### Parameter Names

- Good method names usually make parameter names (especially `RETURNING`) unnecessary or obvious
- Seguir os prefixos de `abap-nomenclaturas.md`: `iv_`, `it_`, `io_`, `ev_`, `rv_`, etc.

### Method Body

- Do one thing, do it well, do it only
- Focus on the happy path or error handling, but not both
- Descend one level of abstraction
- Keep methods small (ideally < 20 statements, optimal 3–5)

## Control flow

- Fail fast – validate and exit as early as possible
- Prefer `RETURN` for early exit in methods (mais explícito que `CHECK`)
- Avoid `CHECK` outside the initialization section of a method

```abap
METHOD process_order.
  IF iv_order_id IS INITIAL.
    RAISE EXCEPTION TYPE zcx_order_error MESSAGE e001(zfi).
  ENDIF.

  " Happy path continua aqui
  DATA(lo_order) = mo_repo->find( iv_order_id ).
  lo_order->process( ).
ENDMETHOD.
```

## Error Handling

### Messages

- Make messages easy to find via where-used list in SE91 — usar o padrão com `INTO DATA(lv_msg)`:

```abap
" Correto — rastreável via where-used
MESSAGE e001(zfi) INTO DATA(lv_msg).

" Se a variável não for usada, adicionar pragma
MESSAGE e001(zfi) INTO DATA(lv_msg) ##NEEDED.

" Anti-pattern — código inalcançável
IF 1 = 2. MESSAGE e001(zfi). ENDIF.
```

- Use message classes por módulo (ex: `ZFI`, `ZSD`) — ver `abap-nomenclaturas.md`

### Return Codes

- Prefer exceptions to return codes
- Nunca ignorar `SY-SUBRC` silenciosamente — se não usar exceções, verificar e tratar sempre
- Ao chamar BAPIs e FMs legados, traduzir `RETURN` table para exceção:

```abap
CALL FUNCTION 'BAPI_ORDER_CHANGE'
  EXPORTING  order_header_in = ls_header
  TABLES     return          = lt_return.

IF line_exists( lt_return[ type = 'E' ] ) OR
   line_exists( lt_return[ type = 'A' ] ).
  RAISE EXCEPTION NEW zcx_order_error( ).
ENDIF.
```

### Exceptions

- **Exceptions are for errors, not for regular cases** — caso esperado (ex: "não encontrado") = retorno booleano ou OPTIONAL; caso excepcional = exceção
- Use class-based exceptions — nunca `EXCEPTIONS has_error = 1 OTHERS = 2`
- Use own **abstract super classes** para sua hierarquia de exceções:

```abap
" Superclasse abstrata por módulo
CLASS zcx_sd_static_check DEFINITION ABSTRACT INHERITING FROM cx_static_check.
CLASS zcx_sd_no_check     DEFINITION ABSTRACT INHERITING FROM cx_no_check.

" Exceções de negócio herdam da superclasse do módulo
CLASS zcx_order_not_found   DEFINITION INHERITING FROM zcx_sd_static_check.
CLASS zcx_order_invalid_status DEFINITION INHERITING FROM zcx_sd_static_check.
```

- Throw **one type of exception** in most cases — subclasses para distinguir quando necessário:

```abap
" Correto — um tipo + subclasses
METHODS process RAISING zcx_order_error.

TRY.
    lo_service->process( lv_id ).
  CATCH zcx_order_not_found.       " subclasse tratada especificamente
    log_not_found( ).
  CATCH zcx_order_error INTO DATA(lx_err). " restante tratado genericamente
    log_error( lx_err ).
ENDTRY.
```

- Throw `cx_static_check` for **expected, manageable** exceptions (validação de input, recurso ausente com fallback)
- Throw `cx_no_check` for **usually unrecoverable** situations (falha de memória, dependência não resolvível)
- Consider `cx_dynamic_check` quando o **caller tem controle total** sobre se a exceção pode ocorrer
- Prefer `RAISE EXCEPTION NEW` to `RAISE EXCEPTION TYPE` (NW 7.52+):

```abap
" Correto
RAISE EXCEPTION NEW zcx_order_not_found( iv_order_id = lv_id ).

" Ainda necessário com MESSAGE
RAISE EXCEPTION TYPE zcx_order_not_found
  MESSAGE e001(zfi)
  EXPORTING iv_order_id = lv_id.
```

### Catching

- **Wrap foreign exceptions** — não deixe exceções de outros componentes "invadir" seu código:

```abap
" Correto — encapsular exceção externa
METHODS generate RAISING zcx_generation_failure.

METHOD generate.
  TRY.
      lo_generator->generate( ).
    CATCH cx_amdp_generation_failure INTO DATA(lx_ext).
      RAISE EXCEPTION NEW zcx_generation_failure( previous = lx_ext ).
  ENDTRY.
ENDMETHOD.

" Anti-pattern — expõe exceção interna do componente externo
METHODS generate RAISING cx_amdp_generation_failure.
```

---

## Performance

- Evitar `SELECT *` — selecionar apenas campos necessários
- Usar `UP TO n ROWS` quando souber o limite
- Prefira `SELECT ... INTO TABLE` a `SELECT ... APPENDING TABLE` (sem necessidade)
- Para grandes volumes, considerar `PACKAGE SIZE` com `... INTO TABLE ... PACKAGE SIZE 1000`
- Evitar `SELECT` dentro de `LOOP` (anti-pattern N+1) — fazer JOINs ou ler tabela inteira antes
- Em S/4HANA, prefira CDS Views e pushdown de lógica para o banco

```abap
" Ruim — SELECT dentro de LOOP
LOOP AT lt_orders ASSIGNING FIELD-SYMBOL(<lfs_order>).
  SELECT SINGLE * FROM vbak INTO ls_header WHERE vbeln = <lfs_order>-order_id.
ENDLOOP.

" Bom — leitura em bloco
SELECT order_id, net_value
  FROM zi_sd_sales_order
  FOR ALL ENTRIES IN @lt_orders
  WHERE order_id = @lt_orders-order_id
  INTO TABLE @DATA(lt_headers).
```

---

## Comments

- **Expresse-se no código, não em comentários** — use nomes e métodos descritivos antes de recorrer a comentários
- Comentários não compensam nomes ruins — melhore o nome ao invés de explicá-lo
- **Use métodos ao invés de comentários para segmentar blocos** — evita carry-over de variáveis entre seções
- Comentar **por que**, não **o que** (o código já diz o que faz)
- Não deixar código comentado — usar controle de versão (git)
- Não fazer versionamento manual com stamps de ticket/transport — use o histórico de versionamento
- Não adicionar comentários de assinatura de método (`<SIGNATURE>`) nem end-of comments (`ENDIF. " IF has_entries`)
- Não duplicar textos de mensagens em comentários — use F2 no ADT para ver o texto
- **Usar `"` (aspas), não `*` (asterisco)** — aspas respeitam a indentação do código
- Colocar o comentário **antes** da instrução a que se refere, não depois
- Usar `" TODO:`, `" FIXME:`, `" XXX:` para marcar pendências — adicionar seu ID/iniciais
- **ABAP Doc (`"!`)** somente para APIs públicas expostas a outros times — não para código interno
- **Preferir pragmas a pseudo-comentários** para suprimir warnings do ATC: `##NEEDED` ao invés de `"#EC NEEDED`
  - Consultar programa `ABAP_SLIN_PRAGMAS` ou tabela `SLIN_DESC` para o mapeamento completo

```abap
" Anti-pattern — comentário repete o código
" Incrementa o contador
lv_counter = lv_counter + 1.

" Bom — comentário explica o motivo
" Iniciamos com 1 pois o primeiro item já foi processado fora do loop
lv_counter = 1.
```

```abap
" Anti-pattern — comentários segmentando código (use métodos ao invés)
" -----------------
" Build statement
" -----------------
DATA statement TYPE string.
statement = |SELECT order_id FROM zi_sd_order|.

" Bom — cada seção vira um método descritivo
DATA(statement) = build_statement( ).
DATA(data)      = execute_statement( statement ).
```

```abap
" Anti-pattern — asterisco não respeita indentação
METHOD do_it.
  IF input IS NOT INITIAL.
* delegate pattern
    output = calculate_result( input ).
  ENDIF.
ENDMETHOD.

" Correto — aspas indentam junto com o código
METHOD do_it.
  IF input IS NOT INITIAL.
    " delegate pattern
    output = calculate_result( input ).
  ENDIF.
ENDMETHOD.
```

```abap
" Correto — pragma ##NEEDED ao invés de pseudo-comentário
MESSAGE e001(zfi) INTO DATA(lv_msg) ##NEEDED.

" Anti-pattern — pseudo-comentário obsoleto
MESSAGE e001(zfi) INTO DATA(lv_msg). "#EC NEEDED
```

```abap
" Anti-pattern — versionamento manual por ticket
* ticket 800034775 ABC ++ Start
output = calculate_result( input ).
* ticket 800034775 ABC ++ End

" Anti-pattern — end-of comments desnecessários
METHOD get_total.
  IF lv_valid = abap_false.
    result = 0.
  ENDIF.  " IF lv_valid = abap_false
ENDMETHOD.   " get_total
```

---

## ABAP Unit — Testes

- Criar classes de teste com `FOR TESTING` no include CTEST da classe global
- Cada método de teste deve testar **um único cenário**
- Nomear métodos de teste descritivamente: `test_calculate_total_with_discount`
- Usar `cl_abap_unit_assert` para asserções
- Injetar dependências via construtor para facilitar mocks
- Usar `RISK LEVEL HARMLESS` para testes sem efeito colateral
- Usar Test Doubles (`td_`) ou implementações mock das interfaces

```abap
CLASS ltc_order_service DEFINITION FINAL FOR TESTING
  RISK LEVEL HARMLESS DURATION SHORT.
  PRIVATE SECTION.
    DATA: mo_cut TYPE REF TO zcl_order_service. " Class Under Test
    METHODS:
      setup,
      test_process_order_success FOR TESTING,
      test_process_order_not_found FOR TESTING.
ENDCLASS.

CLASS ltc_order_service IMPLEMENTATION.
  METHOD setup.
    mo_cut = NEW zcl_order_service(
      io_repo     = NEW ltd_order_repo_mock( )
      io_notifier = NEW ltd_notifier_mock( ) ).
  ENDMETHOD.

  METHOD test_process_order_success.
    DATA(lv_result) = mo_cut->process( iv_order_id = '0000001234' ).
    cl_abap_unit_assert=>assert_true( lv_result ).
  ENDMETHOD.
ENDCLASS.
```
