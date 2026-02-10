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

## 3. CDSs

#### CDS Basics

- Utilizadas para criar uma camada acima de tabelas
- Vai mandar nos alias das tabelas para garantir o nome de negócio
- Facilita quando tiver que fazer alteração na tabela

#### CDS Composite

- CDSs que agrupam CDS Basics
- CDSs que podem ser reutilizadas por outros Apps
- CDSs que tem regras especificas de um App
- Em alguns casos será a Root da sua aplicação
- Quando necessário poderá ter o Behavior associado

#### CDS Consumption

- Essa camada é a camada de UI do OData
- Geralmente é uma Projection de uma Composite Root
- É a camada que vai ter as annotations de UI e comportamento
- Deve ter apenas as colunas que serão exibidas na UI
- Poderá ter um Projection Behavior associado

### Hierarquia correta de CDSs:

Table -> CDS Basic -> CDS Composite -> CDS Consumption

### Nomenclatura de CDSs:

- Basics são nomeadas com:
  - ZI_TABELA

- Composites são nomeadas com:
  - ZI_NOME_NEGOCIO
    - CDSs que possam ser reutilizadas por outros Apps
  - ZR_NOME_NEGOCIO
    - CDSs que tem regras especificas de um App

- Consumptions são nomeadas com:
  - ZC_NOME_NEGOCIO
