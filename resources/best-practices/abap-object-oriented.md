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

> **Resumo de ouro:** use interfaces para contratos, `PRIVATE` por padrão, `FINAL` quando não for herdar, `ABSTRACT` para templates, `CREATE PRIVATE` para factories/singletons, e injete dependências pelo construtor. SOLID não é teoria — é a forma de manter o sistema SAP evolutivo e testável.
