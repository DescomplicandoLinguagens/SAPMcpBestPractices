# APIs ABAP — Boas Práticas

> Quando não utilizamos PI/PO, as APIs serão **REST** (ICF) ou **OData** (RAP). Referência para geração e revisão de código por IAs.

---

## REST — ICF (Internet Communication Framework)

### Arquitetura obrigatória

```
SICF Node (/sap/bc/icf/api_[modulo])
  └── Handler: Z[MOD]CL_[MODULO]_HANDLER  (herda CL_REST_HTTP_HANDLER)
        └── Router → Resource classes por entidade
              Z[MOD]CL_[ENTIDADE]_RESOURCE  (herda CL_REST_RESOURCE)
```

### Regras

- Uma classe Handler por módulo SAP (ex: `ZSDCL_SD_HANDLER`)
- Handler registra todas as rotas do módulo via `cl_rest_router`
- Cada Resource implementa os métodos HTTP necessários: `IF_REST_RESOURCE~GET`, `POST`, `PUT`, `DELETE`
- Lógica de negócio em classes de serviço separadas — Resource só faz parse/serialização
- Respostas sempre em JSON
- Usar códigos HTTP corretos: 200, 201, 400, 404, 500
- Tratar exceções e retornar erro estruturado

---

### Publicação no SICF

- Nó: `/sap/bc/icf/api_[modulo]`
  - EX: `/sap/bc/icf/api_sd`, `/sap/bc/icf/api_fi`
- Handler class atribuída ao nó
- Ativar o nó (SICF)
- Sempre respeitar o conceito de módulos SAP — um nó por módulo

---

### Autenticação / Segurança

- Usar autenticação SAP padrão (Basic Auth via SICF) ou JWT/OAuth conforme landscape
- Validar permissões de autorização ABAP no método de negócio (não no Resource)
- Nunca expor dados sensíveis em mensagens de erro para o cliente

---

## OData — RAP

- Implementar toda a base do RAP, seguindo as boas práticas do `abap-rap.md`
- Ao publicar o Service Binding, utilizar tipo **API** ao invés de UI
- Não utilizar mais o conceito de SEGW — apenas RAP + ADT
- Para APIs OData V4: binding `OData V4 - Web API`
- Para APIs OData V2: binding `OData V2 - Web API`

---

## Regras Gerais de APIs

| Regra | Detalhe |
|-------|---------|
| Separação de responsabilidades | Resource/Handler: parse e serialização; Service/Repo: negócio e dados |
| JSON como padrão | Usar `/ui2/cl_json` ou `cl_fpm_json_serializer` |
| HTTP Status corretos | 200 OK, 201 Created, 400 Bad Request, 404 Not Found, 500 Server Error |
| Exceções tipadas | `cx_*` no serviço, capturar no Resource e traduzir para HTTP status |
| Sem lógica de negócio no Handler | Handler só roteia |
| Sem SELECT no Resource | Delegar para classes de serviço/repositório |
| Documentação da API | Descrever rotas, parâmetros e payloads em comentário ou doc externo |
