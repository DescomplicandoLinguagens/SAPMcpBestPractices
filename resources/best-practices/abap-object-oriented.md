# Guia Rápido – Melhores Práticas OO em ABAP (2026)

## 1. Tipos de Classes no ABAP

| Tipo              | Onde criar          | Visibilidade       | Quando usar (recomendação Clean ABAP / SOLID)                  | SOLID mais impactado |
|-------------------|----------------------|--------------------|------------------------------------------------------------------|----------------------|
| **Global**        | SE24 / Eclipse       | Sistema inteiro    | Reutilização ampla (frameworks, BOs, serviços, utilitários)     | D, I, O             |
| **Local**         | Programa / Include   | Apenas no programa | Lógica específica do report / classe auxiliar temporária        | S                   |
| **Test double**   | Local (test classes) | —                  | Unit Tests (mock / stub / fake)                                 | D                   |

**Regra de ouro 2025+**  
Prefira **globais** para tudo que possa ser reutilizado ou testado. Locais só para escopo muito restrito.

## 2. Visibilidade (Encapsulamento)

| Visibilidade   | Membros visíveis para…                              | Regra Clean ABAP / SOLID                              |
|----------------|-----------------------------------------------------|-------------------------------------------------------|
| **PUBLIC**     | Todo mundo                                          | Só o **contrato** essencial (interface pública)       |
| **PROTECTED**  | Classe + subclasses                                 | Comportamento que subclasses podem precisar redefinir |
| **PRIVATE**    | Apenas a própria classe                             | Implementação interna – **mantenha escondido**        |

**Mnemônico**: "O menor privilégio possível" → o padrão deve ser **PRIVATE**.

## 3. Instância vs Estático

| Aspecto             | **Instância** (recomendado)                     | **Estático** (`CLASS-METHODS` / `CLASS-DATA`)     |
|---------------------|--------------------------------------------------|----------------------------------------------------|
| Estado              | Pode ter atributos de instância                  | Sem estado mutável (ou estado global = perigo)    |
| Testabilidade       | Fácil (injetar dependências)                     | Difícil (não injetável)                            |
| SOLID               | Suporta D, L, O                                  | Viola D e muitas vezes S                           |
| Quando usar         | Quase sempre (BO, Service, Calculator, etc.)     | Helpers imutáveis, factory methods, constantes    |

**Regra Clean ABAP**: Evite classes 100% estáticas (utility classes). Prefira instância + injeção.

## 4. Herança vs Composição

| Conceito          | Quando usar                                      | SOLID mais afetado | Recomendação ABAP moderna |
|-------------------|--------------------------------------------------|--------------------|----------------------------|
| **Herança**       | "É-um" relacionamento verdadeiro + reuso comum   | L, O               | **Evite herança profunda** (> 2 níveis) |
| **Composição**    | "Tem-um" relacionamento                          | D, S               | **Preferida** na maioria dos casos |
| **Delegação**     | Classe delega para outra (wrapper/facade)        | D, O               | Muito usada em ABAP RAP/BO |

## 5. Abstract, Interface, Final

| Construto       | Característica principal                          | Quando usar (Clean ABAP / SOLID)                               |
|-----------------|---------------------------------------------------|-----------------------------------------------------------------|
| **ABSTRACT CLASS** | Pode ter implementação + métodos abstratos       | Template com comportamento comum + extensão obrigatória (O,L)  |
| **INTERFACE**   | Somente contrato (sem implementação)              | Múltipla "herança", contratos claros, injeção (D,I)            |
| **FINAL**       | Não pode ser herdada                              | Proteger classes que não devem ser estendidas (defesa L + O)  |

**Decisão rápida**  
- Precisa de implementação padrão compartilhada? → **Abstract class**  
- Precisa de múltipla herança ou contrato puro? → **Interface**  
- Classe não deve ser estendida (ex: DTO, Value Object)? → **FINAL**

## 6. Friends

- **Uso principal**: Testes unitários (test class como friend para acessar private/protected)
- **Uso em produção**: **Muito raro** e **desencorajado** (quebra encapsulamento)
- **Regra**: Só use `FRIENDS` em classes de teste locais

## 7. SOLID aplicado em ABAP – Resumo prático

| Princípio | Nome                        | Tradução livre no ABAP                                      | Como violar (ruim)                                 | Como aplicar (bom)                                      |
|-----------|-----------------------------|-------------------------------------------------------------|----------------------------------------------------|-----------------------------------------------------------------|
| **S**     | Single Responsibility       | Uma classe → uma responsabilidade                          | Classe `ZCL_VENDA` que calcula, salva e envia email | `ZCL_VENDA_CALCULO`, `ZCL_VENDA_PERSISTENCIA`, `ZCL_EMAIL_SENDER` |
| **O**     | Open/Closed                 | Aberta para extensão, fechada para modificação              | Alterar classe existente para novo tipo cliente    | Interface + novas classes concretas / Strategy pattern         |
| **L**     | Liskov Substitution         | Subclasse deve ser substituível pela super sem quebrar     | Redefinir método e mudar completamente o contrato  | Respeitar pré/pós-condições da superclasse                     |
| **I**     | Interface Segregation       | Interfaces pequenas e específicas                           | Interface gigante com 15 métodos                   | Várias interfaces pequenas (`IF_CALCULO`, `IF_PERSISTENCIA`)   |
| **D**     | Dependency Inversion        | Dependa de abstrações, não de implementações                | `CREATE OBJECT lo_db ACCESS #ZCL_DB_REAL`          | Injeção via construtor / interface + factory                   |

## Resumo – Checklist Rápido ao criar uma classe

1. É reutilizável em outros programas? → **Global** (SE24)
2. Tem estado? → **Instância** (evite 100% static)
3. É um contrato que várias classes podem implementar? → **INTERFACE**
4. Tem implementação compartilhada que subclasses usam? → **ABSTRACT CLASS**
5. Não deve ser herdada? → **FINAL**
6. Faz mais de uma coisa? → Divida (S)
7. Alguém vai precisar trocar a dependência no teste? → Injeção via interface + construtor (D)
8. Alguém vai precisar estender sem modificar? → Interface + novas classes concretas (O)
9. Precisa acessar private para teste? → `FRIENDS` só na test class
10. Interface muito grande? → Quebre em várias menores (I)

**Frase para colar no monitor**  
"Classes pequenas, interfaces finas, injeção no construtor, composição > herança, final por padrão."

Boa codificação! 🚀
