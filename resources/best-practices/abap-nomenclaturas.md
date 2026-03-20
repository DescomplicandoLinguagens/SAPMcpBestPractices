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



🏷️ Clean ABAP Resource: Naming & Semantics (Deep Dive)
1. A Regra de Ouro: "No Encodings" (Sem Prefixos)
A IA deve ignorar a prática legada de indicar o tipo ou escopo no nome da variável.

PROIBIDO (Legacy): lv_vbeln, ls_data, lt_items, mt_table, iv_id, rv_result.

OBRIGATÓRIO (Clean): sales_order, data, items, id, result.

Por que: O editor moderno (ADT/Eclipse) já mostra o tipo ao passar o mouse. O nome deve descrever o conteúdo, não o tipo técnico.

2. Padrão de Escrita: Snake_Case
Diferente de outras linguagens que usam CamelCase, o Clean ABAP padroniza tudo em minusculúsculas com underline.

Exemplo: get_customer_details em vez de GetCustomerDetails.

3. Classes e Interfaces
Classes: Devem ser substantivos. Ex: cl_invoice_processor.

Interfaces: Devem começar com IF_ seguido de um substantivo ou adjetivo. Ex: if_serializable.

Instâncias: Não use lo_obj. Use o nome do que o objeto representa. Ex: processor = new cl_invoice_processor( ).

4. Métodos (Verbos)
Devem começar com um verbo que indique a ação.

Getters: Use get_... para buscar valores.

Checkers/Booleans: Use prefixos que indiquem pergunta, como is_..., has_..., can_..., should_....

Exemplo: is_valid, has_items, should_calculate_tax.

5. Parâmetros de Métodos
Ao definir a assinatura de um método, a IA deve remover os prefixos i, e, c, r (importing, exporting, changing, returning).

Ruim: IMPORTING iv_user_id TYPE string.

Bom: IMPORTING user_id TYPE string.

Contexto: Dentro do método, se houver conflito com variáveis locais, use me->user_id para referenciar o atributo da classe.

6. Tabelas Internas (Pluralidade)
Sempre use plural para tabelas e singular para estruturas/work areas.

Exemplo: ```abap
LOOP AT items INTO DATA(item). " Clean
LOOP AT lt_items INTO ls_item. " Legacy (Evitar)


7. Constantes e Enums
Constantes: Devem ser descritivas. O Clean ABAP sugere evitar o prefixo co_ se o contexto for óbvio.

Enums: Use tipos enumerados para substituir grupos de constantes relacionadas.

TYPES: BEGIN OF ENUM size,
         small,
         medium,
         large,
       END OF ENUM size.
