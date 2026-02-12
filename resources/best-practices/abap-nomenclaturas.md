- Dominios
- Z[MODULO SAP]DM\_[SEQUENCIAL NUMERICO]
  - EX: ZFIDM_001

- Elementos de Dados
- Z[MODULO SAP]EL\_[SEQUENCIAL NUMERICO]
  - EX: ZFIEL_001

- Variáveis Locais:
  - LV\_[NOME NEGOCIO]
  - GV\_[NOME NEGOCIO]
  - EX: LV_ORDER_ID, GV_ORDER_ID

- Tabelas
- Z[MODULO SAP]T\_[SEQUENCIAL NUMERICO]
  - EX: ZFIT_001

- Tabelas Internas:
  - LT\_[NOME NEGOCIO]
  - GT\_[NOME NEGOCIO]
  - IT\_[NOME NEGOCIO]
    Exemplo:
  - LT_SALES_ORDER
  - GT_SALES_ORDER
  - IT_SALES_ORDER

- Visões de Tabelas
- Z[MODULO SAP]V\_[SEQUENCIAL NUMERICO]
  - EX: ZFIV_001

- Estruturas
- Z[MODULO SAP]ES\_[SEQUENCIAL NUMERICO]
  - EX: ZFES_001

- Estruturas Locais
  - LS\_[NOME NEGOCIO]
  - GS\_[NOME NEGOCIO]
  - IS\_[NOME NEGOCIO]
    Exemplo:
  - LS_SALES_ORDER
  - GS_SALES_ORDER
  - IS_SALES_ORDER

- Classes:
  - Z[MODULO SAP]CL\_[SEQUENCIAL NUMERICO]
    Exemplo:
  - ZFICL_001

- Classes Locais:
  - LCL\_[NOME NEGOCIO]
  - GCL\_[NOME NEGOCIO]
  - Exemplo:
    - LCL_SALES_ORDER
    - GCL_SALES_ORDER

- CDS Basic:
  - ZI\_[NOME TABELA]
    - EX: ZI_FIT_001

- CDS Composite:
  - ZI\_[MODULO SAP]\_[NOME NEGOCIO]
    - EX: ZI_SD_SALES_ORDER
  - ZR\_[MODULO SAP]\_[NOME NEGOCIO]
    - EX: ZR_SD_SALES_ORDER

- CDS Consumption:
  - ZC\_[MODULO SAP]\_[NOME NEGOCIO]
    - EX: ZC_SD_SALES_ORDER

- Service Definition:
  - ZUI\_[MODULO SAP]\_[NOME NEGOCIO]
    - EX: ZUI_SD_SALES_ORDER

- Service Binding:
  - ZUI\_[MODULO SAP]\_[NOME NEGOCIO]\_[VERSAO ODATA]
    - EX: ZUI_SD_SALES_ORDER_O2, ZUI_SD_SALES_ORDER_O4

- APP Fiori
  - Nome App: Z[MODULO SAP]\_[NOME APP]
  - EX: ZSD_SALES_ORDER
  - Namespace: [dominio empresarial]\_[MODULO SAP]
    - EX: br.com.empresa.fi
  - Nome App Deploy: ZZ1[MODULO SAP][NOME APP]
    - EX: ZZ1SDSALESORDER
    - Max: 12 caracteres

- Launchpad:
- Catálogo Técnico: ZTC\_[MODULO SAP]
  - EX: ZTC_SD
- Catálogo Negócio: ZBC\_[MODULO SAP]\_[AREA NEGOCIO]
  - EX: ZBC_SD_SALES_ORDER
