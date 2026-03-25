---
name: SAP MCP Best Practices — Estrutura do Projeto
description: Contexto sobre os arquivos de boas práticas ABAP e suas responsabilidades
type: project
---

Projeto de best practices para geração e validação de código ABAP por IAs via MCP.

**Arquivos em resources/best-practices/:**
- `abap-nomenclaturas.md` — padrões de nomenclatura completos (prefixos lv_, lt_, lo_, iv_, rv_, ZIF_, etc.)
- `clean-abap.md` — Clean Code adaptado para ABAP com exemplos de código
- `abap-object-oriented.md` — OOP ABAP com SOLID, classes, interfaces, exceções
- `abap-alv.md` — regras para ALV Grid (cl_salv_table) e ALV IDA com exemplos
- `abap-apis.md` — APIs REST (ICF/CL_REST_RESOURCE) e OData (RAP)
- `abap-rap.md` — hierarquia de CDSs, Behavior Definition/Implementation, Draft, Actions

**Why:** O usuário usa esses arquivos como contexto para IAs gerarem e validarem código ABAP seguindo os padrões da empresa.

**How to apply:** Ao sugerir código ABAP, sempre seguir os padrões de nomenclatura e estrutura desses arquivos. A nomenclatura dos prefixos (lv_, lt_, iv_, rv_, ZR_, ZI_, ZC_, etc.) é obrigatória.
