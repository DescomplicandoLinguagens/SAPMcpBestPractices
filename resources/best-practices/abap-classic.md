Caso precise utilizar ALV como desenvolvimento vamos ter as seguintes regras.

1. ALV sempre com OO inbutido

- Vamos ter uma classe gcl_main que irá conter a lógica principal
- Teremos apenas dois tipos de ALV permitidos aqui:
  - ALV Grid
  - ALV IDA

---

ALV Grid:

- Métodos Defaults
  - CLASS-METHODS create RETURNING VALUE(ro_result) TYPE REF TO gcl_main.
    - Aqui vamos retornar uma instancia da própria classe para facilitar a declaração
  - METHODS: run.
    - Aqui vamos ter a lógica principal
  - METHODS: get_data.
    - Aqui selecionamos os dados
    - Caso S4Hana
      - Forçar utilizar CDSs ao inves de tabelas
      - Evitar JOINS, tentar sempre forçar resolver via CDS com Associations
    - Caso ECC
      - Utilizar Tabelas
      - Evitar JOINS por conta de performance
  - METHODS: display_alv.
    - Aqui vamos exibir o ALV
    - Sempre utilizar cl_salv_table
- Eventos SAP
  - START-OF-SELECTION. gcl_main=>create( )->run( ).

---

---

ALV IDA:

- Métodos Defaults
  - DATA: lo_ida TYPE REF TO if_salv_gui_table_ida.
  - CLASS-METHODS create RETURNING VALUE(ro_result) TYPE REF TO gcl_main.
    - Aqui vamos retornar uma instancia da própria classe para facilitar a declaração
  - METHODS: run.
    - Aqui vamos ter a lógica principal
  - METHODS: init_ida.
    - Aqui vamos inicializar o ALV IDA
    - Exemplo:
      lo_ida = cl_salv_gui_table_ida=>create_for_cds_view( iv_cds_view_name = 'CDS ou TABELA' ).

      IF cl_salv_gui_table_ida=>db_capabilities( )->is_max_rows_recommended( ).
      lo_ida->set_maximum_number_of_rows( iv_number_of_rows = 2000 ).
      ENDIF.

  - METHODS: set_filters.
    - Aqui vamos setar os filtros
    - EX:
      DATA(lo_sel) = NEW cl_salv_range_tab_collector( ).
      lo_sel->add_ranges_for_name( iv_name = 'EXTRACAO' it_ranges = so_extra[] ).
      lo_sel->get_collected_ranges( IMPORTING et_named_ranges = DATA(lt_named_ranges) ).

      lo_ida->set_select_options( it_ranges = lt_named_ranges ).

  - METHODS: display_data.
    - Aqui vamos exibir o ALV IDA
    - Exemplo:
      lo_ida->selection( )->set_selection_mode( 'MULTI' ).

      lo_ida->toolbar( )->add_separator( ).

      lo_ida->fullscreen( )->display( ).

- Eventos SAP
  - START-OF-SELECTION. gcl_main=>create( )->run( ).

---

Adicionais:

- Nunca sugerir FORMS/PERFORMS
- Utilizar sempre que possivel INLINE Declarations do ABAP 7.40+
- Sempre que possível utilizar o NEW para instanciar objetos
- Não trabalhar com SELECT \*
- Tipar variáveis sempre que necessário na Classe
- Evitar comentários desnecessários, apenas o que realmente for indispensável
- Sempre que necessário utilizar comentários no padrão XXX, TODO, FIXME
- Caso precise, pode criar os eventos de toolbar na própria classe como métodos
- Caso seja um ALV simples e esteja em S4Hana, pode sugerir a utilização de Aplicativos RAP
- Evitar Loop aninhados
- Sugerir sempre a utilização de Hashed Tables, Sorted Tables quando necessário para melhorar performance
