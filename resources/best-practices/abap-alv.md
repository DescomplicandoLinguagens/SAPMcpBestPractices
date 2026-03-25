# ALV — Boas Práticas

> Regras para desenvolvimento de relatórios ALV em ABAP. Referência para geração e revisão de código por IAs.

---

## Regras Gerais

1. ALV **sempre** com OO — nunca FORMS/PERFORMS
2. Classe principal: `gcl_main` (classe local) ou `ZCL_` (classe global reutilizável)
3. Tipos permitidos:
   - **ALV Grid** (`cl_salv_table`) — para conjuntos de dados menores/médios, in-memory
   - **ALV IDA** (`if_salv_gui_table_ida`) — para grandes volumes, leitura direta do banco via CDS
4. Sempre declarações inline (ABAP 7.40+)
5. Nunca `SELECT *` — selecionar apenas campos necessários
6. Em S/4HANA: preferir CDSs; em ECC: tabelas com joins cuidadosos
7. Loops aninhados: evitar — usar HASHED/SORTED TABLE para lookups
8. Em S/4HANA com necessidade de ALV simples: avaliar migração para app RAP/Fiori

---

## ALV Grid — `cl_salv_table`

### Estrutura mínima obrigatória

```abap
CLASS gcl_main DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS: create RETURNING VALUE(ro_result) TYPE REF TO gcl_main.
    METHODS: run.
  PRIVATE SECTION.
    DATA: mt_data TYPE STANDARD TABLE OF zs_my_result WITH EMPTY KEY.
    METHODS: get_data,
             display_alv.
ENDCLASS.

CLASS gcl_main IMPLEMENTATION.

  METHOD create.
    ro_result = NEW #( ).
  ENDMETHOD.

  METHOD run.
    get_data( ).
    display_alv( ).
  ENDMETHOD.

  METHOD get_data.
    " S/4HANA — via CDS
    SELECT order_id, company_code, net_value, status
      FROM zr_sd_sales_order
      WHERE company_code = @lv_bukrs
      INTO TABLE @mt_data.

    " ECC — via tabela
    " SELECT vbeln AS order_id, bukrs AS company_code, netwr AS net_value
    "   FROM vbak
    "   WHERE bukrs = @lv_bukrs
    "   INTO TABLE @mt_data.
  ENDMETHOD.

  METHOD display_alv.
    TRY.
      cl_salv_table=>factory(
        IMPORTING r_salv_table = DATA(lo_alv)
        CHANGING  t_table      = mt_data ).

      " Configurações básicas
      lo_alv->get_display_settings( )->set_striped_pattern( abap_true ).
      lo_alv->get_display_settings( )->set_fit_column_to_table_size( abap_true ).

      " Colunas — otimizar largura
      lo_alv->get_columns( )->set_optimize( abap_true ).

      " Funções padrão
      lo_alv->get_functions( )->set_all( abap_true ).

      " Ordenação padrão
      DATA(lo_sorts) = lo_alv->get_sorts( ).
      lo_sorts->add_sort( columnname = 'ORDER_ID' ).

      lo_alv->display( ).

    CATCH cx_salv_msg INTO DATA(lx_msg).
      MESSAGE lx_msg->get_text( ) TYPE 'E'.
    ENDTRY.
  ENDMETHOD.

ENDCLASS.

START-OF-SELECTION.
  gcl_main=>create( )->run( ).
```

### Configurações de Colunas

```abap
METHOD configure_columns.
  DATA(lo_cols) = lo_alv->get_columns( ).

  " Ajustar coluna individualmente
  DATA(lo_col) = CAST cl_salv_column_table(
    lo_cols->get_column( 'NET_VALUE' ) ).
  lo_col->set_short_text( 'Valor'    ).
  lo_col->set_medium_text( 'Val.Líq.' ).
  lo_col->set_long_text( 'Valor Líquido' ).
  lo_col->set_alignment( if_salv_c_alignment=>right ).

  " Ocultar coluna técnica
  lo_cols->get_column( 'MANDT' )->set_visible( abap_false ).

  " Coluna de cor (se existir campo de cor na estrutura)
  lo_cols->set_color_column( 'T_COLOR' ).
ENDMETHOD.
```

### Eventos de Toolbar e Double-Click

```abap
CLASS gcl_main DEFINITION.
  PRIVATE SECTION.
    DATA: mo_alv TYPE REF TO cl_salv_table.
    METHODS: register_events,
             on_toolbar      FOR EVENT added_function OF cl_salv_events_table
               IMPORTING e_salv_function,
             on_double_click FOR EVENT double_click    OF cl_salv_events_table
               IMPORTING row column.
ENDCLASS.

CLASS gcl_main IMPLEMENTATION.
  METHOD register_events.
    DATA(lo_events) = mo_alv->get_event( ).

    " Toolbar customizado
    SET HANDLER on_toolbar      FOR lo_events.
    SET HANDLER on_double_click FOR lo_events.

    " Adicionar botão customizado
    mo_alv->get_functions( )->add_function(
      name     = 'MY_ACTION'
      icon     = CONV salv_de_function( icon_execute_object )
      text     = 'Executar'
      tooltip  = 'Executar ação no item selecionado'
      position = if_salv_c_function_position=>right_of_salv_functions ).
  ENDMETHOD.

  METHOD on_toolbar.
    CASE e_salv_function.
      WHEN 'MY_ACTION'.
        " lógica da ação
    ENDCASE.
  ENDMETHOD.

  METHOD on_double_click.
    DATA(ls_row) = mt_data[ row ].
    " abrir detalhe, navegar, etc.
  ENDMETHOD.
ENDCLASS.
```

### Seleção de Linhas

```abap
" Habilitar seleção múltipla
lo_alv->get_selections( )->set_selection_mode(
  if_salv_c_selection_mode=>multiple ).

" Ler linhas selecionadas
DATA(lt_selected) = lo_alv->get_selections( )->get_selected_rows( ).
LOOP AT lt_selected INTO DATA(lv_idx).
  DATA(ls_item) = mt_data[ lv_idx ].
  " processar
ENDLOOP.
```

---

## ALV IDA — `if_salv_gui_table_ida`

> Usar ALV IDA para grandes volumes (> 100k linhas). Ele lê diretamente do banco via CDS — **não carrega dados em memória**.

### Estrutura mínima obrigatória

```abap
CLASS gcl_main DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS: create RETURNING VALUE(ro_result) TYPE REF TO gcl_main.
    METHODS: run.
  PRIVATE SECTION.
    DATA: mo_ida TYPE REF TO if_salv_gui_table_ida.
    METHODS: init_ida,
             set_filters,
             display_data.
ENDCLASS.

CLASS gcl_main IMPLEMENTATION.

  METHOD create.
    ro_result = NEW #( ).
  ENDMETHOD.

  METHOD run.
    init_ida( ).
    set_filters( ).
    display_data( ).
  ENDMETHOD.

  METHOD init_ida.
    mo_ida = cl_salv_gui_table_ida=>create_for_cds_view(
      iv_cds_view_name = 'ZC_SD_SALES_ORDER' ).

    IF cl_salv_gui_table_ida=>db_capabilities( )->is_max_rows_recommended( ).
      mo_ida->set_maximum_number_of_rows( iv_number_of_rows = 2000 ).
    ENDIF.
  ENDMETHOD.

  METHOD set_filters.
    DATA(lo_sel) = NEW cl_salv_range_tab_collector( ).

    " Mapear parâmetros de seleção para campos da CDS
    lo_sel->add_ranges_for_name( iv_name = 'ORDER_ID'      it_ranges = so_order[] ).
    lo_sel->add_ranges_for_name( iv_name = 'COMPANY_CODE'  it_ranges = so_bukrs[] ).

    lo_sel->get_collected_ranges(
      IMPORTING et_named_ranges = DATA(lt_named_ranges) ).

    mo_ida->set_select_options( it_ranges = lt_named_ranges ).
  ENDMETHOD.

  METHOD display_data.
    " Seleção múltipla
    mo_ida->selection( )->set_selection_mode(
      cl_salv_gui_table_ida=>c_selection_mode-multiple ).

    " Separador na toolbar
    mo_ida->toolbar( )->add_separator( ).

    " Botão customizado
    mo_ida->toolbar( )->add_button_for_intent(
      io_intent = NEW cl_salv_gui_toolbar_intent(
        iv_function_name = 'MY_ACTION'
        iv_text          = 'Executar'
        iv_icon_id       = icon_execute_object ) ).

    mo_ida->fullscreen( )->display( ).
  ENDMETHOD.

ENDCLASS.

START-OF-SELECTION.
  gcl_main=>create( )->run( ).
```

---

## Adicionais

- Nunca sugerir FORMS/PERFORMS
- Utilizar sempre que possível INLINE Declarations do ABAP 7.40+
- Sempre que possível utilizar `NEW` para instanciar objetos
- Não trabalhar com `SELECT *`
- Tipar variáveis sempre que necessário na Classe
- Evitar comentários desnecessários, apenas o que realmente for indispensável
- Sempre que necessário utilizar comentários no padrão `XXX`, `TODO`, `FIXME`
- Caso precise, pode criar os eventos de toolbar na própria classe como métodos
- Caso seja um ALV simples e esteja em S/4HANA, pode sugerir a utilização de Aplicativos RAP
- Evitar Loops aninhados
- Sugerir sempre a utilização de Hashed Tables, Sorted Tables quando necessário para melhorar performance
- Não sugerir FORMS — criar Classes Locais ou na SE24
