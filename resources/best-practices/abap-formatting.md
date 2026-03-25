# ABAP Formatting — Boas Práticas

> Baseado no [Clean ABAP Style Guide](https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md). Referência para geração de código ABAP formatado corretamente por IAs.

---

## Princípios

- **Otimize para leitura, não para escrita** — desenvolvedores passam mais tempo lendo do que escrevendo
- **Seja consistente** — todo código do projeto deve seguir o mesmo estilo
- **Use o ABAP Formatter (Pretty Printer)** antes de ativar um objeto — `Shift+F1` no SE80/SE24/ADT

---

## Comprimento de Linha

- Máximo de **120 caracteres** por linha
- Configure o print margin em ADT: `Menu > Window > Preferences > General > Editors > Text Editors`

---

## Uma instrução por linha

```abap
" Correto
DATA do_this TYPE i.
do_this = input + 3.

" Anti-pattern
DATA do_this TYPE i. do_this = input + 3.
```

---

## Linhas em branco

- **Uma** linha em branco para separar blocos lógicos diferentes — nunca duas ou mais
- **Não** adicionar linhas em branco dentro de um método só por hábito
- Se sentir necessidade de muitas linhas em branco, provavelmente o método faz coisas demais

```abap
" Correto
METHOD do_something.
  do_this( ).
  then_that( ).
ENDMETHOD.

" Anti-pattern — linhas em branco excessivas
METHOD do_something.

  do_this( ).

  then_that( ).

ENDMETHOD.
```

Linhas em branco fazem sentido quando há statements que ocupam múltiplas linhas:

```abap
METHOD do_something.

  do_this( ).

  then_that(
    EXPORTING
      variable = 'A'
    IMPORTING
      result   = result ).

ENDMETHOD.
```

---

## Parâmetros de Chamadas

### Parâmetro único — manter na mesma linha

```abap
DATA(unique_list) = remove_duplicates( list ).
remove_duplicates( CHANGING list = list ).

" Anti-pattern
DATA(unique_list) = remove_duplicates(
                         list ).
```

### Múltiplos parâmetros — um por linha, alinhados

```abap
modify->update( node           = if_fra_alert_c=>node-item
                key            = item->key
                data           = item
                changed_fields = changed_fields ).

" Anti-pattern — parâmetros na mesma linha
modify->update( node = if_fra_alert_c=>node-item key = item->key data = item ).
```

### Parâmetros na próxima linha quando linha muito longa

```abap
DATA(sum) = add_two_numbers(
                value_1 = round_up( input DIV 7 ) * 42 + round_down( 19 * step_size )
                value_2 = VALUE #( ( `Calculation failed with a very weird result` ) ) ).
```

### Indentação de parâmetros — 4 espaços abaixo da chamada

```abap
DATA(sum) = add_two_numbers(
                value_1 = 5
                value_2 = 6 ).

" Com keywords EXPORTING/CHANGING: keyword +2, parâmetro +4
DATA(sum) = add_two_numbers(
              EXPORTING
                value_1 = 5
                value_2 = 6
              CHANGING
                errors  = errors ).
```

### Fechar parênteses na mesma linha do último parâmetro

```abap
" Correto
modify->update( node           = if_fra_alert_c=>node-item
                key            = item->key
                changed_fields = changed_fields ).

" Anti-pattern — parêntese em linha separada
modify->update( node           = if_fra_alert_c=>node-item
                key            = item->key
                changed_fields = changed_fields
).
```

### Chamada muito longa — quebrar na linha seguinte

```abap
DATA(some_super_long_param_name) =
  if_some_annoying_interface~add_two_numbers_in_a_long_name(
      value_1 = 5
      value_2 = 6 ).
```

---

## Declarações inline com VALUE / NEW

Indentar como chamadas de método:

```abap
DATA(result) = merge_structures( a = VALUE #( field_1 = 'X'
                                              field_2 = 'A' )
                                 b = NEW /clean/structure_type( field_3 = 'C'
                                                                field_4 = 'D' ) ).
```

---

## Alinhamento de Atribuições

### Alinhar atribuições ao mesmo objeto

```abap
" Correto — mesmo objeto
structure-type = 'A'.
structure-id   = '4711'.

" Ainda melhor — VALUE #
structure = VALUE #( type = 'A'
                     id   = '4711' ).
```

### NÃO alinhar atribuições a objetos diferentes

```abap
" Correto — deixar ragged quando não relacionados
customizing_reader = fra_cust_obj_model_reader=>s_get_instance( ).
hdb_access = fra_hdbr_access=>s_get_instance( ).

" Anti-pattern — alinhamento artificial entre variáveis não relacionadas
customizing_reader = fra_cust_obj_model_reader=>s_get_instance( ).
hdb_access         = fra_hdbr_access=>s_get_instance( ).
```

---

## Declarações de Variáveis

### NÃO alinhar TYPE clauses

```abap
" Correto
DATA name TYPE seoclsname.
DATA reader TYPE REF TO /clean/reader.

" Anti-pattern — alinhamento de TYPE
DATA name   TYPE seoclsname.
DATA reader TYPE REF TO /clean/reader.
```

### NÃO encadear assignments

```abap
" Correto
var2 = var3.
var1 = var3.

" Anti-pattern
var1 = var2 = var3.
```

---

## Condensar o Código

Não adicionar espaços desnecessários:

```abap
" Correto
DATA(result) = calculate( items ).

" Anti-pattern
DATA(result)        =      calculate(    items =   items )   .
```

---

## Resumo — Checklist de Formatação

```
[ ] Linha máxima: 120 caracteres
[ ] Uma instrução por linha
[ ] Parâmetro único: mesma linha da chamada
[ ] Múltiplos parâmetros: um por linha, alinhados
[ ] Parêntese de fechamento: na última linha de parâmetro
[ ] Indentação: 4 espaços para parâmetros, 2 para keywords EXPORTING/CHANGING
[ ] Linhas em branco: máximo 1 entre blocos, zero dentro de método curto
[ ] Alinhamento: apenas para atribuições do mesmo objeto
[ ] TYPE clauses: não alinhar
[ ] ABAP Formatter (Shift+F1) antes de ativar
```
