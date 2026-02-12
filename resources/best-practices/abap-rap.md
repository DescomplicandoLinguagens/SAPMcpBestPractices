- Sempre seguir a hierarquia de CDSs:
- Basic
  - CDS que representa uma tabela diretamente, garantindo os alias de negócio evitando retrabalho
  - Nenhum App RAP deve selecionar dados diretamente de tabela, temos sempre que utilizar CDS Basic
  - CDS View Entity
- Composite
  - Composites são CDSs que nós utilizamos para agrupar basics para chegarmos as fontes de dados necessárias de negócio
  - Composite é que tem regras de negócio como CASES, ASSOCIATIONS, WHERES, GROUP BY, ETC.
  - Geralmente uma Composite se torna uma ROOT em casos do RAP
- Consumption
  - Consumption é a CDS final de UI, ela que vai ter as annotations de UI
  - Ela quase sempre é a Projection de uma Composite ROOT

Regras:

- Evitamos ao máximo utilizar JOINs
- Sempre utilizar Associations ao invés de JOINs
- Ao criar Behaviors devemos respeitar os RESTRICTS, ETAGS, MAPPINGS, etc.
- Teremos sempre dois behaviors, um da Composite ROOT e o outro da Projection Consumption
- Analisar sempre qual a necessidade de se implementar a classe do behavior de negócio para controlar eventos como Actions, Determinations, etc.
- Não há necessidade de se colocar tags para indicar que é Basic, Composite ou Consumption, isso é feito automaticamente pelo SAP.

Refatoração de ALVS:
Caso seja solicitado uma refatoração de ALVS, deve primeiro montar a hierarquida de selects, definir as Basics e Composites necessários, criar as Consumption e os Behaviors necessários,
Sempre respeitando as regras de negócio, filtros e as melhores práticas da SAP.
