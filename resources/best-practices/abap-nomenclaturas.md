# ABAP — Padrões de Nomenclatura

> Referência completa de nomenclatura para desenvolvimento ABAP. Usada como contrato de nomeação para geração e validação de código por IAs.

---

## Repositório ABAP (Objetos Globais)

### Domínios
- Z[MODULO SAP]DM\_[SEQUENCIAL NUMERICO]
  - EX: ZFIDM_001

### Elementos de Dados
- Z[MODULO SAP]EL\_[SEQUENCIAL NUMERICO]
  - EX: ZFIEL_001

### Tabelas Transparentes
- Z[MODULO SAP]T\_[SEQUENCIAL NUMERICO]
  - EX: ZFIT_001

### Visões de Tabelas
- Z[MODULO SAP]V\_[SEQUENCIAL NUMERICO]
  - EX: ZFIV_001

### Estruturas Globais (SE11)
- Z[MODULO SAP]ES\_[SEQUENCIAL NUMERICO]
  - EX: ZFIES_001

### Type Groups
- Z[MODULO SAP]TY
  - EX: ZFITY

### Grupos de Funções
- Z[MODULO SAP]FG\_[NOME NEGOCIO]
  - EX: ZFIFG_PAYMENT

### Módulos de Função
- Z[MODULO SAP]\_[NOME NEGOCIO]
  - EX: ZFI_CALCULATE_TAX

### Programas / Reports
- Z[MODULO SAP]R\_[NOME NEGOCIO]
  - EX: ZFIR_OPEN_ITEMS

### Classes Globais (SE24 / ADT)
- Z[MODULO SAP]CL\_[NOME NEGOCIO]
  - EX: ZFICL_PAYMENT_PROCESSOR

### Interfaces Globais
- Z[MODULO SAP]IF\_[NOME NEGOCIO]
  - EX: ZFIIF_NOTIFIER

### Exceções Globais (cx_*)
- Z[MODULO SAP]CX\_[NOME NEGOCIO]
  - EX: ZFICX_PAYMENT_ERROR

### Enhancement Spots
- Z[MODULO SAP]ES\_[NOME NEGOCIO]
  - EX: ZFIES_POSTING

### BADIs
- Z[MODULO SAP]BD\_[NOME NEGOCIO]
  - EX: ZFIBD_TAX_CALC

### Classes de Mensagens
- Z[MODULO SAP]
  - EX: ZFI (Mensagens de FI)

### Objetos de Autorização
- Z\_[MODULO SAP]\_[NOME OBJETO]
  - EX: Z_FI_PAYMENT

### Pacotes
- Z[MODULO SAP]\_[AREA NEGOCIO]
  - EX: ZFI_ACCOUNTS_PAYABLE

---

## Variáveis e Atributos

### Prefixos por Escopo

| Prefixo | Escopo         | Exemplo                |
|---------|----------------|------------------------|
| `lv_`   | Local (valor)  | `lv_order_id`          |
| `gv_`   | Global (valor) | `gv_company_code`      |
| `mv_`   | Membro (atributo de instância) | `mv_status` |
| `cv_`   | Constante de classe | `cv_max_items`    |

### Tabelas Internas

| Prefixo | Escopo         | Exemplo                |
|---------|----------------|------------------------|
| `lt_`   | Local          | `lt_sales_order`       |
| `gt_`   | Global         | `gt_open_items`        |
| `it_`   | IMPORTING (parâmetro) | `it_items`      |
| `mt_`   | Membro (atributo de instância) | `mt_lines` |

### Estruturas (Work Areas)

| Prefixo | Escopo         | Exemplo                |
|---------|----------------|------------------------|
| `ls_`   | Local          | `ls_sales_order`       |
| `gs_`   | Global         | `gs_config`            |
| `is_`   | IMPORTING (parâmetro) | `is_header`      |
| `ms_`   | Membro         | `ms_data`              |

### Referências de Objetos

| Prefixo | Escopo         | Exemplo                |
|---------|----------------|------------------------|
| `lo_`   | Local          | `lo_order`             |
| `go_`   | Global         | `go_logger`            |
| `io_`   | IMPORTING (parâmetro) | `io_notifier`   |
| `mo_`   | Membro         | `mo_repo`              |
| `ro_`   | RETURNING      | `ro_instance`          |

### Field Symbols

| Prefixo | Escopo         | Exemplo                |
|---------|----------------|------------------------|
| `<lfs_>`| Local          | `<lfs_item>`           |
| `<gfs_>`| Global         | `<gfs_record>`         |

---

## Parâmetros de Métodos

| Prefixo | Diretiva       | Exemplo                     |
|---------|----------------|-----------------------------|
| `iv_`   | IMPORTING valor | `iv_order_id`              |
| `is_`   | IMPORTING estrutura | `is_header`            |
| `it_`   | IMPORTING tabela | `it_items`               |
| `io_`   | IMPORTING objeto | `io_notifier`            |
| `ev_`   | EXPORTING valor | `ev_total`                |
| `es_`   | EXPORTING estrutura | `es_result`            |
| `et_`   | EXPORTING tabela | `et_errors`              |
| `cv_`   | CHANGING valor | `cv_counter`               |
| `cs_`   | CHANGING estrutura | `cs_data`              |
| `ct_`   | CHANGING tabela | `ct_items`                |
| `rv_`   | RETURNING valor | `rv_result`               |
| `rs_`   | RETURNING estrutura | `rs_data`             |
| `rt_`   | RETURNING tabela | `rt_lines`               |
| `ro_`   | RETURNING objeto | `ro_instance`            |

---

## Classes Locais (dentro de programas)

- LCL\_[NOME NEGOCIO]
  - EX: lcl_sales_order, lcl_helper
- GCL\_[NOME NEGOCIO] (escopo de grupo de função)
  - EX: gcl_main

---

## Constantes

- `c_[NOME]` (local)
  - EX: `c_max_retries`, `c_status_open`
- `gc_[NOME]` (global / atributo de classe)
  - EX: `gc_default_currency`

---

## CDSs (CDS View Entities)

### CDS Basic
- ZI\_[NOME TABELA]
  - EX: ZI_FIT_001

### CDS Composite
- ZI\_[MODULO SAP]\_[NOME NEGOCIO] (Quando é genérica, sem regras de negócio especificas, pode ser reutilizada)
  - EX: ZI_SD_SALES_ORDER
- ZR\_[MODULO SAP]\_[NOME NEGOCIO] (Restrict, quando tem regras de negócio especificos dentro, não é bom reutilizar em outros Apps)
  - EX: ZR_SD_SALES_ORDER

### CDS Consumption (Projection)
- ZC\_[MODULO SAP]\_[NOME NEGOCIO]
  - EX: ZC_SD_SALES_ORDER

---

## RAP / OData

### Behavior Definition
- ZR\_[MODULO SAP]\_[NOME NEGOCIO] (mesmo nome da CDS ROOT)
  - EX: ZR_SD_SALES_ORDER

### Behavior Implementation
- ZBP\_[MODULO SAP]\_[NOME NEGOCIO]
  - EX: ZBP_SD_SALES_ORDER

### Service Definition
- ZUI\_[MODULO SAP]\_[NOME NEGOCIO]
  - EX: ZUI_SD_SALES_ORDER

### Service Binding
- ZUI\_[MODULO SAP]\_[NOME NEGOCIO]\_[VERSAO ODATA]
  - EX: ZUI_SD_SALES_ORDER_O2, ZUI_SD_SALES_ORDER_O4

---

## Fiori / UI5

### APP Fiori
- Nome App: Z[MODULO SAP]\_[NOME APP]
  - EX: ZSD_SALES_ORDER
- Namespace: [dominio empresarial]\_[MODULO SAP]
  - EX: br.com.empresa.fi
- Nome App Deploy: ZZ1[MODULO SAP][NOME APP]
  - EX: ZZ1SDSALESORDER
  - Max: 12 caracteres

### Launchpad
- Catálogo Técnico: ZTC\_[MODULO SAP]
  - EX: ZTC_SD
- Catálogo Negócio: ZBC\_[MODULO SAP]\_[AREA NEGOCIO]
  - EX: ZBC_SD_SALES_ORDER

---

## Módulos SAP — Referência de Siglas

| Sigla | Módulo          |
|-------|-----------------|
| FI    | Financial Accounting |
| CO    | Controlling     |
| SD    | Sales & Distribution |
| MM    | Materials Management |
| PP    | Production Planning |
| PM    | Plant Maintenance |
| HR    | Human Resources |
| PS    | Project System  |
| WM    | Warehouse Management |
| EWM   | Extended Warehouse Management |
| TM    | Transportation Management |
| QM    | Quality Management |
| CS    | Customer Service |
| RE    | Real Estate     |
