APIS quando não utilizamos PO, ou serão REST ou ODATA.

Regras REST:

- Implementar uma classe que herda de Handler: CL_REST_HTTP_HANDLER
- Implementar uma classe que herda de Resources: CL_REST_RESOURCE
- Na classe Handler criada, implementar a chamada de classes de negócio.
  - EX:
    DATA(lo_router) = NEW cl_rest_router( ).
    lo_router->attach( iv_template = |/get_sales_order| iv_handler_class = |ZSDCL_SALES_ORDER| ).
    ro_root_handler = lo_router.
- Publicar um Nó na SICF:
  - EX: /sap/bc/icf/api_sd
  - Sempre respeitando o conceito de módulos SAP
  - O Handler deverá ter todas as rotas necessárias para o módulo

Regras ODATA:

- Implementar toda a base do RAP, seguindo as boas práticas do abap-rap.md
- Ao publicar o Service Binding, vamos utilizar API ao invés de UI
- Não utilizamos mais o conceito de SEGW
