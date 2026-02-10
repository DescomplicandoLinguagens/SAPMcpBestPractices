# Boas Práticas ABAP Clássico

Este guia foca nas fundações do desenvolvimento ABAP, garantindo código limpo e manutenível.

## 1. Convenções de Nomenclatura

Utilize prefixos claros para variáveis e objetos:

- **Variáveis Locais:** `lv_` (ex: `lv_count`)
- **Estruturas Locais:** `ls_` (ex: `ls_customer`)
- **Tabelas Internas Locais:** `lt_` (ex: `lt_orders`)
- **Constantes:** `lc_` (ex: `lc_status_active`)
- **Parâmetros de Importação:** `iv_`, `is_`, `it_`
- **Parâmetros de Exportação:** `ev_`, `es_`, `et_`
- **Parâmetros de Retorno:** `rv_`, `rs_`, `rt_`
- **Parâmetros de Modificação:** `cv_`, `cs_`, `ct_`
- **Field Symbols:** `fs_` (ex: `fs_line`)
- **Referências:** `rf_` (ex: `rf_line`)

## 2. Tratamento de Erros

Utilize Classes de Exceção (`CX_*`) ao invés de códigos de retorno simples sempre que possível, especialmente em desenvolvimentos OO.

```abap
TRY.
    lo_class->method( ).
  CATCH cx_sy_arithmetic_error INTO DATA(lx_error).
    " Tratar erro
ENDTRY.
```

## 3. Comentários e Legibilidade

- Escreva código autoexplicativo.
- Comentários devem explicar o _porquê_, não o _o que_ (o código já diz o _o que_).
- Mantenha métodos e rotinas curtos e com responsabilidade única.
