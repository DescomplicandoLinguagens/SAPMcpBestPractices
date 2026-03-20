1. Princípios Gerais e Nomes
Use nomes descritivos: Nomes devem revelar a intenção e o conteúdo. Evite focar no tipo de dado ou codificação técnica.

Domínio da solução e do problema: Prefira termos que façam sentido para o negócio ou para a arquitetura do software.

Use plural: Utilize para coleções e tabelas.

Nomes pronunciáveis: Evite siglas obscuras ou combinações de letras impronunciáveis.

Snake_case: O padrão para nomes no ABAP deve seguir o uso de sublinhados.

Evite abreviações: A menos que sejam amplamente conhecidas e usadas consistentemente em todo o projeto.

Substantivos para classes e Verbos para métodos: Classes representam objetos; métodos representam ações.

Evite palavras de ruído: Remova termos como "data", "info", "object" ou "table" dos nomes se eles não agregarem valor real.

Um termo por conceito: Escolha uma palavra para uma ideia (ex: "get" ou "read") e mantenha-a em todo o sistema.

Evite Notação Húngara: Não utilize prefixos técnicos (como lv_, mt_, gt_). O foco deve ser no significado, não no escopo ou tipo.

2. Linguagem e Estilo
Prefira Orientação a Objetos (OO): Use classes e interfaces em vez de programação procedural (fórmulas, módulos de função e sub-rotinas).

Elementos obsoletos: Evite palavras-chave e construções que foram substituídas por versões mais modernas (ex: use DATA(...) em vez de declarações separadas).

Constantes: Use constantes em vez de "números mágicos" ou strings fixas. Elas também precisam de nomes descritivos.

Enums: Prefira o uso de ENUM para conjuntos de valores relacionados em vez de interfaces de constantes.

Declarações Inline: Prefira declarar variáveis no momento do uso para reduzir o escopo e melhorar a leitura.

3. Tabelas Internas
Tipo de tabela correto: Escolha entre STANDARD, SORTED ou HASHED com base na necessidade de performance e acesso.

Evite Chave Padrão (Default Key): Sempre defina chaves explicitamente para evitar comportamentos inesperados.

Operações Modernas: Prefira INSERT INTO TABLE a APPEND. Use LINE_EXISTS para verificações de existência e VALUE para preenchimento.

Filtros: Use LOOP AT ... WHERE em vez de processar todos os registros com um IF interno.

4. Condições e Fluxo de Controle
Condições Positivas: É mais fácil ler IF is_valid do que IF NOT is_invalid.

Extração de Condições: Se uma condição lógica for complexa, extraia-a para um método booleano com nome descritivo.

Evite Ninhos (Nesting): Mantenha a profundidade de indentação baixa. Use cláusulas de guarda (fail fast) para sair do método cedo se algo estiver errado.

CASE vs ELSE IF: Use CASE quando houver múltiplas alternativas para a mesma variável.

5. Métodos e Classes
Faça apenas uma coisa: Cada método deve ter uma única responsabilidade (Single Responsibility Principle).

Tamanho: Mantenha os métodos pequenos e focados em um nível de abstração.

Parâmetros: Tente manter o número de parâmetros baixo (idealmente menos de 3).

Retorno: Prefira RETURNING a EXPORTING para métodos funcionais. Use CHANGING raramente.

Visibilidade: Membros devem ser PRIVATE por padrão. Use PROTECTED apenas se necessário para herança e PUBLIC apenas para a interface externa.

Interfaces: Prefira programar voltado para interfaces em vez de implementações específicas para facilitar o desacoplamento e testes.

6. Tratamento de Erros
Exceções Baseadas em Classes: Use RAISE EXCEPTION em vez de códigos de retorno (subrc) ou mensagens clássicas.

Não silencie erros: Nunca deixe um bloco CATCH vazio sem tratamento ou log.

Exceções para erros reais: Não use exceções para controlar o fluxo normal do programa.

7. Comentários
Código autoexplicativo: O melhor comentário é um código bem escrito e bem nomeado.

Explique o "Porquê", não o "O quê": Não descreva o que o comando faz (o compilador já sabe), descreva a intenção ou a regra de negócio por trás.

Remova código comentado: Use o controle de versão (Git/CTS) para recuperar código antigo; não "estoque" lixo no arquivo atual.

8. Formatação e Testes
Consistência: Siga o padrão do time. Use o ABAP Formatter (Pretty Printer) de forma padronizada.

Testes Unitários (ABAP Unit): Escreva código testável. O código de teste deve ser tão limpo quanto o código de produção.

Injeção de Dependência: Use técnicas que permitam substituir dependências reais por objetos de teste (mocks/stubs).
