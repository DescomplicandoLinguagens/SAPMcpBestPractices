# ABAP Unit Testing — Boas Práticas

> Baseado no [Clean ABAP Style Guide](https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md). Referência para geração e revisão de testes ABAP Unit por IAs.

---

## Princípios

- **Escreva código testável** — se precisar refatorar para testar, faça isso primeiro
- **Permita que outros te mockeem** — adicione interfaces em todos os pontos de saída públicos
- **Código de teste deve ser mais legível que o código de produção** — simples e direto
- **Não faça cópias `$TMP` para testar** — escreva testes automatizados
- **Teste interfaces públicas, não internals privados** — testes em privados indicam design ruim
- **Não obsessione com cobertura** — 100% não é o objetivo; testes úteis sim

---

## Estrutura das Classes de Teste

### Nomear pela finalidade, não pela classe testada

```abap
" Correto — nome descreve o cenário (given/when)
CLASS ltc_empty_order DEFINITION FOR TESTING ...
CLASS ltc_calculate_total DEFINITION FOR TESTING ...

" Anti-pattern — repete o nome da classe ou é genérico
CLASS ltc_zcl_order_service DEFINITION FOR TESTING ...
CLASS ltc_test DEFINITION FOR TESTING ...
```

### Testes unitários: no include de teste da própria classe (CTEST)

```abap
" include CTEST de zcl_order_service
CLASS ltc_process_order DEFINITION FINAL FOR TESTING
  RISK LEVEL HARMLESS
  DURATION SHORT.

  PRIVATE SECTION.
    DATA cut TYPE REF TO zif_order_service. " interface, não classe concreta
    METHODS:
      setup,
      teardown,
      process_valid_order       FOR TESTING,
      throws_on_missing_order   FOR TESTING,
      ignores_already_processed FOR TESTING.
ENDCLASS.
```

### Testes de integração/componente: classe global separada `FOR TESTING ABSTRACT`

```abap
"! @testing zcl_order_service
"! @testing zcl_order_repository
CLASS ztc_order_integration DEFINITION PUBLIC ABSTRACT
  FOR TESTING
  RISK LEVEL DANGEROUS
  DURATION MEDIUM.
  ...
ENDCLASS.
```

### Métodos auxiliares em classe helper (herança ou delegação)

```abap
CLASS lth_base_tests DEFINITION ABSTRACT.
  PROTECTED SECTION.
    CLASS-METHODS assert_order_equals
      IMPORTING
        actual   TYPE REF TO zif_order
        expected TYPE REF TO zif_order.
ENDCLASS.

CLASS ltc_process_order DEFINITION INHERITING FROM lth_base_tests FINAL FOR TESTING
  RISK LEVEL HARMLESS DURATION SHORT.
  ...
ENDCLASS.
```

### Atalhos para executar testes no ADT

| Atalho | Efeito |
|--------|--------|
| `Ctrl+Shift+F9` | Preview de todos os testes (inclui test relations) |
| `Ctrl+Shift+F10` | Rodar todos os testes da classe |
| `Ctrl+Shift+F11` | Rodar com medição de cobertura |
| `Ctrl+Shift+F12` | Rodar + test relations de outras classes |

> macOS: `Cmd` ao invés de `Ctrl`

---

## Code Under Test (CUT)

### Nomear pela semântica, ou usar `cut` como padrão

```abap
DATA cut TYPE REF TO zif_order_service.         " padrão genérico
DATA empty_order TYPE REF TO zif_order.         " descreve o estado
DATA order_with_discount TYPE REF TO zif_order. " estado específico do cenário
```

### Tipar com a interface, não com a classe concreta

```abap
" Correto — interface permite mock
DATA cut TYPE REF TO zif_order_service.

" Anti-pattern — classe concreta dificulta mock
DATA cut TYPE REF TO zcl_order_service.
```

### Extrair a chamada ao CUT para método auxiliar quando necessário

```abap
" Método auxiliar no test class — simplifica chamadas com muitos parâmetros
METHODS process_order
  IMPORTING
    order_id TYPE vbeln DEFAULT '0000001234'
    config   TYPE zs_config DEFAULT default_config.

METHOD process_order.
  result = cut->process( order_id = order_id config = config ).
ENDMETHOD.

" No teste
DATA(result) = process_order( ). " sem precisar passar parâmetros irrelevantes
```

---

## Injeção de Dependências

### Injetar via construtor (Dependency Inversion)

```abap
" Correto — dependências injetadas no construtor
CLASS zcl_order_service DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS constructor
      IMPORTING
        io_repo     TYPE REF TO zif_order_repository
        io_notifier TYPE REF TO zif_notifier.
  PRIVATE SECTION.
    DATA mo_repo     TYPE REF TO zif_order_repository.
    DATA mo_notifier TYPE REF TO zif_notifier.
ENDCLASS.

" No setup do teste
METHOD setup.
  cut = NEW zcl_order_service(
    io_repo     = CAST zif_order_repository( cl_abap_testdouble=>create( 'zif_order_repository' ) )
    io_notifier = CAST zif_notifier( cl_abap_testdouble=>create( 'zif_notifier' ) ) ).
ENDMETHOD.
```

### NÃO usar setter injection — permite uso não intencional

```abap
" Anti-pattern
object->set_repo( repo_a ).
object->set_repo( repo_b ). " quem esperaria isso?
```

### NÃO usar FRIENDS injection — viola encapsulamento, frágil

```abap
" Anti-pattern
METHOD setup.
  cut = NEW zcl_order_service( ).
  cut->mo_repo ?= cl_abap_testdouble=>create( 'zif_order_repository' ). " acessa privado
ENDMETHOD.
```

### Usar `LOCAL FRIENDS` apenas para acessar o construtor `CREATE PRIVATE`

```abap
CLASS zcl_order_service DEFINITION LOCAL FRIENDS ltc_process_order.

METHOD setup.
  " CREATE PRIVATE — só funciona por causa do LOCAL FRIENDS
  cut = NEW zcl_order_service(
    io_repo = CAST zif_order_repository( cl_abap_testdouble=>create( 'zif_order_repository' ) ) ).
ENDMETHOD.
```

### Usar `cl_abap_testdouble` para mocks simples

```abap
" Correto — ABAP Test Double Framework
DATA(repo_mock) = CAST zif_order_repository(
  cl_abap_testdouble=>create( 'zif_order_repository' ) ).

cl_abap_testdouble=>configure_call( repo_mock )
  ->returning( ls_order ).
repo_mock->find( lv_id ).
```

### NÃO criar subclasse para mockar métodos

```abap
" Anti-pattern
CLASS ltc_test DEFINITION INHERITING FROM zcl_order_service FOR TESTING.
  PROTECTED SECTION.
    METHODS fetch_data REDEFINITION.
ENDCLASS.
```

### NÃO adicionar código de teste ao código de produção

```abap
" Anti-pattern
IF is_unit_test_running = abap_true.
  " lógica só para testes
ENDIF.
```

### Test Seams — apenas como workaround temporário em código legado

```abap
" Usar TEST-SEAM apenas para código legado intestável enquanto refatora
TEST-SEAM get_config.
  config = get_production_config( ).
END-TEST-SEAM.
```

---

## Estrutura dos Métodos de Teste — Given / When / Then

```abap
METHOD rejects_order_without_items.
  " given
  DATA(empty_order) = VALUE zs_order( order_id = '1234' ).

  " when
  DATA(is_valid) = cut->validate( empty_order ).

  " then
  cl_abap_unit_assert=>assert_false( is_valid ).
ENDMETHOD.
```

### "When" deve ter exatamente UMA chamada ao CUT

```abap
" Correto — uma chamada
DATA(result) = cut->process( iv_order_id = lv_id ).

" Anti-pattern — múltiplas chamadas obscurecem o que está sendo testado
cut->prepare( lv_id ).
DATA(result) = cut->process( lv_id ).
cut->finalize( result ).
```

### Não adicionar TEARDOWN a menos que seja necessário

`teardown` só é necessário para limpar banco de dados ou recursos externos em testes de integração.
Para variáveis e mocks em memória — não é necessário, o `setup` reinicializa antes do próximo teste.

---

## Nomes de Métodos de Teste

Refletir o que está dado e o que é esperado:

```abap
" Correto — descreve cenário e resultado esperado
METHOD reads_existing_entry.
METHOD throws_on_invalid_key.
METHOD detects_invalid_input.
METHOD returns_empty_when_no_results.

" Anti-patterns
METHOD get_conversion_exits.   " o que é esperado? sucesso ou falha?
METHOD test_loop.              " "test" é óbvio, não acrescenta
METHOD parameterized_test.     " o que testa? qual objetivo?
```

> Com limite de 30 chars no nome do método, use ABAP Doc `"!` para complementar se necessário.

---

## Dados de Teste

### Tornar óbvio o que é "meaningless" e o que importa

```abap
" Usar valores claramente arbitrários para dados irrelevantes
DATA(alert_id)     = '42'.               " número sem significado real
DATA(random_key)   = 'ABCDEFGH'.         " keyboard accident
DATA(dummy_amount) = 999999.             " nome revela que é dummy

" Anti-pattern — parece dado real
DATA(alert_id) = '00000001223678871'.    " parece ID real do sistema
DATA(order_type) = 'ZOR'.               " parece customizing real
```

### Facilitar identificação de diferenças

```abap
" Correto — diferenças visíveis
exp_value = 'END1'.
act_value = 'END2'.

" Anti-pattern — diferença escondida em string longa
exp_value = '45678901234567890123456789012345678901234567890123456789012345678901234567890123456789END1'.
act_value = '45678901234567890123456789012345678901234567890123456789012345678901234567890123456789END2'.
```

### Usar constantes para descrever propósito dos dados de teste

```abap
CONSTANTS some_nonsense_key TYPE char8 VALUE 'ABCDEFGH'.

METHOD throws_on_invalid_entry.
  TRY.
      cut->read_entry( some_nonsense_key ).
      cl_abap_unit_assert=>fail( ).
    CATCH zcx_order_not_found.
      " esperado — ok
  ENDTRY.
ENDMETHOD.
```

---

## Asserções

### Poucas asserções focadas — uma por teste idealmente

```abap
" Correto — foco único
METHOD rejects_invalid_input.
  DATA(is_valid) = cut->is_valid( 'INVALID' ).
  cl_abap_unit_assert=>assert_false( is_valid ).
ENDMETHOD.

" Anti-pattern — múltiplas asserções obscurecem o foco
METHOD rejects_invalid_input.
  DATA(is_valid) = cut->is_valid( 'INVALID' ).
  cl_abap_unit_assert=>assert_false( is_valid ).
  cl_abap_unit_assert=>assert_not_initial( log->get_messages( ) ).
  cl_abap_unit_assert=>assert_equals( act = sy-langu exp = 'E' ).
ENDMETHOD.
```

### Usar o tipo de asserção correto

```abap
" Correto — assert específico dá mensagem de erro clara
cl_abap_unit_assert=>assert_equals( act = result exp = expected ).
cl_abap_unit_assert=>assert_true( condition ).
cl_abap_unit_assert=>assert_false( condition ).
cl_abap_unit_assert=>assert_initial( value ).
cl_abap_unit_assert=>assert_not_initial( value ).
cl_abap_unit_assert=>assert_bound( reference ).
cl_abap_unit_assert=>assert_not_bound( reference ).
cl_abap_unit_assert=>assert_differs( act = a exp = b ).

" Anti-pattern — assert genérico não diz o que falhou
cl_abap_unit_assert=>assert_true( xsdbool( act = exp ) ).
```

### Usar FAIL para exceções esperadas

```abap
METHOD throws_on_empty_input.
  TRY.
      " when
      cut->process( '' ).
      cl_abap_unit_assert=>fail( 'Expected exception was not raised' ).
    CATCH zcx_order_error.
      " then — exceção esperada, ok
  ENDTRY.
ENDMETHOD.
```

### Propagar exceções inesperadas — não capturar para falhar

```abap
" Correto — exceção inesperada vira falha automática do framework
METHODS reads_entry FOR TESTING RAISING zcx_order_error.

METHOD reads_entry.
  DATA(entry) = cut->read( lv_id ).
  cl_abap_unit_assert=>assert_not_initial( entry ).
ENDMETHOD.

" Anti-pattern — código extra para capturar e falhar manualmente
METHOD reads_entry.
  TRY.
      DATA(entry) = cut->read( lv_id ).
    CATCH zcx_order_error INTO DATA(unexpected).
      cl_abap_unit_assert=>fail( unexpected->get_text( ) ).
  ENDTRY.
  cl_abap_unit_assert=>assert_not_initial( entry ).
ENDMETHOD.
```

### Criar asserções customizadas para evitar duplicação

```abap
METHODS assert_order_valid
  IMPORTING
    actual   TYPE REF TO zif_order
    order_id TYPE vbeln.

METHOD assert_order_valid.
  cl_abap_unit_assert=>assert_bound( actual ).
  cl_abap_unit_assert=>assert_equals(
    act = actual->get_id( )
    exp = order_id ).
ENDMETHOD.
```

---

## Checklist — Teste ABAP Unit

```
[ ] Classe de teste nomeia o cenário, não a classe testada
[ ] CUT declarado com TYPE REF TO interface (não classe concreta)
[ ] Dependências injetadas via construtor
[ ] setup( ) instancia CUT e mocks
[ ] Cada método testa UM cenário
[ ] Estrutura Given / When / Then clara
[ ] "When" tem exatamente uma chamada ao CUT
[ ] Asserção usa o tipo correto (assert_equals, assert_false, etc.)
[ ] Exceções esperadas: TRY + assert_fail( )
[ ] Exceções inesperadas: RAISING na assinatura do método
[ ] Dados de teste: valores claramente arbitrários para irrelevantes
[ ] Sem lógica condicional nos testes (IF/CASE)
[ ] TEARDOWN só se realmente necessário (banco/recursos externos)
[ ] RISK LEVEL e DURATION declarados adequadamente
```
