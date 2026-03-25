# RAP — Boas Práticas (ABAP RESTful Application Programming Model)

> Referência para geração e revisão de código RAP por IAs. Cobrindo a hierarquia de CDSs, Behavior Definitions, Behavior Implementations e publicação de serviços.

---

## Hierarquia obrigatória de CDSs

```
Tables → Basics → Composites → Consumptions (Projections)
```

### Basic CDS
- Representa **uma tabela** diretamente — sem lógica de negócio
- Garante alias de negócio evitando retrabalho nas camadas superiores
- Nenhum app RAP seleciona dados diretamente de tabela — **sempre via Basic**
- Sempre `CDS View Entity` (não `CDS View` legada)
- Nomenclatura: `ZI_[NOME_TABELA]` (ex: `ZI_FIT_001`, `ZI_VBAK`)

---

### Composite CDS
- Agrupa Basics e aplica **regras de negócio**: `CASE`, `ASSOCIATION`, `WHERE`, `GROUP BY`, cálculos
- Geralmente se torna a ROOT da hierarquia RAP
- Nomenclatura:
  - `ZI_[MODULO]_[NOME_NEGOCIO]` — Composite genérica, sem regras de negócio específicas
  - `ZR_[MODULO]_[NOME_NEGOCIO]` — Composite com regras de negócio (Restrict), geralmente a ROOT do RAP
- Usar Associations ao invés de JOINs sempre que possível

---

### Consumption CDS (Projection)
- CDS final de **UI** — contém annotations de UI (`@UI.*`, `@Search.*`, `@ObjectModel.*`)
- Quase sempre é a Projection de uma Composite ROOT
- Nomenclatura: `ZC_[MODULO]_[NOME_NEGOCIO]` (ex: `ZC_SD_SALES_ORDER`)

---

## Behavior Definition

### Regras

- Sempre dois behaviors: um na **Composite ROOT** e outro na **Consumption (Projection)**
- Respeitar `RESTRICT`, `ETAG`, `MAPPING`, `LOCK`, `DRAFT`
- Analisar necessidade de implementação de classe de negócio para Actions, Determinations, Validations
- Não há necessidade de tags indicando Basic/Composite/Consumption — SAP detecta automaticamente

---

## Draft Handling

- Habilitar draft quando o usuário precisar salvar rascunho antes de confirmar
- Adicionar tabela de draft e habilitar no Behavior Definition

---

### Service Binding

| Tipo de Binding              | Quando usar                   |
|------------------------------|-------------------------------|
| `OData V2 - UI`              | App Fiori Elements (Fiori V2) |
| `OData V4 - UI`              | App Fiori Elements (Fiori V4) |
| `OData V2 - Web API`         | API externa OData V2          |
| `OData V4 - Web API`         | API externa OData V4          |

- Nomenclatura: `ZUI_[MODULO]_[NOME]_O2` ou `ZUI_[MODULO]_[NOME]_O4`
- Não usar mais SEGW — apenas RAP com ADT

---

## Refatoração de ALVs para RAP

Ao refatorar um ALV para RAP, seguir a sequência:

1. Mapear hierarquia de SELECTs do ALV
2. Criar Basics para cada tabela principal
3. Criar Composites agrupando os dados necessários
4. Criar Consumptions com annotations de UI
5. Criar Behaviors (Definition + Implementation)
6. Publicar Service Definition e Service Binding
7. Configurar Launchpad (Catálogo Técnico + Catálogo de Negócio)

---

## Regras Gerais RAP

- Evitar JOINs — usar Associations nas CDSs
- Apenas FreeStyle se realmente houver necessidade (sem RAP padrão para o caso de uso)
- Não colocar tags indicando camada (Basic/Composite/Consumption) — SAP detecta pelo padrão
- Responder os eventos de lifecycle (determinations, validations, actions) conforme necessidade de negócio
- ETags são obrigatórios para controle de concorrência em entidades com `update`/`delete`
- Mappings devem ser explícitos — nunca assumir que os nomes dos campos batem automaticamente
