# Boas Práticas ABAP no S/4HANA

Este guia foca nas funcionalidades modernas do ABAP (7.40+) e otimizações para HANA.

## 1. Sintaxe ABAP Moderna (7.40+)

Aproveite as novas funcionalidades para deixar o código mais conciso.

### Declarações Inline

Evite declarações de dados no topo da rotina quando possível.

```abap
" Antes
DATA: lv_name TYPE string.
lv_name = 'SAP'.

" Depois
DATA(lv_name) = 'SAP'.
```

### Operadores de Construtor

Utilize `VALUE`, `CORRESPONDING`, `COND`, `SWITCH`, etc.

```abap
" VALUE para estruturas
DATA(ls_data) = VALUE ty_data( id = 1 name = 'Test' ).

" VALUE para tabelas internas
DATA(lt_data) = VALUE ty_t_data(
  ( id = 1 name = 'A' )
  ( id = 2 name = 'B' )
).
```

### Loops com Referência ou Assign

Para performance em loops grandes, prefira `ASSIGNING FIELD-SYMBOL` ou `REFERENCE INTO`.

```abap
LOOP AT lt_large_table ASSIGNING FIELD-SYMBOL(<fs_line>).
  <fs_line>-status = 'X'.
ENDLOOP.

LOOP AT lt_large_table REFERENCE INTO DATA(rf_line).
  rf_line->status = 'X'.
ENDLOOP.
```

## 2. Performance e Banco de Dados (HANA)

### SELECTs Otimizados

- Selecione apenas as colunas necessárias (`SELECT col1, col2...`).
- Evite `SELECT *` a menos que realmente precise de todas as colunas.
- Utilize `INTO TABLE` para buscar múltiplos registros de uma vez.
- Prefira JOINS a `FOR ALL ENTRIES` quando possível e performático.
- Procure utilizar o code pushdown quando possível.
- Transforme selects complexos em CDSs.

## 3. Documentação de Padrões: S/4HANA & HANA Native

### 1. Core Data Services (CDS)

As CDS Views devem ser organizadas em camadas seguindo o princípio do **Virtual Data Model (VDM)**.

#### 1.1. Camadas de Desenvolvimento (VDM)

| Camada          | Prefixo        | Descrição                                                                                                                  |
| :-------------- | :------------- | :------------------------------------------------------------------------------------------------------------------------- |
| **Basic**       | `ZI_`          | Views básicas criadas apenas com os campos preenchidos no ambiente (ex: se a BSEG usa 20 colunas, criar apenas com as 20). |
| **Composite**   | `ZI_` ou `ZR_` | **ZI** para quando há reutilização; **ZR** quando restrito a um contexto de negócio.                                       |
| **Consumption** | `ZC_`          | Camada de consumo final para a UI.                                                                                         |

#### 1.2. Padrões Adicionais de CDS

- **Search Help**: Para CDS utilizadas como Search Help, utilizar o sufixo `_SH` (ex: `ZI_SD_PEDIDO_SH`).
- **Access Control (DCL)**: Deve utilizar o **mesmo nome** da View de dados à qual se refere.
- **Metadata Extension**: Utilizar exatamente o **mesmo nome** da CDS a que se refere.

### 2. Objetos HANA e AMDP

Nomenclatura para objetos que executam lógica diretamente no banco de dados.

| Objeto                      | Padrão de Nome                                                        |
| :-------------------------- | :-------------------------------------------------------------------- |
| **Table Function (AMDP)**   | `ZTB_[MD]_[Descrição]`                                                |
| **Classe de Implementação** | `ZCL_[MD]_[Descrição]`                                                |
| **Método AMDP**             | Deve iniciar com `AMDP_` seguido da ação (ex: `AMDP_GET_DATA`).       |
| **Calculation View**        | A external view no dicionário deve seguir o padrão `ZEXV[MD]_[Nome]`. |

### 3. Comunicação e Serviços (OData)

Padrões para exposição de dados via Gateway ou RAP.

#### 3.1. Service Definition & Binding

- **Service Definition**: `ZUI_[MD]_[Desc]` para UI5 ou `ZAPI_[MD]_[Desc]` para APIs externas.
- **Service Binding**:
  - **OData V2 (UI5)**: `ZUI_[MD]_[Desc]_02`
  - **OData V4 (UI5)**: `ZUI_[MD]_[Desc]_04`
  - **OData V2 (API)**: `ZAPI_[MD]_[Desc]_02`

#### 3.2. Projeto SEGW (Classic OData)

- **Projeto**: `Z[MD]_[Descrição]`
- **Classes Geradas**: Ao gerar classes via SEGW, os nomes devem ser alterados manualmente para o padrão:
  - `ZCL[MD]_[Desc]_MPC_EXT`
  - `ZCL[MD]_[Desc]_DPC_EXT`

### 4. Integrações via SPROXY

- **Prefixo de Geração**: Todos os objetos gerados via SPROXY devem utilizar o prefixo `Z[MD]_` no momento da criação da Interface de Serviço.
- **Nota**: Objetos gerados automaticamente pelo proxy podem ter prefixos diferentes do padrão ABAP Doc, mas devem ser mantidos conforme a geração automática para evitar erros de ativação.

## 5. Diretrizes Clean ABAP (S/4HANA Moderno)

Baseado no guia [SAP Clean ABAP](https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md).

### Variáveis e Strings

- **Declaração Inline**: Sempre prefira `DATA(var) = ...` onde a variável é usada pela primeira vez.
- **Escopo**: Variáveis não devem ser usadas fora do bloco onde foram declaradas (ex: variável declarada dentro de `LOOP` não deve ser acessada fora).
- **Literais**:
  - Use crase `` `Texto` `` para strings (`string`).
  - Use aspas simples `'Texto'` apenas para `char` fixo de tamanho definido (legado).
  - Use templates `|Texto { var }|` para concatenação.

### Tabelas Internas

- **Chaves**: Evite `WITH DEFAULT KEY`. Sempre especifique a chave (`WITH EMPTY KEY` ou chaves explícitas).
- **Inserção**: Prefira `INSERT ... INTO TABLE` em vez de `APPEND TO`.
- **Verificação**: Prefira `line_exists( ... )` em vez de `READ TABLE ... TRANSPORTING NO FIELDS`.
- **Leitura**: Prefira `try. result = itab[ ... ]. catch cx_sy_itab_line_not_found. endtry.` para leituras simples.

### Nomenclatura Moderna (Opcional/Clean)

O Clean ABAP sugere **abandonar a Notação Húngara** (prefixos de tipo como `lv_`, `gt_`) em favor de nomes descritivos, pois os IDEs modernos (Eclipse/ADT) já mostram os tipos.
_Nota: Siga o padrão do projeto (se Classic ou Modern)._

- **Preferir**: `customer_name`, `invoice_items`.
- **Evitar**: `lv_kunnr`, `lt_vbap`.

### Métodos e Classes

- **Booleanos**: Use `xsdbool( )` para setar variáveis booleanas e métodos que retornam booleanos (`is_valid`, `has_error`).
- **Tamanho**: Métodos devem ser curtos e fazer apenas uma coisa (Single Responsibility).

### Evite palavras de ruído como "data", "info", "object"

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Nomes](#nomes) > [Esta seção](#evite-palavras-de-ruído-como-data-info-object)

Omita palavras de ruído

```ABAP
account  " em vez de account_data
alert    " em vez de alert_object
```

ou substitua-as por algo específico que realmente adicione valor

```ABAP
user_preferences          " em vez de user_info
response_time_in_seconds  " em vez de response_time_variable
```

> Leia mais no _Capítulo 2: Meaningful Names: Make Meaningful Distinctions_ de [Robert C. Martin's _Clean Code_]

### Escolha uma palavra por conceito

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Nomes](#nomes) > [Esta seção](#escolha-uma-palavra-por-conceito)

```ABAP
METHODS read_this.
METHODS read_that.
METHODS read_those.
```

Escolha um termo para um conceito e mantenha-se fiel a ele; não misture outros sinónimos.
Sinónimos farão o leitor perder tempo a encontrar uma diferença que não existe.

```ABAP
" anti-padrão
METHODS read_this.
METHODS retrieve_that.
METHODS query_those.
```

> Leia mais no _Capítulo 2: Meaningful Names: Pick One Word per Concept_ de [Robert C. Martin's _Clean Code_]

### Use nomes de padrões apenas se tiver a intenção

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Nomes](#nomes) > [Esta seção](#use-nomes-de-padrões-apenas-se-tiver-a-intenção)

Não use os nomes de padrões de design de software para classes e interfaces a menos que realmente queira dizer isso.
Por exemplo, não chame à sua classe `file_factory` a menos que ela realmente implemente o padrão de design factory.
Os padrões mais comuns incluem:
[singleton](https://pt.wikipedia.org/wiki/Singleton_pattern),
[factory](https://pt.wikipedia.org/wiki/Factory_method_pattern),
[facade](https://pt.wikipedia.org/wiki/Facade_pattern),
[composite](https://pt.wikipedia.org/wiki/Composite_pattern),
[decorator](https://pt.wikipedia.org/wiki/Decorator_pattern),
[iterator](https://pt.wikipedia.org/wiki/Iterator_pattern),
[observer](https://pt.wikipedia.org/wiki/Observer_pattern), e
[strategy](https://pt.wikipedia.org/wiki/Strategy_pattern).

> Leia mais no _Capítulo 2: Meaningful Names: Avoid Disinformation_ de [Robert C. Martin's _Clean Code_]

### Evite codificações, esp. notação Húngara e prefixos

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Nomes](#nomes) > [Esta seção](#evite-codificações-esp-notação-húngara-e-prefixos)

Encorajamo-lo a livrar-se de _todos_ os prefixos de codificação.

```ABAP
METHOD add_two_numbers.
  result = a + b.
ENDMETHOD.
```

em vez do desnecessariamente mais longo

```ABAP
METHOD add_two_numbers.
  rv_result = iv_a + iv_b.
ENDMETHOD.
```

> [Evite Codificações](sub-sections/AvoidEncodings.md)
> descreve o raciocínio em profundidade.

### Evite obscurecer funções embutidas

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Nomes](#nomes) > [Esta seção](#evite-obscurecer-funções-embutidas)

Dentro de uma classe, uma função embutida é sempre obscurecida por métodos da classe se tiverem o mesmo nome, independentemente do número e tipo de argumentos na função. A função é também obscurecida independentemente do número e tipo de parâmetros do método. Funções embutidas são, por exemplo, `condense( )`, `lines( )`, `line_exists( )`, `strlen( )`, etc.

```ABAP
"anti-padrão
METHODS lines RETURNING VALUE(result) TYPE i.
METHODS line_exists RETURNING VALUE(result) TYPE i.
```

```ABAP
"anti-padrão
CLASS-METHODS condense RETURNING VALUE(result) TYPE i.
CLASS-METHODS strlen RETURNING VALUE(result) TYPE i.
```

> Leia Mais em [Built-In Functions - Obscuring with Methods](https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-us/abenbuilt_in_functions_syntax.htm).

## Linguagem

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Esta seção](#linguagem)

### Tenha em mente o legado

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Linguagem](#linguagem) > [Esta seção](#tenha-em-mente-o-legado)

Se codifica para versões ABAP mais antigas, tome os conselhos neste guia com cuidado:
Muitas recomendações abaixo fazem uso de sintaxe e construções relativamente novas
que podem não ser suportadas em versões ABAP mais antigas.
Valide as diretrizes que quer seguir na versão mais antiga que deve suportar.
Não descarte simplesmente o Clean Code como um todo -
a vasta maioria das regras (ex. nomenclatura, comentários) funcionará em _qualquer_ versão ABAP.

### Tenha em mente o desempenho

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Linguagem](#linguagem) > [Esta seção](#tenha-em-mente-o-desempenho)

Se codifica componentes de alto desempenho, tome os conselhos neste guia com cuidado:
Alguns aspetos do Clean Code podem tornar as coisas mais lentas (mais chamadas de métodos) ou consumir mais memória (mais objetos).
O ABAP tem algumas especialidades que podem intensificar isto, por exemplo compara tipos de dados ao chamar um método,
de tal forma que dividir um único método grande em muitos sub-métodos pode tornar o código mais lento.

No entanto, recomendamos fortemente que não otimize prematuramente, com base em medos obscuros.
A vasta maioria das regras (ex. nomenclatura, comentários) não tem qualquer impacto negativo.
Tente construir as coisas de uma forma limpa e orientada a objetos.
Se algo for demasiado lento, faça uma medição de desempenho.
Só então deve tomar uma decisão baseada em factos para descartar regras selecionadas.

Alguns pensamentos adicionais, tirados em parte do Capítulo 2 de
[Martin Fowler's _Refactoring_](https://martinfowler.com/books/refactoring.html):

Numa aplicação típica, a maioria do tempo de execução é gasto numa proporção muito pequena
do código. Tão pouco quanto 10% do código pode ser responsável por 90% do tempo de execução, e especialmente
em ABAP uma grande proporção do tempo de execução é provável que seja tempo de base de dados.

Assim, não é o melhor uso de recursos gastar esforço significativo a tentar tornar _todo_
o código super-eficiente o tempo todo. Não estamos a sugerir ignorar o desempenho, mas sim
focar mais em código limpo e bem estruturado durante o desenvolvimento inicial, e usar o
profiler para identificar áreas críticas a otimizar.

De facto, argumentaríamos que tal abordagem terá um efeito positivo líquido no desempenho
porque é um esforço de otimização mais direcionado, e deve ser mais fácil
identificar gargalos de desempenho e mais fácil refatorar e afinar código bem estruturado.

### Prefira orientação a objetos a programação procedural

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Linguagem](#linguagem) > [Esta seção](#prefira-orientação-a-objetos-a-programação-procedural)

Programas orientados a objetos (classes, interfaces) são melhor segmentados
e podem ser refatorados e testados mais facilmente do que código procedural (funções, programas).
Embora existam situações onde deve fornecer objetos procedurais
(uma função para uma RFC, um programa para uma transação),
estes objetos devem fazer pouco mais do que chamar uma classe correspondente que fornece a funcionalidade real:

```ABAP
FUNCTION check_business_partner [...].
  DATA(validator) = NEW /clean/biz_partner_validator( ).
  result = validator->validate( business_partners ).
ENDFUNCTION.
```

> [Grupos de Funções vs. Classes](sub-sections/FunctionGroupsVsClasses.md)
> descreve as diferenças em detalhe.

### Prefira construções de linguagem funcionais a procedurais

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Linguagem](#linguagem) > [Esta seção](#prefira-construções-de-linguagem-funcionais-a-procedurais)

Elas são geralmente mais curtas e surgem mais naturalmente para programadores modernos.

```ABAP
DATA(variable) = 'A'.
" MOVE 'A' TO variable.

DATA(uppercase) = to_upper( lowercase ).
" TRANSLATE lowercase TO UPPER CASE.

index += 1.         " >= NW 7.54
index = index + 1.  " < NW 7.54
" ADD 1 TO index.

DATA(object) = NEW /clean/my_class( ).
" CREATE OBJECT object TYPE /dirty/my_class.

result = VALUE #( FOR row IN input ( row-text ) ).
" LOOP AT input INTO DATA(row).
"  INSERT row-text INTO TABLE result.
" ENDLOOP.

DATA(line) = value_pairs[ name = 'A' ]. " entry must exist
DATA(line) = VALUE #( value_pairs[ name = 'A' ] OPTIONAL ). " entry can be missing
" READ TABLE value_pairs INTO DATA(line) WITH KEY name = 'A'.

DATA(exists) = xsdbool( line_exists( value_pairs[ name = 'A' ] ) ).
IF line_exists( value_pairs[ name = 'A' ] ).
" READ TABLE value_pairs TRANSPORTING NO FIELDS WITH KEY name = 'A'.
" DATA(exists) = xsdbool( sy-subrc = 0 ).
```

Muitas das regras detalhadas abaixo são apenas reiterações específicas deste conselho geral.

### Evite elementos de linguagem obsoletos

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Linguagem](#linguagem) > [Esta seção](#evite-elementos-de-linguagem-obsoletos)

Ao atualizar a sua versão ABAP,
certifique-se de verificar elementos de linguagem obsoletos
e abstenha-se de os usar.

Por exemplo, as variáveis "host" com escape `@`
na seguinte instrução tornam um pouco mais claro
o que é uma variável de programa e o que é uma coluna na base de dados,

```ABAP
SELECT *
  FROM spfli
  WHERE carrid = @carrid AND
        connid = @connid
  INTO TABLE @itab.
```

em comparação com a [forma não escapada obsoleta](https://help.sap.com/doc/abapdocu_750_index_htm/7.50/en-US/abenopen_sql_hostvar_obsolete.htm)

```ABAP
SELECT *
  FROM spfli
  WHERE carrid = carrid AND
        connid = connid
  INTO TABLE itab.
```

Alternativas mais novas tendem a melhorar a legibilidade do código,
e reduzir conflitos de design com paradigmas de programação modernos,
de tal forma que mudar para elas pode limpar automaticamente o seu código.

Enquanto continuam a funcionar, elementos obsoletos podem deixar de beneficiar
de otimizações em termos de velocidade de processamento e consumo de memória.

Com elementos de linguagem modernos, pode integrar jovens programadores ABAP mais facilmente,
que podem já não estar familiarizados com as construções desatualizadas
porque já não são ensinadas nos treinos da SAP.

A documentação SAP NetWeaver contém uma seção estável
que lista elementos de linguagem obsoletos, por exemplo
[NW 7.50](https://help.sap.com/doc/abapdocu_750_index_htm/7.50/en-US/index.htm?file=abenabap_obsolete.htm),
[NW 7.51](https://help.sap.com/doc/abapdocu_751_index_htm/7.51/en-US/index.htm?file=abenabap_obsolete.htm),
[NW 7.52](https://help.sap.com/doc/abapdocu_752_index_htm/7.52/en-US/index.htm?file=abenabap_obsolete.htm),
[NW 7.53](https://help.sap.com/doc/abapdocu_753_index_htm/7.53/en-US/index.htm?file=abenabap_obsolete.htm),
[NW 7.54](https://help.sap.com/doc/abapdocu_754_index_htm/7.54/en-US/index.htm?file=abenabap_obsolete.htm),
[NW 7.55](https://help.sap.com/doc/abapdocu_755_index_htm/7.55/en-US/index.htm?file=abenabap_obsolete.htm),
[NW 7.56](https://help.sap.com/doc/abapdocu_756_index_htm/7.56/en-US/index.htm?file=abenabap_obsolete.htm),
[NW 7.57](https://help.sap.com/doc/abapdocu_757_index_htm/7.57/en-US/index.htm?file=abenabap_obsolete.htm).

### Use padrões de design sabiamente

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Linguagem](#linguagem) > [Esta seção](#use-padrões-de-design-sabiamente)

Onde eles são apropriados e fornecem benefício notável.
Não aplique padrões de design em todo o lado apenas por fazer.

## Constantes

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Esta seção](#constantes)

### Use constantes em vez de números mágicos

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Constantes](#constantes) > [Esta seção](#use-constantes-em-vez-de-números-mágicos)

```ABAP
IF abap_type = cl_abap_typedescr=>typekind_date.
```

é mais claro do que

```ABAP
" anti-padrão
IF abap_type = 'D'.
```

> Leia mais no _Capítulo 17: Smells and Heuristics: G25:
> Replace Magic Numbers with Named Constants_ de [Robert C. Martin's _Clean Code_].

### Constantes também precisam de nomes descritivos

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Constantes](#constantes) > [Esta seção](#constantes-também-precisam-de-nomes-descritivos)

Existe uma tendência histórica no ABAP de envolver cada literal em constantes, muitas vezes com nomes
que meramente repetem o seu conteúdo ou até apenas o seu tipo:

```ABAP
" anti-padrão
CONSTANTS:
  c_01 TYPE spart VALUE '01',
  c_mmsta TYPE mmsta VALUE '90'.
```

Existe pouco benefício em qualquer variante. Não é informativo para o leitor, e se
o valor alguma vez precisar de mudar, então uma constante nomeada pelo seu valor também deve ser renomeada.

Se uma constante codificada é declarada no código então ela deve descrever o seu significado não o seu conteúdo.

```ABAP
CONSTANTS status_inactive TYPE mmsta VALUE '90'.
```

É claro aceitável repetir o valor da constante se já for suficientemente descritivo:

```ABAP
CONSTANTS status_cancelled TYPE sww_wistat value 'CANCELLED'.
```

> Nota: Esta seção é uma especialização de [Use nomes descritivos](#use-nomes-descritivos), aplicada a constantes.

### Prefira ENUM a interfaces de constantes

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Constantes](#constantes) > [Esta seção](#prefira-enum-a-interfaces-de-constantes)

Use enumerações nativas do ABAP com `ENUM` (disponível em releases >= 7.51)

```ABAP
CLASS /clean/message_severity DEFINITION PUBLIC ABSTRACT FINAL.
  PUBLIC SECTION.
    TYPES: BEGIN OF ENUM type,
             warning,
             error,
            END OF ENUM type.
ENDCLASS.
```

em vez de misturar coisas não relacionadas
ou induzir pessoas à conclusão errada
de que coleções de constantes poderiam ser "implementadas":

```ABAP
" anti-padrão
INTERFACE /dirty/common_constants.
  CONSTANTS:
    warning      TYPE symsgty VALUE 'W',
    transitional TYPE i       VALUE 1,
    error        TYPE symsgty VALUE 'E',
    persisted    TYPE i       VALUE 2.
ENDINTERFACE.
```

> [Enumerações](sub-sections/Enumerations.md)
> descreve padrões de enumeração alternativos (também aplicáveis a releases mais antigas que não suportam `ENUM` ainda)
> e discute as suas vantagens e desvantagens.
>
> Leia mais no _Capítulo 17: Smells and Heuristics: J3: Constants versus Enums_ de [Robert C. Martin's _Clean Code_].

### Se não usa ENUM ou padrões de enumeração, agrupe as suas constantes

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Constantes](#constantes) > [Esta seção](#se-não-usa-enum-ou-padrões-de-enumeração-agrupe-as-suas-constantes)

Se não puder usar enumerações e tiver de recolher constantes de uma forma solta, por exemplo numa interface, pelo menos agrupe-as:

```ABAP
CONSTANTS:
  BEGIN OF message_severity,
    warning TYPE symsgty VALUE 'W',
    error   TYPE symsgty VALUE 'E',
  END OF message_severity,
  BEGIN OF message_lifespan,
    transitional TYPE i VALUE 1,
    persisted    TYPE i VALUE 2,
  END OF message_lifespan.
```

torna a relação mais clara do que

```ABAP
" Anti-padrão
CONSTANTS:
  warning      TYPE symsgty VALUE 'W',
  transitional TYPE i       VALUE 1,
  error        TYPE symsgty VALUE 'E',
  persisted    TYPE i       VALUE 2,
```

O grupo também lhe permite acesso por grupo, por exemplo para validação de entrada:

```ABAP
DO.
  ASSIGN message_severity-(sy-index) TO FIELD-SYMBOL(<constant>).
  IF sy-subrc IS INITIAL.
    IF input = <constant>.
      DATA(is_valid) = abap_true.
      RETURN.
    ENDIF.
  ELSE.
    RETURN.
  ENDIF.
ENDDO.
```

> Leia mais no _Capítulo 17: Smells and Heuristics: G27: Structure over Convention_ de [Robert C. Martin's _Clean Code_].

## Variáveis

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Esta seção](#variáveis)

### Prefira declarações inline a antecipadas (up-front)

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Variáveis](#variáveis) > [Esta seção](#prefira-declarações-inline-a-antecipadas-up-front)

Se seguir estas diretrizes, os seus métodos tornar-se-ão tão curtos (3-5 instruções)
que declarar variáveis inline na primeira ocorrência parecerá mais natural

```ABAP
METHOD do_something.
  DATA(name) = 'something'.
  DATA(reader) = /clean/reader=>get_instance_for( name ).
  result = reader->read_it( ).
ENDMETHOD.
```

do que declarar variáveis com uma seção `DATA` separada no início do método

```ABAP
" anti-padrão
METHOD do_something.
  DATA:
    name   TYPE seoclsname,
    reader TYPE REF TO /dirty/reader.
  name = 'something'.
  reader = /dirty/reader=>get_instance_for( name ).
  result = reader->read_it( ).
ENDMETHOD.
```

> Leia mais no _Capítulo 5: Formatação: Distância Vertical: Declarações de Variáveis_ de [Robert C. Martin's _Clean Code_].

### Não utilize variáveis fora do bloco de instrução onde foram declaradas

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Variáveis](#variáveis) > [Esta seção](#não-utilize-variáveis-fora-do-bloco-de-instrução-onde-foram-declaradas)

```ABAP
" anti-padrão
IF has_entries = abap_true.
  DATA(value) = 1.
ELSE.
  value = 2.
ENDIF.
```

Uma variável declarada num bloco de instrução (como num bloco `IF` ou `LOOP`) continua disponível fora desse bloco no código que se segue.
Isto é confuso para os leitores, especialmente se o método for longo e a declaração não for imediatamente detetada.

Se a variável for necessária fora do bloco de instrução onde é declarada, declare-a antes:

```ABAP
DATA value TYPE i.
IF has_entries = abap_true.
  value = 1.
ELSE.
  value = 2.
ENDIF.
```

> Leia mais no _Capítulo 5: Formatação: Distância Vertical: Declarações de Variáveis_ de [Robert C. Martin's _Clean Code_].

### Não encadeie declarações antecipadas (up-front)

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Variáveis](#variáveis) > [Esta seção](#não-encadeie-declarações-antecipadas-up-front)

```ABAP
DATA name TYPE seoclsname.
DATA reader TYPE REF TO reader.
```

O encadeamento sugere que as variáveis definidas estão relacionadas a um nível lógico.
Para usá-lo consistentemente, teria de garantir que todas as variáveis encadeadas pertencem ao mesmo grupo,
e introduzir grupos de encadeamento adicionais para adicionar variáveis.
Embora seja possível, geralmente não vale o esforço.

O encadeamento também complica desnecessariamente a reformatação e refatoração
porque cada linha parece diferente e alterá-las requer mexer com
dois pontos, pontos e vírgulas, o que não vale o esforço.

```ABAP
" anti-padrão
DATA:
  name   TYPE seoclsname,
  reader TYPE REF TO reader.
```

> Consulte também [Não alinhe cláusulas de tipo](#não-alinhe-cláusulas-de-tipo)
> Se o encadeamento de declaração de dados for usado, use uma cadeia para cada grupo de variáveis que pertençam juntas.

### Não utilize field symbols para acesso dinâmico a dados

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Variáveis](#variáveis) > [Esta seção](#não-utilize-field-symbols-para-acesso-dinâmico-a-dados)

A partir da ABAP Platform 2021, quase não restam lugares onde o uso de um field symbol seja necessário para realizar acesso a variáveis genericamente tipadas ou acesso dinâmico a componentes de uma variável.

Portanto, em vez de algo como

```ABAP
" anti-padrão
ASSIGN dref->* TO <fs>.
result = <fs>.
```

escreva

```ABAP
result = dref->*.
```

Consulte [Novos tipos de expressões ABAP (Blog SAP)](https://blogs.sap.com/2021/10/19/new-kinds-of-abap-expressions/) para mais exemplos e explicações detalhadas sobre a substituição de acessos dinâmicos e genéricos via field symbols por construções sintáticas mais modernas.

### Escolha os destinos certos para os seus loops

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Variáveis](#variáveis) > [Esta seção](#escolha-os-destinos-certos-para-os-seus-loops)

Existem três destinos possíveis para um loop ABAP: Um field symbol (`LOOP AT table ASSIGNING FIELD-SYMBOL(<line>).`), uma variável de referência (`LOOP AT table REFERENCE INTO DATA(line).`) ou um objeto de dados simples (`LOOP AT table INTO DATA(line).`). Cada um destes tem diferentes casos de uso pretendidos:

- Field symbols quando quer ler ou manipular os dados que estão a ser iterados.
- Referências de dados quando precisa de aceder a estas referências fora do loop atual, por exemplo, passá-las para métodos cujos parâmetros de entrada são referências ou manter referências aos dados após o loop ter terminado.
- Objetos de dados quando precisa de uma cópia dos dados em si ou quando o tipo de linha da tabela já é uma referência.

Note que as referências de dados podem ser usadas para ler ou manipular os dados também. Ou seja, quase todas as instâncias de field symbols como destinos de loop podem ser substituídas por referências como destinos de loop.

Para consistência com o padrão geral de ABAP orientado a objetos usando referências, pode desejar usar referências como destinos de loop sempre que possível. Por outro lado, quando quer aceder a todo o valor do tipo de linha, usar referências de dados introduz operações de desreferenciação adicionais que são desnecessárias ao usar field symbols. Compare

```ABAP
LOOP AT table ASSIGNING FIELD-SYMBOL(<line>).
  obj->do_something( <line> ).
ENDLOOP.
```

com

```ABAP
LOOP AT table REFERENCE INTO DATA(line).
  obj->do_something( line->* ).
ENDLOOP.
```

Adicionalmente, o acesso a dados via field symbols é ligeiramente mais rápido do que o acesso a dados via referências. Isto só é percetível quando os loops constituem uma parte significativa do tempo de execução do programa e muitas vezes não é relevante, por exemplo, quando operações de base de dados ou outros processos de entrada/saída dominam o tempo de execução.

Por estas razões, existem dois estilos consistentes possíveis dependendo do contexto específico da aplicação:

- Se o contexto usa maioritariamente objetos e referências, e se pequenos impactos no desempenho em loops não são geralmente relevantes, use referências em vez de field symbols como destinos de loop sempre que possível.
- Se o contexto realiza muita manipulação de dados simples e não referências ou objetos, ou se pequenos impactos no desempenho em loops são geralmente relevantes, use field symbols para ler e manipular dados em loops.

## Tabelas

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Esta seção](#tabelas)

### Use o tipo de tabela correto

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Tabelas](#tabelas) > [Esta seção](#use-o-tipo-de-tabela-correto)

- Normalmente usa tabelas `HASHED` para **tabelas grandes**
  que são **preenchidas num único passo**, **nunca modificadas**, e **lidas frequentemente pela sua chave**.
  A sua sobrecarga inerente de memória e processamento torna as tabelas hash valiosas apenas
  para grandes quantidades de dados e muitos acessos de leitura.
  Cada alteração ao conteúdo da tabela requer um recálculo dispendioso do hash,
  por isso não use isto para tabelas que são modificadas com muita frequência.

- Normalmente usa tabelas `SORTED` para **tabelas grandes**
  que precisam de estar **ordenadas a todo o momento**, que são **preenchidas pouco a pouco** ou **precisam de ser modificadas**,
  e **lidas frequentemente por uma ou mais chaves completas ou parciais** ou processadas **numa determinada ordem**.
  Adicionar, alterar ou remover conteúdo requer encontrar o local de inserção correto,
  mas não requer ajustar o resto do índice da tabela.
  Tabelas ordenadas demonstram o seu valor apenas para grandes números de acessos de leitura.

- Use tabelas `STANDARD` para **tabelas pequenas**, onde a indexação produz mais sobrecarga do que benefício, e **"arrays"**, onde não se importa com a ordem das linhas, ou quer processá-las exatamente na ordem em que foram adicionadas. Também, se for necessário acesso diferente à tabela, por exemplo, acesso indexado e acesso ordenado via `SORT` e `BINARY SEARCH`.

> Estas são apenas diretrizes gerais.
> Encontre mais detalhes no artigo [_Selection of Table Category_ na Ajuda da Linguagem ABAP](https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abenitab_cat.htm).

### Evite DEFAULT KEY

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Tabelas](#tabelas) > [Esta seção](#evite-default-key)

```ABAP
" anti-padrão
DATA itab TYPE STANDARD TABLE OF row_type WITH DEFAULT KEY.
```

Chaves padrão (`DEFAULT KEY`) são muitas vezes adicionadas apenas para fazer as novas instruções funcionais funcionarem.
As chaves em si são geralmente supérfluas e desperdiçam recursos para nada.
Podem até levar a erros obscuros porque ignoram tipos de dados numéricos.
As instruções `SORT` e `DELETE ADJACENT` sem lista de campos explícita recorrerão à chave primária da
tabela interna, o que no caso de uso de `DEFAULT KEY` pode levar a resultados muito inesperados ao ter
por exemplo campos numéricos como componente da chave, em particular em combinação com `READ TABLE ... BINARY` etc.

Especifique os componentes da chave explicitamente

```ABAP
DATA itab2 TYPE STANDARD TABLE OF row_type WITH NON-UNIQUE KEY comp1 comp2.
```

ou recorra a `EMPTY KEY` se não precisar de uma chave de todo.

```ABAP
DATA itab1 TYPE STANDARD TABLE OF row_type WITH EMPTY KEY.
```

> Seguindo o [blog de Horst Keller sobre _Internal Tables with Empty Key_](https://blogs.sap.com/2013/06/27/abap-news-for-release-740-internal-tables-with-empty-key/)
>
> **Atenção:** `SORT` em tabelas internas com `EMPTY KEY` (sem campos de ordenação explícitos) não ordenará nada,
> mas avisos de sintaxe são emitidos caso o vazio da chave possa ser determinado estaticamente.

### Prefira INSERT INTO TABLE a APPEND TO

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Tabelas](#tabelas) > [Esta seção](#prefira-insert-into-table-a-append-to)

```ABAP
INSERT VALUE #( ... ) INTO TABLE itab.
```

`INSERT INTO TABLE` funciona com todos os tipos de tabela e chave,
tornando assim mais fácil para si refatorar a definição de tipo e chave da tabela se os seus requisitos de desempenho mudarem.

Use `APPEND TO` apenas se usar uma tabela `STANDARD` como um array,
se quiser enfatizar que a entrada adicionada deve ser a última linha.

### Prefira LINE_EXISTS a READ TABLE ou LOOP AT

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Tabelas](#tabelas) > [Esta seção](#prefira-line_exists-a-read-table-ou-loop-at)

```ABAP
IF line_exists( my_table[ key = 'A' ] ).
```

expressa a intenção de forma mais clara e curta do que

```ABAP
" anti-padrão
READ TABLE my_table TRANSPORTING NO FIELDS WITH KEY key = 'A'.
IF sy-subrc = 0.
```

ou mesmo

```ABAP
" anti-padrão
LOOP AT my_table REFERENCE INTO DATA(line) WHERE key = 'A'.
  line_exists = abap_true.
  EXIT.
ENDLOOP.
```

### Prefira READ TABLE a LOOP AT

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Tabelas](#tabelas) > [Esta seção](#prefira-read-table-a-loop-at)

```ABAP
READ TABLE my_table REFERENCE INTO DATA(line) WITH KEY key = 'A'.
```

expressa a intenção de forma mais clara e curta do que

```ABAP
" anti-padrão
LOOP AT my_table REFERENCE INTO DATA(line) WHERE key = 'A'.
  EXIT.
ENDLOOP.
```

ou mesmo

```ABAP
" anti-padrão
LOOP AT my_table REFERENCE INTO DATA(line).
  IF line->key = 'A'.
    EXIT.
  ENDIF.
ENDLOOP.
```

### Prefira LOOP AT WHERE a IF aninhado

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Tabelas](#tabelas) > [Esta seção](#prefira-loop-at-where-a-if-aninhado)

```ABAP
LOOP AT my_table REFERENCE INTO DATA(line) WHERE key = 'A'.
```

expressa a intenção de forma mais clara e curta do que

```ABAP
LOOP AT my_table REFERENCE INTO DATA(line).
  IF line->key = 'A'.
    EXIT.
  ENDIF.
ENDLOOP.
```

### Evite leituras de tabela desnecessárias

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Tabelas](#tabelas) > [Esta seção](#evite-leituras-de-tabela-desnecessárias)

Caso _espere_ que uma linha exista,
leia uma vez e reaja à exceção,

```ABAP
TRY.
    DATA(row) = my_table[ key = input ].
  CATCH cx_sy_itab_line_not_found.
    RAISE EXCEPTION NEW /clean/my_data_not_found( ).
ENDTRY.
```

em vez de poluir e abrandar
o fluxo de controlo principal com uma leitura dupla

```ABAP
" anti-padrão
IF NOT line_exists( my_table[ key = input ] ).
  RAISE EXCEPTION NEW /clean/my_data_not_found( ).
ENDIF.
DATA(row) = my_table[ key = input ].
```

> Além de ser uma melhoria de desempenho,
> esta é uma variante especial do mais geral
> [Foques no caminho feliz ou tratamento de erros, mas não em ambos](#foque-no-caminho-feliz-ou-tratamento-de-erros-mas-não-em-ambos).

## Strings

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Esta seção](#strings)

### Use ` para definir literais

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Strings](#strings) > [Esta seção](#use--para-definir-literais)

```ABAP
CONSTANTS some_constant TYPE string VALUE `ABC`.
DATA(some_string) = `ABC`.  " --> TYPE string
```

Abstenha-se de usar `'`, pois adiciona uma conversão de tipo supérflua e confunde o leitor
sobre se está a lidar com um `CHAR` ou `STRING`:

```ABAP
" anti-padrão
DATA some_string TYPE string.
some_string = 'ABC'.
```

`|` é geralmente aceitável, mas não pode ser usado para `CONSTANTS` e adiciona sobrecarga desnecessária ao especificar um valor fixo:

```ABAP
" anti-padrão
DATA(some_string) = |ABC|.
```

### Use | para montar texto

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Strings](#strings) > [Esta seção](#use--para-montar-texto)

```ABAP
DATA(message) = |Recebido código HTTP { status_code } com mensagem { text }|.
```

Templates de string destacam melhor o que é literal e o que é variável,
especialmente se incorporar múltiplas variáveis num texto.

```ABAP
" anti-padrão
DATA(message) = `Recebido um HTTP inesperado ` && status_code && ` com mensagem ` && text.
```

## Booleanos

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Esta seção](#booleanos)

### Use Booleanos sabiamente

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Booleanos](#booleanos) > [Esta seção](#use-booleanos-sabiamente)

Frequentemente encontramos casos onde Booleanos parecem ser uma escolha natural

```ABAP
" anti-padrão
is_archived = abap_true.
```

até que uma mudança de ponto de vista sugere
que deveríamos ter escolhido uma enumeração

```ABAP
archiving_status = /clean/archivation_status=>archiving_in_process.
```

Geralmente, Booleanos são uma má escolha
para distinguir tipos de coisas
porque encontrará quase sempre casos
que não são exclusivamente um ou o outro

```ABAP
assert_true( xsdbool( document->is_archived( ) = abap_true AND
                      document->is_partially_archived( ) = abap_true ) ).
```

[Dividir método em vez de parâmetro de entrada Booleano](#dividir-método-em-vez-de-parâmetro-de-entrada-booleano)
explica além disso porque deve sempre desafiar parâmetros Booleanos.

### Use ABAP_BOOL para Booleanos

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Booleanos](#booleanos) > [Esta seção](#use-abap_bool-para-booleanos)

```ABAP
DATA has_entries TYPE abap_bool.
```

Não use o tipo genérico `char1`.
Embora seja tecnicamente compatível, obscurece o facto de que estamos a lidar com uma variável Booleana.

Evite também outros tipos Booleanos, pois muitas vezes têm efeitos colaterais estranhos,
por exemplo `boolean` suporta um terceiro valor "indefinido" que resulta em erros de programação subtis.

Em alguns casos pode precisar de um elemento do dicionário de dados, por exemplo para campos de DynPro.
`abap_bool` não pode ser usado aqui porque está definido no grupo de tipos `abap`, não no dicionário de dados.
Neste caso, recorra a `abap_boolean`.
Crie o seu próprio elemento de dados se precisar de uma descrição personalizada.

> ABAP pode ser a única linguagem de programação que não vem com um tipo de dados Booleano universal.
> No entanto, ter um é imperativo.
> Esta recomendação baseia-se nas Diretrizes de Programação ABAP.

### Use ABAP_TRUE e ABAP_FALSE para comparações

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Booleanos](#booleanos) > [Esta seção](#use-abap_true-e-abap_false-para-comparações)

```ABAP
has_entries = abap_true.
IF has_entries = abap_false.
```

Não use os equivalentes de caracteres `'X'` e `' '` ou `space`;
eles tornam difícil ver que esta é uma expressão Booleana:

```ABAP
" anti-padrão
has_entries = 'X'.
IF has_entries = space.
```

Evite comparações com `INITIAL` - isso força os leitores a recordar que o padrão de `abap_bool` é `abap_false`:

```ABAP
" anti-padrão
IF has_entries IS NOT INITIAL.
```

> ABAP pode ser a única linguagem de programação que não vem com "constantes" embutidas para verdadeiro e falso.
> No entanto, tê-las é imperativo.
> Esta recomendação baseia-se nas Diretrizes de Programação ABAP.

### Use XSDBOOL para definir variáveis Booleanas

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Booleanos](#booleanos) > [Esta seção](#use-xsdbool-para-definir-variáveis-booleanas)

```ABAP
DATA(has_entries) = xsdbool( line IS NOT INITIAL ).
```

O equivalente `IF`-`THEN`-`ELSE` é muito mais longo para nada:

```ABAP
" anti-padrão
IF line IS INITIAL.
  has_entries = abap_false.
ELSE.
  has_entries = abap_true.
ENDIF.
```

`xsdbool` é o melhor método para o nosso propósito, pois produz diretamente um `char1`,
que se adequa melhor ao nosso tipo booleano `abap_bool`.
As funções equivalentes `boolc` e `boolx` produzem tipos diferentes
e adicionam uma conversão de tipo implícita desnecessária.

Concordamos que o nome `xsdbool` é infeliz e enganador;
afinal, não estamos de todo interessados nas partes "XML Schema Definition" que o prefixo "xsd" sugere.

Uma possível alternativa a `xsdbool` é a forma ternária `COND`.
A sua sintaxe é intuitiva, mas um pouco mais longa porque repete desnecessariamente o segmento `THEN abap_true`,
e requer conhecimento do valor padrão implícito `abap_false` -
razão pela qual a sugerimos apenas como solução secundária.

```ABAP
DATA(has_entries) = COND abap_bool( WHEN line IS NOT INITIAL THEN abap_true ).
```

## Condições

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Esta seção](#condições)

### Tente tornar as condições positivas

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Condições](#condições) > [Esta seção](#tente-tornar-as-condições-positivas)

```ABAP
IF has_entries = abap_true.
```

Para comparação, veja quão difícil de entender a mesma declaração se torna ao invertê-la:

```ABAP
" anti-padrão
IF has_no_entries = abap_false.
```

O "tente" no título da seção significa que não deve forçar isto
ao ponto de acabar com algo como [ramos IF vazios](#não-deixe-ramos-if-vazios):

```ABAP
" anti-padrão
IF has_entries = abap_true.
ELSE.
  " faça algo apenas no bloco ELSE, IF permanece vazio
ENDIF.
```

> Leia mais no _Capítulo 17: Smells and Heuristics: G29: Avoid Negative Conditionals_ de [Robert C. Martin's _Clean Code_].

### Prefira IS NOT a NOT IS

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Condições](#condições) > [Esta seção](#prefira-is-not-a-not-is)

```ABAP
IF variable IS NOT INITIAL.
IF variable NP 'TODO*'.
IF variable <> 42.
```

A negação é logicamente equivalente
mas requer uma "inversão mental"
que torna mais difícil de entender.

```ABAP
" anti-padrão
IF NOT variable IS INITIAL.
IF NOT variable CP 'TODO*'.
IF NOT variable = 42.
```

> Uma variante mais específica de
> [Tente tornar as condições positivas](#tente-tornar-as-condições-positivas).
> Também como descrito na seção
> [Alternative Language Constructs](https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/index.htm?file=abenalternative_langu_guidl.htm)
> nas diretrizes de programação ABAP.

### Considere usar chamadas de método predicativas para métodos booleanos

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Condições](#condições) > [Esta seção](#considere-usar-chamadas-de-método-predicativas-para-métodos-booleanos)

A chamada de método predicativa para métodos booleanos, ex.

```ABAP
IF [ NOT ] condition_is_fulfilled( ).
```

não é apenas muito compacta, mas também permite manter o código mais próximo da linguagem natural como a expressão de comparação:

```ABAP
" anti-padrão
IF condition_is_fulfilled( ) = abap_true / abap_false.
```

Note que a chamada de método predicativa `... meth( ) ...` é apenas uma forma curta de `... meth( ) IS NOT INITIAL ...`, veja [Predicative Method Call](https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abenpredicative_method_calls.htm) na Documentação de Palavras-chave ABAP. É por isso que a forma curta deve ser usada apenas para métodos que retornam tipos onde o valor não inicial tem o significado de "verdadeiro" e o valor inicial tem o significado de "falso".

### Considere decompor condições complexas

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Condições](#condições) > [Esta seção](#considere-decompor-condições-complexas)

Condições podem tornar-se mais fáceis ao decompô-las nas partes elementares que as compõem:

```ABAP
DATA(example_provided) = xsdbool( example_a IS NOT INITIAL OR
                                  example_b IS NOT INITIAL ).

DATA(one_example_fits) = xsdbool( applies( example_a ) = abap_true OR
                                  applies( example_b ) = abap_true OR
                                  fits( example_b ) = abap_true ).

IF example_provided = abap_true AND
   one_example_fits = abap_true.
```

em vez de deixar tudo no local:

```ABAP
" anti-padrão
IF ( example_a IS NOT INITIAL OR
     example_b IS NOT INITIAL ) AND
   ( applies( example_a ) = abap_true OR
     applies( example_b ) = abap_true OR
     fits( example_b ) = abap_true ).
```

> Use as quick fixes do ABAP Development Tools para extrair rapidamente condições e criar variáveis como mostrado acima.

### Considere extrair condições complexas

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Condições](#condições) > [Esta seção](#considere-extrair-condições-complexas)

É quase sempre uma boa ideia extrair condições complexas para os seus próprios métodos:

```ABAP
IF is_provided( example ).

METHOD is_provided.
  DATA(is_filled) = xsdbool( example IS NOT INITIAL ).
  DATA(is_working) = xsdbool( applies( example ) = abap_true OR
                              fits( example ) = abap_true ).
  result = xsdbool( is_filled = abap_true AND
                    is_working = abap_true ).
ENDMETHOD.
```

## Ifs

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Esta seção](#ifs)

### Não deixe ramos IF vazios

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Ifs](#ifs) > [Esta seção](#não-deixe-ramos-if-vazios)

```ABAP
IF has_entries = abap_false.
  " faça alguma magia
ENDIF.
```

é mais curto e claro do que

```ABAP
" anti-padrão
IF has_entries = abap_true.
ELSE.
  " faça alguma magia
ENDIF.
```

### Prefira CASE a ELSE IF para múltiplas condições alternativas

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Ifs](#ifs) > [Esta seção](#prefira-case-a-else-if-para-múltiplas-condições-alternativas)

```ABAP
CASE type.
  WHEN type-some_type.
    " ...
  WHEN type-some_other_type.
    " ...
  WHEN OTHERS.
    RAISE EXCEPTION NEW /clean/unknown_type_failure( ).
ENDCASE.
```

`CASE` torna fácil ver um conjunto de alternativas que se excluem mutuamente.
Pode ser mais rápido do que uma série de `IF`s porque pode traduzir-se num comando de microprocessador diferente
em vez de uma série de condições avaliadas subsequentemente.
Pode introduzir novos casos rapidamente, sem ter de repetir a variável discernidora vezes sem conta.
A instrução até previne alguns erros que podem ocorrer ao aninhar acidentalmente os `IF`-`ELSEIF`s.

```ABAP
" anti-padrão
IF type = type-some_type.
  " ...
ELSEIF type = type-some_other_type.
  " ...
ELSE.
  RAISE EXCEPTION NEW /dirty/unknown_type_failure( ).
ENDIF.
```

### Mantenha a profundidade de aninhamento baixa

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Ifs](#ifs) > [Esta seção](#mantenha-a-profundidade-de-aninhamento-baixa)

```ABAP
" anti-padrão
IF <this>.
  IF <that>.
  ENDIF.
ELSE.
  IF <other>.
  ELSE.
    IF <something>.
    ENDIF.
  ENDIF.
ENDIF.
```

`IF`s aninhados tornam-se difíceis de compreender muito rapidamente e requerem um número exponencial de casos de teste para cobertura completa.

Árvores de decisão podem geralmente ser desmontadas formando sub-métodos e introduzindo variáveis auxiliares booleanas.

Outros casos podem ser simplificados fundindo IFs, tais como

```ABAP
IF <this> AND <that>.
```

em vez do desnecessariamente aninhado

```ABAP
" anti-padrão
IF <this>.
  IF <that>.
```

## Expressões Regulares

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Esta seção](#expressões-regulares)

### Prefira métodos mais simples a expressões regulares

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Expressões Regulares](#expressões-regulares) > [Esta seção](#prefira-métodos-mais-simples-a-expressões-regulares)

```ABAP
IF input IS NOT INITIAL.
" IF matches( val = input  regex = '.+' ).

WHILE contains( val = input  sub = 'abc' ).
" WHILE contains( val = input  regex = 'abc' ).
```

Expressões regulares tornam-se difíceis de entender muito rapidamente.
Casos simples são geralmente mais fáceis sem elas.

Expressões regulares também consomem geralmente mais memória e tempo de processamento
porque precisam de ser analisadas numa árvore de expressão e compiladas em tempo de execução num matcher executável.
Soluções simples podem funcionar com um loop direto e uma variável temporária.

### Prefira verificações base a expressões regulares

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Expressões Regulares](#expressões-regulares) > [Esta seção](#prefira-verificações-base-a-expressões-regulares)

```ABAP
CALL FUNCTION 'SEO_CLIF_CHECK_NAME'
  EXPORTING
    cls_name = class_name
  EXCEPTIONS
    ...
```

em vez de reinventar a roda

```ABAP
" anti-padrão
DATA(is_valid) = matches( val     = class_name
                          pattern = '[A-Z][A-Z0-9_]{0,29}' ).
```

> Parece haver uma tendência natural para ficar cego ao princípio Don't-Repeat-Yourself (DRY)
> quando existem expressões regulares por perto,
> compare a seção _Capítulo 17: Smells and Heuristics: General: G5: Duplication_ em [Robert C. Martin's _Clean Code_].

### Considere montar expressões regulares complexas

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Expressões Regulares](#expressões-regulares) > [Esta seção](#considere-montar-expressões-regulares-complexas)

```ABAP
CONSTANTS class_name TYPE string VALUE `CL\_.*`.
CONSTANTS interface_name TYPE string VALUE `IF\_.*`.
DATA(object_name) = |{ class_name }\|{ interface_name }|.
```

Algumas expressões regulares complexas tornam-se mais fáceis
quando demonstra ao leitor como são construídas a partir de peças mais elementares.

## Classes

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Esta seção](#classes)

### Classes: Orientação a Objetos

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Classes](#classes) > [Esta seção](#classes-orientação-a-objetos)

#### Prefira objetos a classes estáticas

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Classes](#classes) > [Classes: Orientação a Objetos](#classes-orientação-a-objetos) > [Esta seção](#prefira-objetos-a-classes-estáticas)

Classes estáticas abdicam de todas as vantagens ganhas pela orientação a objetos em primeiro lugar.
Elas tornam especialmente quase impossível substituir dependências por test doubles em testes unitários.

Se pensar se deve tornar uma classe ou método estático, a resposta será quase sempre: não.

Uma exceção aceite a esta regra são classes utilitárias de tipos simples.
Os seus métodos tornam mais fácil interagir com certos tipos ABAP.
Elas não só são completamente sem estado, mas tão básicas que parecem instruções ABAP ou funções embutidas.
O fator discriminante é que os seus consumidores as ligam ao seu código tão fortemente
que na verdade não querem fazer mock delas em testes unitários.

```ABAP
CLASS /clean/string_utils DEFINITION [...].
  CLASS-METHODS trim
   IMPORTING
     string        TYPE string
   RETURNING
     VALUE(result) TYPE string.
ENDCLASS.

METHOD retrieve.
  DATA(trimmed_name) = /clean/string_utils=>trim( name ).
  result = read( trimmed_name ).
ENDMETHOD.
```

#### Prefira composição a herança

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Classes](#classes) > [Classes: Orientação a Objetos](#classes-orientação-a-objetos) > [Esta seção](#prefira-composição-a-herança)

Evite construir hierarquias de classes com herança. Em vez disso, favoreça a composição.

Herança limpa é difícil de projetar porque precisa de respeitar regras
como o [Princípio de substituição de Liskov](https://pt.wikipedia.org/wiki/Princ%C3%ADpio_da_substitui%C3%A7%C3%A3o_de_Liskov).
É também difícil de entender porque as pessoas precisam de perceber e digerir os princípios orientadores por trás da hierarquia.
A herança reduz a reutilização porque os métodos tendem a ser disponibilizados apenas para sub-classes.
Também complica a refatoração porque mover ou alterar membros tende a requerer alterações em toda a árvore hierárquica.

Composição significa que projeta objetos pequenos e independentes, cada um dos quais serve um propósito específico.
Estes objetos podem ser recombinados em objetos mais complexos por simples padrões de delegação e fachada.
A composição pode produzir mais classes, mas de resto não tem mais desvantagens.

Não deixe que esta regra o desencoraje de usar herança nos lugares certos.
Existem boas aplicações para herança,
por exemplo o [padrão de design Composite](https://pt.wikipedia.org/wiki/Composite).
Pergunte-se apenas criticamente se a herança no seu caso irá realmente fornecer mais benefícios do que desvantagens.
Em caso de dúvida, a composição é geralmente a escolha mais segura.

> [Interfaces vs. classes abstratas](sub-sections/InterfacesVsAbstractClasses.md)
> compara alguns detalhes.

#### Não misture stateful e stateless na mesma classe

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Classes](#classes) > [Classes: Orientação a Objetos](#classes-orientação-a-objetos) > [Esta seção](#não-misture-stateful-e-stateless-na-mesma-classe)

Não misture os paradigmas de programação
stateless e stateful na mesma classe.

Na programação stateless, os métodos recebem entrada e produzem saída,
_sem quaisquer efeitos colaterais_, resultando em métodos
que produzem o mesmo resultado
independentemente de quando e em que ordem são chamados.

```ABAP
CLASS /clean/xml_converter DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS convert
      IMPORTING
        file_content  TYPE xstring
      RETURNING
        VALUE(result) TYPE /clean/some_inbound_message.
ENDCLASS.

CLASS /clean/xml_converter IMPLEMENTATION.
  METHOD convert.
    cl_proxy_xml_transform=>xml_xstring_to_abap(
      EXPORTING
        xml       = file_content
        ext_xml   = abap_true
        svar_name = 'ROOT_NODE'
      IMPORTING
        abap_data = result ).
   ENDMETHOD.
ENDCLASS.
```

Na programação stateful, manipulamos o estado interno dos objetos
através dos seus métodos, o que significa que está _cheio de efeitos colaterais_.

```ABAP
CLASS /clean/log DEFINITION PUBLIC CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS add_message IMPORTING message TYPE /clean/message.
  PRIVATE SECTION.
    DATA messages TYPE /clean/message_table.
ENDCLASS.

CLASS /clean/log IMPLEMENTATION.
  METHOD add_message.
    INSERT message INTO TABLE messages.
  ENDMETHOD.
ENDCLASS.
```

Ambos os paradigmas são aceitáveis e têm as suas aplicações.
No entanto, _misturá-los_ no mesmo objeto produz código
que é difícil de entender e certo de falhar
com erros obscuros de transporte e problemas de sincronicidade.
Não faça isso.

### Escopo

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Classes](#classes) > [Esta seção](#escopo)

#### Global por padrão, local apenas onde apropriado

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Classes](#classes) > [Escopo](#escopo) > [Esta seção](#global-por-padrão-local-apenas-onde-apropriado)

Trabalhe com classes globais como padrão.
Use classes locais apenas onde apropriado.

> Classes globais são as que são visíveis no dicionário de dados.
> Classes locais vivem dentro de um include de outro objeto de desenvolvimento
> e são visíveis apenas para este outro objeto.

Classes locais são adequadas

- para estruturas de dados privadas muito específicas,
  por exemplo um iterador para os dados da classe global,
  que só será necessário aqui,

- para extrair um pedaço de algoritmo privado complexo,
  por exemplo para desembaraçar aquele algoritmo de classificação-agregação multi-método
  de propósito especial do resto do código da sua classe,

- para permitir o mock de certos aspetos da classe global,
  por exemplo extraindo todo o acesso à base de dados para uma classe local separada
  que pode então ser substituída por um test double nos testes unitários.

Classes locais impedem a reutilização porque não podem ser usadas noutro lugar.
Embora sejam fáceis de extrair, as pessoas geralmente falharão até em encontrá-las,
levando a duplicação de código indesejada.
Orientação, navegação e depuração em includes de classes locais muito longos
é entediante e irritante.
Como o ABAP bloqueia ao nível do include, as pessoas não poderão trabalhar em
diferentes partes do include local simultaneamente
(o que seria possível se fossem classes globais separadas).

Reconsidere o seu uso de classes locais se

- o seu include local abrange dezenas de classes e milhares de linhas de código,
- pensa em classes globais como "pacotes" que contêm outras classes,
- as suas classes globais degeneram em cascas vazias,
- encontra código duplicado repetido através de includes locais separados,
- os seus programadores começam a bloquear-se mutuamente e tornam-se incapazes de trabalhar em paralelo,
- as estimativas do seu backlog disparam porque as suas equipas falham em entender as sub-árvores locais umas das outras.

#### FINAL se não projetado para herança

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Classes](#classes) > [Escopo](#escopo) > [Esta seção](#final-se-não-projetado-para-herança)

Torne as classes que não são explicitamente projetadas para herança `FINAL`.

Ao projetar a cooperação de classes,
a sua primeira escolha deve ser [composição, não herança](#prefira-composição-a-herança).
Permitir herança não é algo que deva ser feito levianamente,
pois requer que pense sobre coisas como `PROTECTED` vs. `PRIVATE`
e o [Princípio de substituição de Liskov](https://pt.wikipedia.org/wiki/Princ%C3%ADpio_da_substitui%C3%A7%C3%A3o_de_Liskov),
e congela muitos detalhes internos do design.
Se não considerou estas coisas no design da sua classe,
deve assim prevenir herança acidental tornando a sua classe `FINAL`.

Existem _algumas_ boas aplicações para herança, claro,
por exemplo o padrão de design [composite](https://pt.wikipedia.org/wiki/Composite).
Business Add-Ins também podem tornar-se mais úteis permitindo sub-classes,
permitindo ao cliente reutilizar a maior parte do código original.
No entanto, note que todos estes casos têm herança integrada por design desde o início.

Classes não limpas que não [implementam interfaces](#métodos-de-instância-públicos-devem-ser-parte-de-uma-interface)
devem ser deixadas como não-`FINAL` para permitir que os consumidores façam mock delas nos seus testes unitários.

#### Membros PRIVATE por padrão, PROTECTED apenas se necessário

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Classes](#classes) > [Escopo](#escopo) > [Esta seção](#membros-private-por-padrão-protected-apenas-se-necessário)

Torne atributos, métodos e outros membros da classe `PRIVATE` por padrão.

Torne-os `PROTECTED` apenas se quiser permitir sub-classes que os sobrescrevam.

Internos de classes devem ser disponibilizados a outros apenas numa base de necessidade de conhecimento.
Isto inclui não apenas chamadores externos mas também sub-classes.
Tornar informação excessivamente disponível pode causar erros subtis por redefinições inesperadas e impedir refatoração
porque estranhos congelam membros no lugar que deveriam ainda ser líquidos.

#### Considere usar imutável em vez de getter

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Classes](#classes) > [Escopo](#escopo) > [Esta seção](#considere-usar-imutável-em-vez-de-getter)

Um imutável é um objeto que nunca muda após a sua construção.
Para este tipo de objeto considere usar atributos públicos de apenas leitura em vez de métodos getter.

```ABAP
CLASS /clean/some_data_container DEFINITION.
  PUBLIC SECTION.
    METHODS constructor
      IMPORTING
        a TYPE i
        b TYPE c
        c TYPE d.
    DATA a TYPE i READ-ONLY.
    DATA b TYPE c READ-ONLY.
    DATA c TYPE d READ-ONLY.
ENDCLASS.
```

em vez de

```ABAP
CLASS /dirty/some_data_container DEFINITION.
  PUBLIC SECTION.
    METHODS get_a ...
    METHODS get_b ...
    METHODS get_c ...
  PRIVATE SECTION.
    DATA a TYPE i.
    DATA b TYPE c.
    DATA c TYPE d.
ENDCLASS.
```

> **Atenção**: Para objetos que **têm** valores que mudam, não use atributos públicos de apenas leitura.
> Caso contrário, estes atributos têm sempre de ser mantidos atualizados,
> independentemente se o seu valor é necessário por qualquer outro código ou não.

#### Use READ-ONLY com moderação

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Classes](#classes) > [Escopo](#escopo) > [Esta seção](#use-read-only-com-moderação)

Muitas linguagens de programação modernas, especialmente Java, recomendam tornar os membros da classe apenas de leitura
sempre que apropriado para prevenir efeitos colaterais acidentais.

Embora o ABAP _ofereça_ a adição `READ-ONLY` para declarações de dados, recomendamos usá-la com moderação.

Primeiro, a adição está disponível apenas na `PUBLIC SECTION`, reduzindo drasticamente a sua aplicabilidade.
Não pode adicioná-la a membros protegidos ou privados nem a variáveis locais num método.

Segundo, a adição funciona de forma subtilmente diferente do que as pessoas podem esperar de outras linguagens de programação:
Dados READ-ONLY ainda podem ser modificados livremente de qualquer método dentro da própria classe, seus amigos e suas sub-classes.
Isto contradiz o comportamento mais difundido de escrever-uma-vez-modificar-nunca encontrado noutras linguagens.
A diferença pode levar a surpresas más.

> Para evitar mal-entendidos: Proteger variáveis contra modificação acidental é uma boa prática.
> recomendaríamos aplicá-la ao ABAP também se existisse uma instrução apropriada.

### Construtores

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Classes](#classes) > [Esta seção](#construtores)

#### Prefira NEW a CREATE OBJECT

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Classes](#classes) > [Construtores](#construtores) > [Esta seção](#prefira-new-a-create-object)

```ABAP
DATA object TYPE REF TO /clean/some_number_range.
object = NEW #( '/CLEAN/CXTGEN' )
...
DATA(object) = NEW /clean/some_number_range( '/CLEAN/CXTGEN' ).
...
DATA(object) = CAST /clean/number_range( NEW /clean/some_number_range( '/CLEAN/CXTGEN' ) ).
```

em vez do desnecessariamente mais longo

```ABAP
" anti-padrão
DATA object TYPE REF TO /dirty/some_number_range.
CREATE OBJECT object
  EXPORTING
    number_range = '/DIRTY/CXTGEN'.
```

exceto onde precisa de tipos dinâmicos, claro

```ABAP
CREATE OBJECT number_range TYPE (dynamic_type)
  EXPORTING
    number_range = '/CLEAN/CXTGEN'.
```

#### Se a sua classe global for CREATE PRIVATE, deixe o CONSTRUCTOR público

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Classes](#classes) > [Construtores](#construtores) > [Esta seção](#se-a-sua-classe-global-for-create-private-deixe-o-constructor-público)

```ABAP
CLASS /clean/some_api DEFINITION PUBLIC FINAL CREATE PRIVATE.
  PUBLIC SECTION.
    METHODS constructor.
```

Concordamos que isto se contradiz.
No entanto, de acordo com o artigo
[_Instance Constructor_ da Ajuda ABAP](https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abeninstance_constructor_guidl.htm),
especificar o `CONSTRUCTOR` na `PUBLIC SECTION` é necessário para garantir a compilação correta e validação de sintaxe.

Isto aplica-se apenas a classes globais.
Em classes locais, torne o construtor privado, como deve ser.

#### Prefira múltiplos métodos de criação estáticos a parâmetros opcionais

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Classes](#classes) > [Construtores](#construtores) > [Esta seção](#prefira-múltiplos-métodos-de-criação-estáticos-a-parâmetros-opcionais)

```ABAP
CLASS-METHODS describe_by_data IMPORTING data TYPE any [...]
CLASS-METHODS describe_by_name IMPORTING name TYPE any [...]
CLASS-METHODS describe_by_object_ref IMPORTING object_ref TYPE REF TO object [...]
CLASS-METHODS describe_by_data_ref IMPORTING data_ref TYPE REF TO data [...]
```

ABAP não suporta [sobrecarga](https://pt.wikipedia.org/wiki/Sobrecarga_de_fun%C3%A7%C3%A3o).
Use variações de nome e não parâmetros opcionais para atingir a semântica desejada.

```ABAP
" anti-padrão
METHODS constructor
  IMPORTING
    data       TYPE any OPTIONAL
    name       TYPE any OPTIONAL
    object_ref TYPE REF TO object OPTIONAL
    data_ref   TYPE REF TO data OPTIONAL
  [...]
```

A diretriz geral
[_Divida métodos em vez de adicionar parâmetros OPTIONAL_](#divida-métodos-em-vez-de-adicionar-parâmetros-optional)
explica o raciocínio por trás disto.

Considere resolver construções complexas para uma construção multi-passo com o
[padrão de design Builder](https://pt.wikipedia.org/wiki/Builder).

#### Use nomes descritivos para múltiplos métodos de criação

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Classes](#classes) > [Construtores](#construtores) > [Esta seção](#use-nomes-descritivos-para-múltiplos-métodos-de-criação)

Boas palavras para iniciar métodos de criação são `new_`, `create_`, e `construct_`.
As pessoas ligam-nas intuitivamente à construção de objetos.
Elas também se somam bem a frases verbais como `new_from_template`, `create_as_copy`, ou `create_by_name`.

```ABAP
CLASS-METHODS new_describe_by_data IMPORTING p_data TYPE any [...]
CLASS-METHODS new_describe_by_name IMPORTING p_name TYPE any [...]
CLASS-METHODS new_describe_by_object_ref IMPORTING p_object_ref TYPE REF TO object [...]
CLASS-METHODS new_describe_by_data_ref IMPORTING p_data_ref TYPE REF TO data [...]
```

em vez de algo sem sentido como

```ABAP
" anti-padrão
CLASS-METHODS create_1 IMPORTING p_data TYPE any [...]
CLASS-METHODS create_2 IMPORTING p_name TYPE any [...]
CLASS-METHODS create_3 IMPORTING p_object_ref TYPE REF TO object [...]
CLASS-METHODS create_4 IMPORTING p_data_ref TYPE REF TO data [...]
```

#### Faça singletons apenas onde múltiplas instâncias não fazem sentido

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Classes](#classes) > [Construtores](#construtores) > [Esta seção](#faça-singletons-apenas-onde-múltiplas-instâncias-não-fazem-sentido)

```ABAP
METHOD new.
  IF singleton IS NOT BOUND.
    singleton = NEW /clean/my_class( ).
  ENDIF.
  result = singleton.
ENDMETHOD.
```

Aplique o padrão singleton onde o seu design orientado a objetos diz
que ter uma segunda instância de algo não faz sentido.
Use-o para garantir que cada consumidor está a trabalhar com a mesma coisa no mesmo estado e com os mesmos dados.

Não use o padrão singleton por hábito ou porque alguma regra de desempenho lhe diz para o fazer.
É o padrão mais sobreutilizado e mal aplicado e
produz efeitos cruzados inesperados e complica desnecessariamente os testes.
Se não houver razões impulsionadas pelo design para um objeto unitário,
deixe essa decisão para o consumidor - ele ainda pode alcançar o mesmo por meios fora do construtor,
por exemplo com uma fábrica.

## Métodos

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Esta seção](#métodos)

Estas regras se aplicam a métodos em classes e módulos de função.

### Chamadas

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Esta seção](#chamadas)

#### Não chame métodos estáticos através de variáveis de instância

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Chamadas](#chamadas) > [Esta seção](#não-chame-métodos-estáticos-através-de-variáveis-de-instância)

Para chamar um método estático, use

```ABAP
cl_my_class=>static_method( ).
```

Em vez de chamá-lo através de uma variável de instância para `cl_my_class`

```ABAP
" anti-padrão
lo_my_instance->static_method( ).
```

Um método estático é anexado à própria classe, e chamá-lo através de uma variável de instância é uma fonte potencial de confusão.

É OK chamar um método estático da mesma classe sem qualificá-lo dentro de outro método estático.

```ABAP
METHOD static_method.
  another_static_method( ).
  yet_another( ).
ENDMETHOD.
```

No entanto, dentro de um método de instância, mesmo ao chamar um método estático da mesma classe, você ainda deve qualificar a chamada com o nome da classe:

```ABAP
CLASS cl_my_class IMPLEMENTATION.

  METHOD instance_method.
    cl_my_class=>a_static_method( ).
    another_instance_method( ).
  ENDMETHOD.

  ...
```

#### Não acesse tipos através de variáveis de instância

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Chamadas](#chamadas) > [Esta seção](#não-acesse-tipos-através-de-variáveis-de-instância)

Ao usar um tipo de dados que é definido em uma classe ou interface, acesse a definição de tipo via classe/interface e não via uma instância da classe/interface.

```ABAP
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES foo TYPE i.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
ENDCLASS.

INTERFACE lif.
  TYPES blah TYPE lcl=>foo.
ENDINTERFACE.
```

Usar a instância para o tipo de dados seria confuso, pois sugere que o tipo é específico da instância.

```ABAP
" anti-padrão
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES foo TYPE i.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
ENDCLASS.

INTERFACE lif.
  DATA(ref) = new lcl( ).
  TYPES blah TYPE ref->foo.
ENDINTERFACE.
```

#### Prefira chamadas funcionais a procedurais

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Chamadas](#chamadas) > [Esta seção](#prefira-chamadas-funcionais-a-procedurais)

```ABAP
modify->update( node           = /clean/my_bo_c=>node-item
                key            = item->key
                data           = item
                changed_fields = changed_fields ).
```

em vez do desnecessariamente mais longo

```ABAP
" anti-padrão
CALL METHOD modify->update
  EXPORTING
    node           = /dirty/my_bo_c=>node-item
    key            = item->key
    data           = item
    changed_fields = changed_fields.
```

Se a tipagem dinâmica proibir chamadas funcionais, recorra ao estilo procedural

```ABAP
CALL METHOD modify->(method_name)
  EXPORTING
    node           = /clean/my_bo_c=>node-item
    key            = item->key
    data           = item
    changed_fields = changed_fields.
```

Muitas das regras detalhadas abaixo são apenas variações mais específicas deste conselho.

#### Omita RECEIVING

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Chamadas](#chamadas) > [Esta seção](#omita-receiving)

```ABAP
DATA(sum) = aggregate_values( values ).
```

em vez do desnecessariamente mais longo

```ABAP
" anti-padrão
aggregate_values(
  EXPORTING
    values = values
  RECEIVING
    result = DATA(sum) ).
```

#### Omita a palavra-chave opcional EXPORTING

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Chamadas](#chamadas) > [Esta seção](#omita-a-palavra-chave-opcional-exporting)

```ABAP
modify->update( node           = /clean/my_bo_c=>node-item
                key            = item->key
                data           = item
                changed_fields = changed_fields ).
```

em vez do desnecessariamente mais longo

```ABAP
" anti-padrão
modify->update(
  EXPORTING
    node           = /dirty/my_bo_c=>node-item
    key            = item->key
    data           = item
    changed_fields = changed_fields ).
```

#### Omita o nome do parâmetro em chamadas de parâmetro único

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Chamadas](#chamadas) > [Esta seção](#omita-o-nome-do-parâmetro-em-chamadas-de-parâmetro-único)

```ABAP
DATA(unique_list) = remove_duplicates( list ).
```

em vez do desnecessariamente mais longo

```ABAP
" anti-padrão
DATA(unique_list) = remove_duplicates( list = list ).
```

Existem casos, no entanto, onde o nome do método por si só não é claro o suficiente
e repetir o nome do parâmetro pode aumentar a compreensão:

```ABAP
car->drive( speed = 50 ).
update( asynchronous = abap_true ).
```

#### Omita a auto-referência me ao chamar um atributo ou método de instância

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Chamadas](#chamadas) > [Esta seção](#omita-a-auto-referência-me-ao-chamar-um-atributo-ou-método-de-instância)

Como a auto-referência `me->` é implicitamente definida pelo sistema, omita-a ao chamar um atributo ou método de instância

```ABAP
DATA(sum) = aggregate_values( values ).
```

em vez do desnecessariamente mais longo

```ABAP
" anti-padrão
DATA(sum) = aggregate_values( me->values ).
```

```ABAP
" anti-padrão
DATA(sum) = me->aggregate_values( values ).
```

a menos que haja um conflito de escopo entre uma variável local ou parâmetro de importação e um atributo de instância

```ABAP
me->logger = logger.
```

### Métodos: Orientação a Objetos

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Esta seção](#métodos-orientação-a-objetos)

#### Prefira métodos de instância a estáticos

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Métodos: Orientação a Objetos](#métodos-orientação-a-objetos) > [Esta seção](#prefira-métodos-de-instância-a-estáticos)

Os métodos devem ser membros de instância por padrão.
Métodos de instância refletem melhor a "natureza de objeto" da classe.
Podem ser mockados mais facilmente em testes unitários.

```ABAP
METHODS publish.
```

Métodos devem ser estáticos apenas em casos excepcionais, tais como métodos de criação estáticos.

```ABAP
CLASS-METHODS create_instance
  RETURNING
    VALUE(result) TYPE REF TO /clean/blog_post.
```

#### Métodos de instância públicos devem ser parte de uma interface

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Métodos: Orientação a Objetos](#métodos-orientação-a-objetos) > [Esta seção](#métodos-de-instância-públicos-devem-ser-parte-de-uma-interface)

Métodos de instância públicos devem sempre ser parte de uma interface.
Isto desacopla dependências e simplifica o mock deles em testes unitários.

```ABAP
METHOD /clean/blog_post~publish.
```

Em orientação a objetos limpa, ter um método público sem uma interface não faz muito sentido -
com poucas exceções, tais como classes de enumeração
que nunca terão uma implementação alternativa e nunca serão mockadas em casos de teste.

> [Interfaces vs. classes abstratas](sub-sections/InterfacesVsAbstractClasses.md)
> descreve porque é que isto também se aplica a classes que sobrescrevem métodos herdados.

### Número de Parâmetros

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Esta seção](#número-de-parâmetros)

#### Aponte para poucos parâmetros IMPORTING, no melhor caso menos de três

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Número de Parâmetros](#número-de-parâmetros) > [Esta seção](#aponte-para-poucos-parâmetros-importing-no-melhor-caso-menos-de-três)

```ABAP
FUNCTION seo_class_copy
  IMPORTING
    clskey      TYPE seoclskey
    new_clskey  TYPE seoclskey
    config      TYPE class_copy_config
  EXPORTING
    ...
```

seria muito mais claro do que

```ABAP
" anti-padrão
FUNCTION seo_class_copy
  IMPORTING
    clskey                 TYPE seoclskey
    new_clskey             TYPE seoclskey
    access_permission      TYPE seox_boolean DEFAULT seox_true
    VALUE(save)            TYPE seox_boolean DEFAULT seox_true
    VALUE(suppress_corr)   TYPE seox_boolean DEFAULT seox_false
    VALUE(suppress_dialog) TYPE seox_boolean DEFAULT seox_false
    VALUE(authority_check) TYPE seox_boolean DEFAULT seox_true
    lifecycle_manager      TYPE REF TO if_adt_lifecycle_manager OPTIONAL
    lock_handle            TYPE REF TO if_adt_lock_handle OPTIONAL
    VALUE(suppress_commit) TYPE seox_boolean DEFAULT seox_false
  EXPORTING
    ...
```

Demasiados parâmetros de entrada fazem explodir a complexidade de um método
porque ele precisa de lidar com um número exponencial de combinações.
Muitos parâmetros são um indicador de que o método pode fazer mais do que uma coisa.

Pode reduzir o número de parâmetros combinando-os em conjuntos significativos com estruturas e objetos.

#### Divida métodos em vez de adicionar parâmetros OPTIONAL

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Número de Parâmetros](#número-de-parâmetros) > [Esta seção](#divida-métodos-em-vez-de-adicionar-parâmetros-optional)

```ABAP
METHODS do_one_thing IMPORTING what_i_need TYPE string.
METHODS do_another_thing IMPORTING something_else TYPE i.
```

para alcançar a semântica desejada, uma vez que o ABAP não suporta [sobrecarga](https://pt.wikipedia.org/wiki/Sobrecarga_de_fun%C3%A7%C3%A3o).

```ABAP
" anti-padrão
METHODS do_one_or_the_other
  IMPORTING
    what_i_need    TYPE string OPTIONAL
    something_else TYPE i OPTIONAL.
```

Parâmetros opcionais confundem os chamadores:

- Quais são realmente necessários?
- Que combinações são válidas?
- Quais se excluem mutuamente?

Múltiplos métodos com parâmetros específicos para o caso de uso evitam esta confusão dando orientação clara sobre que combinações de parâmetros são válidas e esperadas.

#### Use PREFERRED PARAMETER com moderação

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Número de Parâmetros](#número-de-parâmetros) > [Esta seção](#use-preferred-parameter-com-moderação)

A adição `PREFERRED PARAMETER` torna difícil ver que parâmetro é realmente fornecido,
tornando mais difícil entender o código.
Minimizar o número de parâmetros, especialmente os opcionais,
reduz automaticamente a necessidade de `PREFERRED PARAMETER`.

#### RETURN, EXPORT, ou CHANGE exatamente um parâmetro

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Número de Parâmetros](#número-de-parâmetros) > [Esta seção](#return-export-ou-change-exatamente-um-parâmetro)

Um bom método faz _uma coisa_, e isso deve ser refletido pelo método também retornando exatamente uma coisa.
Se os parâmetros de saída do seu método _não_ formam uma entidade lógica,
o seu método faz mais do que uma coisa e deve dividi-lo.

Existem casos onde a saída é uma entidade lógica que consiste em múltiplas coisas.
Estas são mais facilmente representadas retornando uma estrutura ou objeto:

```ABAP
TYPES:
  BEGIN OF check_result,
    result      TYPE result_type,
    failed_keys TYPE /bobf/t_frw_key,
    messages    TYPE /bobf/t_frw_message,
  END OF check_result.

METHODS check_business_partners
  IMPORTING
    business_partners TYPE business_partners
  RETURNING
    VALUE(result)     TYPE check_result.
```

em vez de

```ABAP
" anti-padrão
METHODS check_business_partners
  IMPORTING
    business_partners TYPE business_partners
  EXPORTING
    result            TYPE result_type
    failed_keys       TYPE /bobf/t_frw_key
    messages          TYPE /bobf/t_frw_message.
```

Especialmente em comparação com múltiplos parâmetros EXPORTING, isto permite às pessoas usar o estilo de chamada funcional,
poupa-o de ter de pensar sobre `IS SUPPLIED` e poupa as pessoas de esquecerem acidentalmente
de recuperar uma informação vital de `ERROR_OCCURRED`.

Em vez de múltiplos parâmetros de saída opcionais, considere dividir o método de acordo com padrões de chamada significativos:

```ABAP
TYPES:
  BEGIN OF check_result,
    result      TYPE result_type,
    failed_keys TYPE /bobf/t_frw_key,
    messages    TYPE /bobf/t_frw_message,
  END OF check_result.

METHODS check
  IMPORTING
    business_partners TYPE business_partners
  RETURNING
    VALUE(result)     TYPE result_type.

METHODS check_and_report
  IMPORTING
    business_partners TYPE business_partners
  RETURNING
    VALUE(result)     TYPE check_result.
```

### Tipos de Parâmetros

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Esta seção](#tipos-de-parâmetros)

#### Prefira RETURNING a EXPORTING

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Tipos de Parâmetros](#tipos-de-parâmetros) > [Esta seção](#prefira-returning-a-exporting)

```ABAP
METHODS square
  IMPORTING
    number        TYPE i
  RETURNING
    VALUE(result) TYPE i.

DATA(result) = square( 42 ).
```

Em vez do desnecessariamente mais longo

```ABAP
" anti-padrão
METHODS square
  IMPORTING
    number TYPE i
  EXPORTING
    result TYPE i.

square(
  EXPORTING
    number = 42
  IMPORTING
    result = DATA(result) ).
```

`RETURNING` não só torna a chamada mais curta,
também permite encadeamento de métodos e previne [erros de mesma-entrada-e-saída](#tome-cuidado-se-entrada-e-saída-puderem-ser-a-mesma).

#### RETURNING tabelas grandes é geralmente aceitável

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Tipos de Parâmetros](#tipos-de-parâmetros) > [Esta seção](#returning-tabelas-grandes-é-geralmente-aceitável)

Embora a documentação da linguagem ABAP e guias de desempenho digam o contrário,
raramente encontramos casos onde passar uma tabela grande ou profundamente aninhada num parâmetro VALUE
cause _realmente_ problemas de desempenho.
Recomendamos, portanto, usar geralmente

```ABAP
METHODS get_large_table
  RETURNING
    VALUE(result) TYPE /clean/some_table_type.

METHOD get_large_table.
  result = large_table.
ENDMETHOD.

DATA(my_table) = get_large_table( ).
```

Apenas se houver prova real (= uma medição de desempenho má) para o seu caso individual
deve recorrer ao estilo procedural mais trabalhoso

```ABAP
" anti-padrão
METHODS get_large_table
  EXPORTING
    result TYPE /dirty/some_table_type.

METHOD get_large_table.
  result = large_table.
ENDMETHOD.

get_large_table( IMPORTING result = DATA(my_table) ).
```

> Esta seção contradiz as Diretrizes de Programação ABAP e verificações do Code Inspector,
> ambos sugerindo que tabelas grandes devem ser EXPORTED por referência para evitar défices de desempenho.
> Falhámos consistentemente em reproduzir quaisquer défices de desempenho e memória
> e recebemos notificação sobre otimização do kernel que geralmente melhora o desempenho de RETURNING,
> veja [_Sharing Between Dynamic Data Objects_ na Ajuda da Linguagem ABAP](https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abenmemory_consumption_3.htm).

#### Use ou RETURNING ou EXPORTING ou CHANGING, mas não uma combinação

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Tipos de Parâmetros](#tipos-de-parâmetros) > [Esta seção](#use-ou-returning-ou-exporting-ou-changing-mas-não-uma-combinação)

```ABAP
METHODS copy_class
  IMPORTING
    old_name      TYPE seoclsname
    new name      TYPE secolsname
  RETURNING
    VALUE(result) TYPE copy_result
  RAISING
    /clean/class_copy_failure.
```

em vez de misturas confusas como

```ABAP
" anti-padrão
METHODS copy_class
  ...
  RETURNING
    VALUE(result)      TYPE vseoclass
  EXPORTING
    error_occurred     TYPE abap_bool
  CHANGING
    correction_request TYPE trkorr
    package            TYPE devclass.
```

Diferentes tipos de parâmetros de saída é um indicador de que o método faz mais do que uma coisa.
Confunde o leitor e torna a chamada do método desnecessariamente complicada.

Uma exceção aceitável a esta regra podem ser builders que consomem a sua entrada enquanto constroem a sua saída:

```ABAP
METHODS build_tree
  CHANGING
    tokens        TYPE tokens
  RETURNING
    VALUE(result) TYPE REF TO tree.
```

No entanto, até esses podem ser tornados mais claros objetificando a entrada:

```ABAP
METHODS build_tree
  IMPORTING
    tokens        TYPE REF TO token_stack
  RETURNING
    VALUE(result) TYPE REF TO tree.
```

#### Use CHANGING com moderação, onde adequado

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Tipos de Parâmetros](#tipos-de-parâmetros) > [Esta seção](#use-changing-com-moderação-onde-adequado)

`CHANGING` deve ser reservado para casos onde uma variável local existente
que já está preenchida é atualizada apenas em alguns lugares:

```ABAP
METHODS update_references
  IMPORTING
    new_reference TYPE /bobf/conf_key
  CHANGING
    bo_nodes      TYPE root_nodes.

METHOD update_references.
  LOOP AT bo_nodes REFERENCE INTO DATA(bo_node).
    bo_node->reference = new_reference.
  ENDLOOP.
ENDMETHOD.
```

Não force os seus chamadores a introduzir variáveis locais desnecessárias apenas para fornecer o seu parâmetro `CHANGING`.
Não use parâmetros `CHANGING` para preencher inicialmente uma variável previamente vazia.

#### Divida método em vez de parâmetro de entrada Booleano

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Tipos de Parâmetros](#tipos-de-parâmetros) > [Esta seção](#dividir-método-em-vez-de-parâmetro-de-entrada-booleano)

Parâmetros de entrada Booleanos são muitas vezes um indicador
de que um método faz _duas_ coisas em vez de uma.

```ABAP
" anti-padrão
METHODS update
  IMPORTING
    do_save TYPE abap_bool.
```

Também, chamadas de método com um único - e portanto sem nome - parâmetro Booleano
tendem a obscurecer o significado do parâmetro.

```ABAP
" anti-padrão
update( abap_true ).  " o que significa 'true'? síncrono? simular? commit?
```

Dividir o método pode simplificar o código dos métodos
e descrever as diferentes intenções melhor

```ABAP
update_without_saving( ).
update_and_save( ).
```

A perceção comum sugere que setters para variáveis Booleanas são aceitáveis:

```ABAP
METHODS set_is_deleted
  IMPORTING
    new_value TYPE abap_bool.
```

> Leia mais em
> [1](https://web.archive.org/web/20190907112758/http://www.beyondcode.org/articles/booleanVariables.html)
> [2](https://web.archive.org/web/20220314024954/https://silkandspinach.net/2004/07/15/avoid-boolean-parameters/)
> [3](https://web.archive.org/web/20231211152320/https://jlebar.com/2011/12/16/Boolean_parameters_to_API_functions_considered_harmful..html)

### Nomes de Parâmetros

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Esta seção](#nomes-de-parâmetros)

#### Considere chamar ao parâmetro RETURNING RESULT

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Nomes de Parâmetros](#nomes-de-parâmetros) > [Esta seção](#considere-chamar-ao-parâmetro-returning-result)

Bons nomes de métodos são geralmente tão bons que o parâmetro `RETURNING` não precisa de um nome próprio.
O nome faria pouco mais do que papaguear o nome do método ou repetir algo óbvio.

Repetir um nome de membro pode até produzir conflitos que precisam de ser resolvidos adicionando um `me->` supérfluo.

```ABAP
" anti-padrão
METHODS get_name
  RETURNING
    VALUE(name) TYPE string.

METHOD get_name.
  name = me->name.
ENDMETHOD.
```

Nestes casos, simplesmente chame ao parâmetro `RESULT`, ou algo como `RV_RESULT` se preferir notação Húngara.

Nomeie o parâmetro `RETURNING` se _não_ for óbvio o que ele representa,
por exemplo em métodos que retornam `me` para encadeamento de métodos,
ou em métodos que criam algo mas não retornam a entidade criada mas apenas a sua chave ou algo assim.

### Inicialização de Parâmetros

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Esta seção](#inicialização-de-parâmetros)

#### Limpe ou sobrescreva parâmetros de referência EXPORTING

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Inicialização de Parâmetros](#inicialização-de-parâmetros) > [Esta seção](#limpe-ou-sobrescreva-parâmetros-de-referência-exporting)

Parâmetros de referência referem-se a áreas de memória existentes que podem estar preenchidas previamente.
Limpe-os ou sobrescreva-os para fornecer dados fiáveis:

```ABAP
METHODS square
  EXPORTING
    result TYPE i.

" limpar
METHOD square.
  CLEAR result.
  " ...
ENDMETHOD.

" sobrescrever
METHOD square.
  result = cl_abap_math=>square( 2 ).
ENDMETHOD.
```

> Code inspector e Checkman apontam variáveis `EXPORTING` que nunca são escritas.
> Use estas verificações estáticas para evitar esta fonte de erro de outra forma bastante obscura.

##### Tome cuidado se entrada e saída puderem ser a mesma

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Inicialização de Parâmetros](#inicialização-de-parâmetros) > [Limpe ou sobrescreva parâmetros de referência EXPORTING](#limpe-ou-sobrescreva-parâmetros-de-referência-exporting) > [Esta seção](#tome-cuidado-se-entrada-e-saída-puderem-ser-a-mesma)

Geralmente, é uma boa ideia limpar o parâmetro como primeira coisa no método após declarações de tipo e dados.
Isto torna a instrução fácil de detetar e evita que o valor ainda contido seja acidentalmente usado por instruções posteriores.

No entanto, algumas configurações de parâmetros podem usar a mesma variável como entrada e saída.
Neste caso, um `CLEAR` antecipado apagaria o valor de entrada antes que ele possa ser usado, produzindo resultados errados.

```ABAP
" anti-padrão
DATA value TYPE i.

square_dirty(
  EXPORTING
    number = value
  IMPORTING
    result = value ).

METHOD square_dirty.
  CLEAR result.
  result = number * number.
ENDMETHOD.
```

Considere redesenhar tais métodos substituindo `EXPORTING` por `RETURNING`.
Considere também sobrescrever o parâmetro `EXPORTING` numa única instrução de cálculo de resultado.
Se nenhum servir, recorra a um `CLEAR` tardio.

#### Não limpe parâmetros VALUE

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Inicialização de Parâmetros](#inicialização-de-parâmetros) > [Esta seção](#não-limpe-parâmetros-value)

Parâmetros que funcionam por `VALUE` são entregues como novas áreas de memória separadas que estão vazias por definição.
Não os limpe novamente:

```ABAP
METHODS square
  EXPORTING
    VALUE(result) TYPE i.

METHOD square.
  " não há necessidade de CLEAR result
ENDMETHOD.
```

Parâmetros `RETURNING` são sempre parâmetros `VALUE`, por isso nunca precisa de os limpar:

```ABAP
METHODS square
  RETURNING
    VALUE(result) TYPE i.

METHOD square.
  " não há necessidade de CLEAR result
ENDMETHOD.
```

### Corpo do Método

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Esta seção](#corpo-do-método)

#### Faça uma coisa, faça-a bem, faça-a apenas

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Corpo do Método](#corpo-do-método) > [Esta seção](#faça-uma-coisa-faça-a-bem-faça-a-apenas)

Um método deve fazer uma coisa, e apenas uma coisa.
Deve fazê-lo da melhor maneira possível.

Um método provavelmente faz uma coisa se

- tem [poucos parâmetros de entrada](#aponte-para-poucos-parâmetros-importing-no-melhor-caso-menos-de-três)
- [não inclui parâmetros Booleanos](#dividir-método-em-vez-de-parâmetro-de-entrada-booleano)
- tem [exatamente um parâmetro de saída](#return-export-ou-change-exatamente-um-parâmetro)
- é [pequeno](#mantenha-os-métodos-pequenos)
- [desce um nível de abstração](#desça-um-nível-de-abstração)
- apenas [lança um tipo de exceção](#lance-um-tipo-de-exceção)
- não consegue extrair outros métodos significativos
- não consegue agrupar significativamente as suas instruções em seções

#### Foque no caminho feliz ou tratamento de erros, mas não em ambos

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Corpo do Método](#corpo-do-método) > [Esta seção](#foque-no-caminho-feliz-ou-tratamento-de-erros-mas-não-em-ambos)

Como uma especialização da regra [_Faça uma coisa, faça-a bem, faça-a apenas_](#faça-uma-coisa-faça-a-bem-faça-a-apenas),
um método deve ou seguir o caminho feliz para o qual foi construído,
ou o desvio de tratamento de erros caso não consiga,
mas provavelmente não ambos.

```ABAP
" anti-padrão
METHOD append_xs.
  IF input > 0.
    DATA(remainder) = input.
    WHILE remainder > 0.
      result = result && `X`.
      remainder = remainder - 1.
    ENDWHILE.
  ELSEIF input = 0.
    RAISE EXCEPTION /dirty/sorry_cant_do( ).
  ELSE.
    RAISE EXCEPTION cx_sy_illegal_argument( ).
  ENDIF.
ENDMETHOD.
```

Pode ser decomposto em

```ABAP
METHOD append_xs.
  validate( input ).
  DATA(remainder) = input.
  WHILE remainder > 0.
    result = result && `X`.
    remainder = remainder - 1.
  ENDWHILE.
ENDMETHOD.

METHOD validate.
  IF input = 0.
    RAISE EXCEPTION /dirty/sorry_cant_do( ).
  ELSEIF input < 0.
    RAISE EXCEPTION cx_sy_illegal_argument( ).
  ENDIF.
ENDMETHOD.
```

ou, para enfatizar a parte da validação

```ABAP
METHOD append_xs.
  IF input > 0.
    result = append_xs_without_check( input ).
  ELSEIF input = 0.
    RAISE EXCEPTION /dirty/sorry_cant_do( ).
  ELSE.
    RAISE EXCEPTION cx_sy_illegal_argument( ).
  ENDIF.
ENDMETHOD.

METHOD append_xs_without_check.
  DATA(remainder) = input.
  WHILE remainder > 0.
    result = result && `X`.
    remainder = remainder - 1.
  ENDWHILE.
ENDMETHOD.
```

#### Desça um nível de abstração

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Corpo do Método](#corpo-do-método) > [Esta seção](#desça-um-nível-de-abstração)

As instruções num método devem estar um nível de abstração abaixo do próprio método.
Correspondentemente, devem estar todas no mesmo nível de abstração.

```ABAP
METHOD create_and_publish.
  post = create_post( user_input ).
  post->publish( ).
ENDMETHOD.
```

em vez de misturas confusas de conceitos de baixo nível (`trim`, `to_upper`, ...) e alto nível (`publish`, ...) como

```ABAP
" anti-padrão
METHOD create_and_publish.
  post = NEW blog_post( ).
  DATA(user_name) = trim( to_upper( sy-uname ) ).
  post->set_author( user_name ).
  post->publish( ).
ENDMETHOD.
```

Uma forma fiável de descobrir qual é o nível de abstração correto é esta:
Deixe o autor do método explicar o que o método faz em poucas, curtas palavras, sem olhar para o código.
Os pontos que ele(a) numerar são os sub-métodos que o método deve chamar ou as instruções que deve executar.

#### Mantenha os métodos pequenos

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Corpo do Método](#corpo-do-método) > [Esta seção](#mantenha-os-métodos-pequenos)

Os métodos devem ter menos de 20 instruções, idealmente cerca de 3 a 5 instruções.

```ABAP
METHOD read_and_parse_version_filters.
  DATA(active_model_version) = read_random_version_under( model_guid ).
  DATA(filter_json) = read_model_version_filters( active_model_version-guid ).
  result = parse_model_version_filters( filter_json ).
ENDMETHOD.
```

A seguinte declaração `DATA` por si só é suficiente para ver que o método circundante faz muito mais do que uma coisa:

```ABAP
" anti-padrão
DATA:
  class           TYPE vseoclass,
  attributes      TYPE seoo_attributes_r,
  methods         TYPE seoo_methods_r,
  events          TYPE seoo_events_r,
  types           TYPE seoo_types_r,
  aliases         TYPE seoo_aliases_r,
  implementings   TYPE seor_implementings_r,
  inheritance     TYPE vseoextend,
  friendships     TYPE seof_friendships_r,
  typepusages     TYPE seot_typepusages_r,
  clsdeferrds     TYPE seot_clsdeferrds_r,
  intdeferrds     TYPE seot_intdeferrds_r,
  attribute       TYPE vseoattrib,
  method          TYPE vseomethod,
  event           TYPE vseoevent,
  type            TYPE vseotype,
  alias           TYPE seoaliases,
  implementing    TYPE vseoimplem,
  friendship      TYPE seofriends,
  typepusage      TYPE vseotypep,
  clsdeferrd      TYPE vseocdefer,
  intdeferrd      TYPE vseoidefer,
  new_clskey_save TYPE seoclskey.
```

É claro que há ocasiões em que não faz sentido reduzir mais um método grande.
Isto é perfeitamente aceitável desde que o método permaneça [focado numa coisa](#faça-uma-coisa-faça-a-bem-faça-a-apenas):

```ABAP
METHOD decide_what_to_do.
  CASE temperature.
    WHEN burning.
      result = air_conditioning.
    WHEN hot.
      result = ice_cream.
    WHEN moderate.
      result = chill.
    WHEN cold.
      result = skiing.
    WHEN freezing.
      result = hot_cocoa.
  ENDCASE.
ENDMETHOD.
```

No entanto, ainda faz sentido validar se o código verboso esconde um padrão mais adequado:

```ABAP
METHOD decide_what_to_do.
  result = VALUE #( spare_time_activities[ temperature = temperature ] OPTIONAL ).
ENDMETHOD.
```

> Cortar métodos muito pequenos pode ter um impacto negativo no desempenho porque aumenta o número de chamadas de métodos.
> A [seção _Tenha em mente o desempenho_](#tenha-em-mente-o-desempenho) dá orientações sobre como equilibrar Clean Code e desempenho.

### Controle de Fluxo

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Esta seção](#controle-de-fluxo)

#### Fail fast (Falhe rápido)

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Controle de Fluxo](#controle-de-fluxo) > [Esta seção](#fail-fast-falhe-rápido)

Valide e falhe o mais cedo possível:

```ABAP
METHOD do_something.
  IF input IS INITIAL.
    RAISE EXCEPTION cx_sy_illegal_argument( ).
  ENDIF.
  DATA(massive_object) = build_expensive_object_from( input ).
  result = massive_object->do_some_fancy_calculation( ).
ENDMETHOD.
```

Validações posteriores são mais difíceis de detetar e compreender e podem já ter desperdiçado recursos até chegar lá.

```ABAP
" anti-padrão
METHOD do_something.
  DATA(massive_object) = build_expensive_object_from( input ).
  IF massive_object IS NOT BOUND. " acontece se input for inicial
    RAISE EXCEPTION cx_sy_illegal_argument( ).
  ENDIF.
  result = massive_object->do_some_fancy_calculation( ).
ENDMETHOD.
```

#### CHECK vs. RETURN

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Controle de Fluxo](#controle-de-fluxo) > [Esta seção](#check-vs-return)

Não há consenso sobre se deve usar `CHECK` ou `RETURN` para sair de um método
se a entrada não satisfizer as expectativas.

Enquanto `CHECK` fornece definitivamente a sintaxe mais curta

```ABAP
METHOD read_customizing.
  CHECK keys IS NOT INITIAL.
  " faça o que for preciso fazer
ENDMETHOD.
```

o nome da instrução não revela o que acontece se a condição falhar,
de tal forma que as pessoas provavelmente entenderão a forma longa melhor:

```ABAP
METHOD read_customizing.
  IF keys IS INITIAL.
    RETURN.
  ENDIF.
  " faça o que for preciso fazer
ENDMETHOD.
```

Poderia evitar a questão completamente revertendo a validação e adotando um fluxo de controle de retorno único.
Isto é considerado um anti-padrão porque introduz profundidade de aninhamento desnecessária.

```ABAP
METHOD read_customizing.
  " anti-padrão
  IF keys IS NOT INITIAL.
    " faça o que for preciso fazer
  ENDIF.
ENDMETHOD.
```

Em qualquer caso, considere se retornar nada é realmente o comportamento apropriado.
Métodos devem fornecer um resultado significativo, significando ou um parâmetro de retorno preenchido, ou uma exceção.
Retornar nada é em muitos casos similar a retornar `null`, o que deve ser evitado.

> A [seção _Exiting Procedures_ nas Diretrizes de Programação ABAP](https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/index.htm?file=abenexit_procedure_guidl.htm)
> recomenda usar `CHECK` nesta instância.
> A discussão da comunidade sugere que a instrução é tão pouco clara
> que muitas pessoas não entenderão o comportamento do programa.

#### Evite CHECK noutras posições

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Métodos](#métodos) > [Controle de Fluxo](#controle-de-fluxo) > [Esta seção](#evite-check-noutras-posições)

Não use `CHECK` fora da seção de inicialização de um método.
A instrução comporta-se de forma diferente em diferentes posições e pode levar a efeitos pouco claros e inesperados.

Por exemplo,
[`CHECK` num `LOOP` termina a iteração atual e prossegue com a próxima](https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abapcheck_loop.htm);
as pessoas podem acidentalmente esperar que termine o método ou saia do loop.
Prefira usar uma instrução `IF` em combinação com `CONTINUE` em vez disso, já que `CONTINUE` só pode ser usado em loops.

> Baseado na [seção _Exiting Procedures_ nas Diretrizes de Programação ABAP](https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/index.htm?file=abenexit_procedure_guidl.htm).
> Note que isto contradiz a [referência de palavra-chave para `CHECK` em loops](https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abapcheck_loop.htm).

## Tratamento de Erros

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Esta seção](#tratamento-de-erros)

### Mensagens

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Tratamento de Erros](#tratamento-de-erros) > [Esta seção](#mensagens)

#### Torne as mensagens fáceis de encontrar

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Tratamento de Erros](#tratamento-de-erros) > [Mensagens](#mensagens) > [Esta seção](#torne-as-mensagens-fáceis-de-encontrar)

Para tornar as mensagens fáceis de encontrar através de uma pesquisa where-used a partir da transação SE91, use o seguinte padrão:

```ABAP
MESSAGE e001(ad) INTO DATA(message).
```

Caso a variável `message` não seja necessária, adicione o pragma `##NEEDED`:

```ABAP
MESSAGE e001(ad) INTO DATA(message) ##NEEDED.
```

Evite o seguinte:

```ABAP
" anti-padrão
IF 1 = 2. MESSAGE e001(ad). ENDIF.
```

Este é um anti-padrão já que:

- Contém código inalcançável.
- Testa uma condição que nunca pode ser verdadeira para igualdade.

### Códigos de Retorno

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Tratamento de Erros](#tratamento-de-erros) > [Esta seção](#códigos-de-retorno)

#### Prefira exceções a códigos de retorno

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Tratamento de Erros](#tratamento-de-erros) > [Códigos de Retorno](#códigos-de-retorno) > [Esta seção](#prefira-exceções-a-códigos-de-retorno)

```ABAP
METHOD try_this_and_that.
  RAISE EXCEPTION NEW cx_failed( ).
ENDMETHOD.
```

em vez de

```ABAP
" anti-padrão
METHOD try_this_and_that.
  error_occurred = abap_true.
ENDMETHOD.
```

Exceções têm múltiplas vantagens sobre códigos de retorno:

- Exceções mantêm as assinaturas dos seus métodos limpas:
  pode retornar o resultado do método como um parâmetro `RETURNING` e ainda lançar exceções paralelamente.
  Códigos de retorno poluem as suas assinaturas com parâmetros adicionais para tratamento de erros.

- O chamador não tem de reagir a elas imediatamente.
  Ele pode simplesmente escrever o caminho feliz do seu código.
  O `CATCH` de tratamento de exceções pode estar no final do seu método, ou completamente fora.

- Exceções podem fornecer detalhes sobre o erro nos seus atributos e através de métodos.
  Códigos de retorno requerem que conceba uma solução diferente por si mesmo, tal como retornar também um log.

- O ambiente lembra o chamador com erros de sintaxe para lidar com exceções.
  Códigos de retorno podem ser acidentalmente ignorados sem ninguém notar.

#### Não deixe falhas passarem

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Tratamento de Erros](#tratamento-de-erros) > [Códigos de Retorno](#códigos-de-retorno) > [Esta seção](#não-deixe-falhas-passarem)

Se tiver de usar códigos de retorno, por exemplo porque chama Funções e código mais antigo não sob seu controle,
certifique-se de que não deixa falhas passarem.

```ABAP
DATA:
  current_date TYPE string,
  response     TYPE bapiret2.

CALL FUNCTION 'BAPI_GET_CURRENT_DATE'
  IMPORTING
    current_date = current_date
  CHANGING
    response     = response.

IF response-type = 'E'.
  RAISE EXCEPTION NEW /clean/some_error( ).
ENDIF.
```

### Exceções

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Tratamento de Erros](#tratamento-de-erros) > [Esta seção](#exceções)

#### Exceções são para erros, não para casos regulares

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Tratamento de Erros](#tratamento-de-erros) > [Exceções](#exceções) > [Esta seção](#exceções-são-para-erros-não-para-casos-regulares)

```ABAP
" anti-padrão
METHODS entry_exists_in_db
  IMPORTING
    key TYPE char10
  RAISING
    cx_not_found_exception.
```

Se algo é um caso regular e válido, deve ser tratado com parâmetros de resultado regulares.

```ABAP
METHODS entry_exists_in_db
  IMPORTING
    key           TYPE char10
  RETURNING
    VALUE(result) TYPE abap_bool.
```

Exceções devem ser reservadas para casos que não espera e que refletem situações de erro.

```ABAP
METHODS assert_user_input_is_valid
  IMPORTING
    user_input TYPE string
  RAISING
    cx_bad_user_input.
```

O uso indevido de exceções induz o leitor a pensar que algo correu mal, quando na realidade está tudo bem.
Exceções são também muito mais lentas do que código regular porque precisam de ser construídas
e muitas vezes recolhem muita informação de contexto.

#### Use exceções baseadas em classe

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Tratamento de Erros](#tratamento-de-erros) > [Exceções](#exceções) > [Esta seção](#use-exceções-baseadas-em-classe)

```ABAP
TRY.
    get_component_types( ).
  CATCH cx_has_deep_components_error.
ENDTRY.
```

As exceções não baseadas em classe desatualizadas têm as mesmas características que códigos de retorno e não devem ser mais usadas.

```ABAP
" anti-padrão
get_component_types(
  EXCEPTIONS
    has_deep_components = 1
    OTHERS              = 2 ).
```

### Lançamento (Throwing)

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Tratamento de Erros](#tratamento-de-erros) > [Esta seção](#lançamento-throwing)

#### Use as suas próprias super classes

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Tratamento de Erros](#tratamento-de-erros) > [Lançamento (Throwing)](#lançamento-throwing) > [Esta seção](#use-as-suas-próprias-super-classes)

```ABAP
CLASS cx_fra_static_check DEFINITION ABSTRACT INHERITING FROM cx_static_check.
CLASS cx_fra_no_check DEFINITION ABSTRACT INHERITING FROM cx_no_check.
```

Considere criar super classes abstratas para cada tipo de exceção para a sua aplicação,
em vez de sub-classificar as classes de fundação diretamente.
Permite-lhe fazer `CATCH` de todas as _suas_ exceções.
Permite-lhe adicionar funcionalidade comum a todas as exceções, tal como tratamento de texto especial.
`ABSTRACT` previne as pessoas de usar acidentalmente estes erros não descritivos diretamente.

#### Lance um tipo de exceção

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Tratamento de Erros](#tratamento-de-erros) > [Lançamento (Throwing)](#lançamento-throwing) > [Esta seção](#lance-um-tipo-de-exceção)

```ABAP
METHODS generate
  RAISING
    cx_generation_error.
```

Na vasta maioria dos casos, lançar múltiplos tipos de exceções não tem utilidade.
O chamador geralmente não está interessado nem é capaz de distinguir as situações de erro.
Ele irá portanto tipicamente tratá-las todas da mesma maneira -
e se este for o caso, porquê distingui-las em primeiro lugar?

```ABAP
" anti-padrão
METHODS generate
  RAISING
    cx_abap_generation
    cx_hdbr_access_error
    cx_model_read_error.
```

Uma melhor solução para reconhecer diferentes situações de erro é usar um tipo de exceção
mas adicionar sub-classes que permitem - mas não requerem - reagir a situações de erro individuais,
como descrito em [Use sub-classes para permitir aos chamadores distinguir situações de erro](#use-sub-classes-para-permitir-aos-chamadores-distinguir-situações-de-erro).

#### Use sub-classes para permitir aos chamadores distinguir situações de erro

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Tratamento de Erros](#tratamento-de-erros) > [Lançamento (Throwing)](#lançamento-throwing) > [Esta seção](#use-sub-classes-para-permitir-aos-chamadores-distinguir-situações-de-erro)

```ABAP
CLASS cx_bad_generation_variable DEFINITION INHERITING FROM cx_generation_error.
CLASS cx_bad_code_composer_template DEFINITION INHERITING FROM cx_generation_error.

METHODS generate RAISING cx_generation_error.

TRY.
    generator->generate( ).
  CATCH cx_bad_generation_variable.
    log_failure( ).
  CATCH cx_bad_code_composer_template INTO DATA(bad_template_exception).
    show_error_to_user( bad_template_exception ).
  CATCH cx_generation_error INTO DATA(other_exception).
    RAISE EXCEPTION NEW cx_application_error( previous =  other_exception ).
ENDTRY.
```

Se existirem muitas situações de erro diferentes, use códigos de erro em vez disso:

```ABAP
CLASS cx_generation_error DEFINITION ...
  PUBLIC SECTION.
    TYPES error_code_type TYPE i.
    CONSTANTS:
      BEGIN OF error_code_enum,
        bad_generation_variable    TYPE error_code_type VALUE 1,
        bad_code_composer_template TYPE error_code_type VALUE 2,
        ...
      END OF error_code_enum.
    DATA error_code TYPE error_code_type.

TRY.
    generator->generate( ).
  CATCH cx_generation_error INTO DATA(exception).
    CASE exception->error_code.
      WHEN cx_generation_error=>error_code_enum-bad_generation_variable.
      WHEN cx_generation_error=>error_code_enum-bad_code_composer_variable.
      ...
    ENDCASE.
ENDTRY.
```

#### Lance CX_STATIC_CHECK para exceções geríveis

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Tratamento de Erros](#tratamento-de-erros) > [Lançamento (Throwing)](#lançamento-throwing) > [Esta seção](#lance-cx_static_check-para-exceções-geríveis)

Se se pode esperar que uma exceção ocorra e seja razoavelmente tratada pelo recetor,
lance uma exceção verificada herdando de `CX_STATIC_CHECK`: falha na validação de entrada do utilizador,
recurso em falta para o qual existem fallbacks, etc.

```ABAP
CLASS cx_file_not_found DEFINITION INHERITING FROM cx_static_check.

METHODS read_file
  IMPORTING
    file_name_enterd_by_user TYPE string
  RAISING
    cx_file_not_found.
```

Este tipo de exceção _tem_ de ser dado em assinaturas de métodos e _tem_ de ser apanhado ou encaminhado para evitar erros de sintaxe.
É portanto claro de ver para o consumidor e garante que ele(a) não será surpreendido por uma exceção inesperada
e tomará conta de reagir à situação de erro.

> Isto está em sincronia com as [Diretrizes de Programação ABAP](https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abenexception_category_guidl.htm)
> mas contradiz [Robert C. Martin's _Clean Code_],
> que recomenda preferir exceções não verificadas;
> [Exceções](sub-sections/Exceptions.md) explica porquê.

#### Lance CX_NO_CHECK para situações geralmente irrecuperáveis

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Tratamento de Erros](#tratamento-de-erros) > [Lançamento (Throwing)](#lançamento-throwing) > [Esta seção](#lance-cx_no_check-para-situações-geralmente-irrecuperáveis)

Se uma exceção é tão grave que é improvável que o recetor recupere dela, use `CX_NO_CHECK`:
falha ao ler um recurso obrigatório, falha ao resolver a dependência solicitada, etc.

```ABAP
CLASS cx_out_of_memory DEFINITION INHERITING FROM cx_no_check.

METHODS create_guid
  RETURNING
    VALUE(result) TYPE /bobf/conf_key.
```

`CX_NO_CHECK` _não pode_ ser declarado em assinaturas de métodos,
tal que a sua ocorrência virá como uma má surpresa para o consumidor.
No caso de situações irrecuperáveis, isto é aceitável
porque o consumidor não será capaz de fazer nada útil sobre isso de qualquer maneira.

No entanto, _pode_ haver casos onde o consumidor realmente quer reconhecer e reagir a este tipo de falha.
Por exemplo, um gestor de dependências poderia lançar um `CX_NO_CHECK` se for incapaz de fornecer uma implementação
para uma interface solicitada porque o código da aplicação regular não será capaz de continuar.
No entanto, pode haver um relatório de teste que tenta instanciar todo o tipo de coisas apenas para ver se está a funcionar,
e que reportará falha simplesmente como uma entrada vermelha numa lista -
este serviço deve ser capaz de apanhar e ignorar a exceção em vez de ser forçado a dump.

#### Considere CX_DYNAMIC_CHECK para exceções evitáveis

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Tratamento de Erros](#tratamento-de-erros) > [Lançamento (Throwing)](#lançamento-throwing) > [Esta seção](#considere-cx_dynamic_check-para-exceções-evitáveis)

Casos de uso para `CX_DYNAMIC_CHECK` são raros,
e em geral recomendamos recorrer aos outros tipos de exceção.
No entanto, pode querer considerar este tipo de exceção
como um substituto para `CX_STATIC_CHECK` se o chamador tiver controlo total e consciente sobre se uma exceção pode ocorrer.

```ABAP
DATA value TYPE decfloat.
value = '7.13'.
cl_abap_math=>get_db_length_decs(
  EXPORTING
    in     = value
  IMPORTING
    length = DATA(length) ).
```

Por exemplo, considere o método `get_db_length_decs`
da classe `cl_abap_math`, que lhe diz o número de dígitos
e casas decimais de um número decimal de vírgula flutuante.
Este método levanta a exceção dinâmica `cx_parameter_invalid_type`
se o parâmetro de entrada não refletir um número decimal de vírgula flutuante.
Normalmente, este método será chamado
para uma variável completa e estaticamente tipada,
de tal forma que o desenvolvedor sabe
se essa exceção pode alguma vez ocorrer ou não.
Neste caso, a exceção dinâmica permitiria ao chamador
omiti a cláusula `CATCH` desnecessária.

#### Dump para situações totalmente irrecuperáveis

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Tratamento de Erros](#tratamento-de-erros) > [Lançamento (Throwing)](#lançamento-throwing) > [Esta seção](#dump-para-situações-totalmente-irrecuperáveis)

Se uma situação é tão grave que tem a certeza absoluta que é improvável que o recetor recupere dela,
ou que indica claramente um erro de programação, faça dump em vez de lançar uma exceção:
falha ao adquirir memória, falha em leituras de índice numa tabela que tem de estar preenchida, etc.

```ABAP
RAISE SHORTDUMP TYPE cx_sy_create_object_error.  " >= NW 7.53
MESSAGE x666(general).                           " < NW 7.53
```

Este comportamento impedirá qualquer tipo de consumidor de fazer qualquer coisa útil depois.
Use isto apenas se tiver a certeza sobre isso.

#### Prefira RAISE EXCEPTION NEW a RAISE EXCEPTION TYPE

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Tratamento de Erros](#tratamento-de-erros) > [Lançamento (Throwing)](#lançamento-throwing) > [Esta seção](#prefira-raise-exception-new-a-raise-exception-type)

Nota: Disponível a partir de NW 7.52.

```ABAP
RAISE EXCEPTION NEW cx_generation_error( previous = exception ).
```

em geral é mais curto do que o desnecessariamente mais longo

```ABAP
RAISE EXCEPTION TYPE cx_generation_error
  EXPORTING
    previous = exception.
```

No entanto, se fizer uso massivo da adição `MESSAGE`, pode querer manter a variante `TYPE`:

```ABAP
RAISE EXCEPTION TYPE cx_generation_error
  MESSAGE e136(messages)
  EXPORTING
    previous = exception.
```

### Captura (Catching)

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Tratamento de Erros](#tratamento-de-erros) > [Esta seção](#captura-catching)

#### Envolva exceções externas em vez de as deixar invadir o seu código

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Tratamento de Erros](#tratamento-de-erros) > [Captura (Catching)](#captura-catching) > [Esta seção](#envolva-exceções-externas-em-vez-de-as-deixar-invadir-o-seu-código)

```ABAP
METHODS generate RAISING cx_generation_failure.

METHOD generate.
  TRY.
      generator->generate( ).
    CATCH cx_amdp_generation_failure INTO DATA(exception).
      RAISE EXCEPTION NEW cx_generation_failure( previous = exception ).
  ENDTRY.
ENDMETHOD.
```

A [Lei de Demeter](https://pt.wikipedia.org/wiki/Lei_de_Demeter) recomenda desacoplar as coisas.
Encaminhar exceções de outros componentes viola este princípio.
Torne-se independente do código externo capturando essas exceções
e envolvendo-as num tipo de exceção próprio.

```ABAP
" anti-padrão
METHODS generate RAISING cx_sy_gateway_failure.

METHOD generate.
  generator->generate( ).
ENDMETHOD.
```

## Comentários

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Esta seção](#comentários)

### Expresse-se em código, não em comentários

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Comentários](#comentários) > [Esta seção](#expresse-se-em-código-não-em-comentários)

```ABAP
METHOD correct_day_to_last_in_month.
  WHILE is_invalid( date ).
    reduce_day_by_one( CHANGING date = date ).
  ENDWHILE.
ENDMETHOD.

METHOD is_invalid.
  DATA zero_if_invalid TYPE i.
  zero_if_invalid = date.
  result = xsdbool( zero_if_invalid = 0 ).
ENDMETHOD.

METHOD reduce_day_by_one.
  date+6(2) = date+6(2) - 1.
ENDMETHOD.
```

em vez de

```ABAP
" anti-padrão
" correct e.g. 29.02. in non-leap years as well as result of a date calculation would be
" something like e.g. the 31.06. that example has to be corrected to 30.06.
METHOD fix_day_overflow.
  DO 3 TIMES.
    " 31 - 28 = 3 => this correction is required not more than 3 times
    lv_dummy = cv_date.
    " lv_dummy is 0 if the date value is a not existing date - ABAP specific implementation
    IF ( lv_dummy EQ 0 ).
      cv_date+6(2) = cv_date+6(2) - 1. " subtract 1 day from the given date
    ELSE.
      " date exists => no correction required
      EXIT.
    ENDIF.
  ENDDO.
ENDMETHOD.
```

Código Limpo _não_ o proíbe de comentar o seu código - encoraja-o a explorar _melhores_ meios,
e recorrer a comentários apenas se isso falhar.

> Este exemplo foi desafiado de um ponto de vista de desempenho,
> alegando que cortar os métodos tão pequenos piora o desempenho demasiado.
> Medições de amostra mostram que o código refatorado é 2.13 vezes mais lento que a variante suja original.
> A variante limpa leva 9.6 microssegundos para corrigir a entrada `31-02-2018`, a variante suja apenas 4.5 microssegundos.
> Isto pode ser um problema quando o método é executado muito frequentemente numa aplicação de alto desempenho;
> para validação de entrada de utilizador regular, deve ser aceitável.
> Recorra à seção [Tenha em mente o desempenho](#tenha-em-mente-o-desempenho) para lidar com Clean Code e problemas de desempenho.

### Comentários não são desculpa para maus nomes

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Comentários](#comentários) > [Esta seção](#comentários-não-são-desculpa-para-maus-nomes)

```ABAP
DATA(input_has_entries) = has_entries( input ).
```

Melhore os seus nomes em vez de explicar o que eles realmente significam ou por que escolheu maus nomes.

```ABAP
" anti-padrão
" verifica se a tabela input contém entradas
DATA(result) = check_table( input ).
```

### Use métodos em vez de comentários para segmentar o seu código

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Comentários](#comentários) > [Esta seção](#use-métodos-em-vez-de-comentários-para-segmentar-o-seu-código)

```ABAP
DATA(statement) = build_statement( ).
DATA(data) = execute_statement( statement ).
```

Isto não só torna a intenção, estrutura e dependências do código muito mais claras,
como também evita erros de transporte quando variáveis temporárias não são devidamente limpas entre as seções.

```ABAP
" anti-padrão
" -----------------
" Build statement
" -----------------
DATA statement TYPE string.
statement = |SELECT * FROM d_document_roots|.

" -----------------
" Execute statement
" -----------------
DATA(result_set) = adbc->execute_sql_query( statement ).
result_set->next_package( IMPORTING data = data ).
```

### Escreva comentários para explicar o porquê, não o quê

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Comentários](#comentários) > [Esta seção](#escreva-comentários-para-explicar-o-porquê-não-o-quê)

```ABAP
" não pode falhar, existência de >= 1 linha afirmada acima
DATA(first_line) = table[ 1 ].
```

Ninguém precisa de repetir o código em linguagem natural

```ABAP
" anti-padrão
" select alert root from database by key
SELECT * FROM d_alert_root WHERE key = key.
```

### Design vai nos documentos de design, não no código

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Comentários](#comentários) > [Esta seção](#design-vai-nos-documentos-de-design-não-no-código)

```ABAP
" anti-padrão
" Esta classe serve um duplo propósito. Primeiro, faz uma coisa. Depois, faz outra coisa.
" Fá-lo executando muito código que está distribuído pelas classes auxiliares locais.
" Para entender o que está a acontecer, vamos primeiro ponderar a natureza do universo como tal.
" Dê uma olhada nisto e naquilo para obter os detalhes.
```

````
Ninguém lê isso - a sério.
Se as pessoas precisam de ler um livro didático para serem capazes de usar o seu código,
isso pode ser um indicador de que o seu código tem problemas de design graves que deve resolver de outra forma.
Algum código _precisa_ de alguma explicação além de uma única linha de comentário;
considere ligar o documento de design nestes casos.

### Comente com ", não com \*

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Comentários](#comentários) > [Esta seção](#comente-com--não-com-)

Comentários de aspas indentam juntamente com as instruções que comentam

```ABAP
METHOD do_it.
  IF input IS NOT INITIAL.
    " padrão delegate
    output = calculate_result( input ).
  ENDIF.
ENDMETHOD.
````

Comentários com asterisco tendem a indentar para lugares estranhos

```ABAP
" anti-padrão
METHOD do_it.
  IF input IS NOT INITIAL.
* padrão delegate
    output = calculate_result( input ).
  ENDIF.
ENDMETHOD.
```

### Coloque comentários antes da instrução a que se referem

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Comentários](#comentários) > [Esta seção](#coloque-comentários-antes-da-instrução-a-que-se-referem)

```ABAP
" padrão delegate
output = calculate_result( input ).
```

Mais claro do que

```ABAP
" anti-padrão
output = calculate_result( input ).
" padrão delegate
```

E menos invasivo do que

```ABAP
output = calculate_result( input ).  " padrão delegate
```

### Apague código em vez de o comentar

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Comentários](#comentários) > [Esta seção](#apague-código-em-vez-de-o-comentar)

```ABAP
" anti-padrão
* output = calculate_result( input ).
```

Quando encontrar algo como isto, apague-o.
O código obviamente não é necessário porque a sua aplicação funciona e todos os testes estão verdes.
Código apagado pode ser reproduzido a partir do histórico de versões mais tarde.
Se precisar de preservar um pedaço de código permanentemente, copie-o para um arquivo ou um objeto `$TMP` ou `HOME`.

### Não faça versionamento manual

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Comentários](#comentários) > [Esta seção](#não-faça-versionamento-manual)

```ABAP
" anti-padrão
* ticket 800034775 ABC ++ Start
output = calculate_result( input ).
* ticket 800034775 ABC ++ End
```

Comentários de atribuição tendem a poluir o código e não fornecem grandes benefícios já que o versionamento já é feito pela gestão de código fonte. Textos de ordem de transporte são muito mais adequados para descrever porque algo foi adaptado.

### Use FIXME, TODO, e XXX e adicione o seu ID

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Comentários](#comentários) > [Esta seção](#use-fixme-todo-e-xxx-e-adicione-o-seu-id)

```ABAP
METHOD do_something.
  " XXX FH apagar este método - não faz nada
ENDMETHOD.
```

- `FIXME` aponta para erros que são demasiado pequenos ou demasiado em-progresso para incidentes internos.
- `TODO` são lugares onde quer completar algo num futuro próximo(!).
- `XXX` marca código que funciona mas poderia ser melhor.

Quando introduzir tal comentário, adicione a sua alcunha, iniciais, ou utilizador para permitir aos seus co-desenvolvedores contactá-lo
e fazer perguntas se o comentário não for claro.

### Não adicione comentários de assinatura de método e fim-de

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Comentários](#comentários) > [Esta seção](#não-adicione-comentários-de-assinatura-de-método-e-fim-de)

Comentários de assinatura de método não ajudam ninguém.

```ABAP
" anti-padrão
* <SIGNATURE>---------------------------------------------------------------------------------------+
* | Static Public Method CALIBRATION_KPIS=>CALCULATE_KPI
* +-------------------------------------------------------------------------------------------------+
* | [--->] STRATEGY_ID                 TYPE        STRATEGY_ID
* | [--->] THRESHOLD                   TYPE        STRATEGY_THRESHOLD
* | [--->] DETECTION_OBJECT_SCORE      TYPE        T_HIT_RESULT
* | [<---] KPI                         TYPE        T_SIMULATED_KPI
* +--------------------------------------------------------------------------------------</SIGNATURE>
```

Há décadas atrás, quando não se conseguia ver a assinatura do método ao inspecionar o seu código,
ou trabalhando com impressões que tinham dezenas de páginas, estes comentários poderiam ter feito sentido.
Mas todos os IDEs ABAP modernos (SE24, SE80, ADT) mostram a assinatura do método facilmente
de tal forma que estes comentários se tornaram nada mais do que ruído.

> No editor baseado em formulários de SE24/SE80, pressione o botão _Assinatura_.
> No ABAP Development Tools, marque o nome do método e pressione F2
> ou adicione a view _ABAP Element Info_ à sua perspetiva.

Similarmente, comentários de fim-de são supérfluos.
Estes comentários poderiam ter sido úteis há décadas atrás,
quando programas e funções e os IFs aninhados dentro eram centenas de linhas de código de comprimento.
Mas o nosso estilo de codificação moderno produz métodos curtos o suficiente para ver prontamente
a que instrução de abertura um `ENDIF` ou `ENDMETHOD` pertence:

```ABAP
" anti-padrão
METHOD get_kpi_calc.
  IF has_entries = abap_false.
    result = 42.
  ENDIF.  " IF has_entries = abap_false
ENDMETHOD.   " get_kpi_calc
```

### Não duplique textos de mensagem como comentários

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Comentários](#comentários) > [Esta seção](#não-duplique-textos-de-mensagem-como-comentários)

```ABAP
" anti-padrão
" categoria de alerta não preenchida
MESSAGE e003 INTO dummy.
```

Mensagens mudam independentemente do seu código,
e ninguém se lembrará de ajustar o comentário,
de tal forma que ficará desatualizado e até se tornará enganador rapidamente
e sem ninguém notar.

Os IDEs modernos dão-lhe formas fáceis de ver o texto por trás de uma mensagem,
por exemplo no ABAP Development Tools,
marque o ID da mensagem e pressione F2.

Se quiser torná-lo mais explícito,
considere extrair a mensagem para um método próprio.

```ABAP
METHOD create_alert_not_found_message.
  MESSAGE e003 INTO dummy.
ENDMETHOD.
```

### ABAP Doc apenas para APIs públicas

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Comentários](#comentários) > [Esta seção](#abap-doc-apenas-para-apis-públicas)

Escreva ABAP Doc para documentar APIs públicas,
significando APIs que são intencionadas para desenvolvedores
noutras equipas ou aplicações.
Não escreva ABAP Doc para coisas internas.

ABAP Doc sofre das mesmas fraquezas que todos os comentários,
isto é, desatualiza-se rapidamente e então torna-se enganador.
Como consequência, deve empregá-lo apenas onde faz sentido,
não impor a escrita de ABAP Doc para tudo e mais alguma coisa.

> Leia mais em _Chapter 4: Good Comments: Javadocs in Public APIs_ e _Chapter 4: Bad Comments:
> Javadocs in Nonpublic Code_ de [Robert C. Martin's _Clean Code_].

### Prefira pragmas a pseudo competários

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Comentários](#comentários) > [Esta seção](#prefira-pragmas-a-pseudo-competários)

Prefira pragmas a pseudo comentários para suprimir avisos irrelevantes e erros identificados pelo ATC. Pseudo comentários
tornaram-se maioritariamente obsoletos e foram substituídos por pragmas.

```ABAP
" padrão
MESSAGE e001(ad) INTO DATA(message) ##NEEDED.

" anti-padrão
MESSAGE e001(ad) INTO DATA(message). "#EC NEEDED
```

Use o programa `ABAP_SLIN_PRAGMAS` ou tabela `SLIN_DESC` para encontrar o mapeamento entre pseudo comentários obsoletos e os pragmas que
os substituíram.

## Formatação

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Esta seção](#formatação)

As sugestões abaixo são [otimizadas para leitura, não para escrita](#otimize-para-leitura-não-para-escrita).
Como o Formatador ABAP não as cobre, algumas delas produzem trabalho manual adicional para reformatar instruções
quando comprimentos de nomes etc. mudam; se quiser evitar isto, considere abandonar regras como
[Alinhe atribuições ao mesmo objeto, mas não a diferentes](#alinhe-atribuições-ao-mesmo-objeto-mas-não-a-diferentes).

### Seja consistente

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Formatação](#formatação) > [Esta seção](#seja-consistente)

Formate todo o código de um projeto da mesma maneira.
Deixe todos os membros da equipa usar o mesmo estilo de formatação.

Se editar código alheio, adira ao estilo de formatação desse projeto
em vez de insistir no seu estilo pessoal.

Se mudar as suas regras de formatação ao longo do tempo,
use [melhores práticas de refatoração](#como-refatorar-código-legado)
para atualizar o seu código ao longo do tempo.

### Otimize para leitura, não para escrita

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Formatação](#formatação) > [Esta seção](#otimize-para-leitura-não-para-escrita)

Desenvolvedores passam a maior parte do tempo a _ler_ código.
Realmente _escrever_ código ocupa uma porção muito mais pequena do dia.

Como consequência, deve otimizar a sua formatação de código para leitura e depuração, não para escrita.

Por exemplo, deve preferir

```ABAP
DATA:
  a TYPE b,
  c TYPE d,
  e TYPE f.
```

a hacks tais como

```ABAP
" anti-padrão
DATA:
  a TYPE b
  ,c TYPE d
  ,e TYPE f.
```

### Use o Formatador ABAP antes de ativar

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Formatação](#formatação) > [Esta seção](#use-o-formatador-abap-antes-de-ativar)

Aplique o Formatador ABAP - Shift+F1 em SE80, SE24 e ADT - antes de ativar um objeto.
Nota: Formatador ABAP é conhecido como Pretty Printer no SAP GUI.

Se modificar uma base de código legado não formatada maior,
pode querer aplicar o Formatador ABAP apenas a linhas selecionadas
para evitar listas de alterações enormes e dependências de transporte.
Considere formatar o objeto de desenvolvimento completo
num Pedido de Transporte ou Nota separado.

> Leia mais em _Chapter 5: Formatting: Team Rules_ de [Robert C. Martin's _Clean Code_].

### Use as configurações do Formatador ABAP da sua equipa

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Formatação](#formatação) > [Esta seção](#use-as-configurações-do-formatador-abap-da-sua-equipa)

Use sempre as configurações do Formatador ABAP da sua equipa.
Especifique-as em

- Eclipse: Clique com o botão direito no projeto no Explorador de Projetos > _Properties_ > _ABAP Development_ > _Editors_ > _Source Code Editors_ > _ABAP Formatter_
- Eclipse (navegação alternativa): _Menu_ > _Window_ > _Preferences_ > _ABAP Development_ > _Editors_ > _Source Code Editors_ > Clique no link _ABAP Formatter_ no lado direito > Selecione o projeto no pop-up
- SAP GUI: _Menu_ > _Utilities_ > _Settings ..._ > _ABAP Editor_ > _Pretty Printer_.

Defina _Indent_ e _Convert Uppercase/Lowercase_ > _Uppercase Keyword_
conforme acordado na sua equipa.

> [Maiúsculas vs. Minúsculas](sub-sections/UpperVsLowerCase.md) explica
> porque não damos orientação clara para a caixa de tipo de palavras-chave.
>
> Leia mais em _Chapter 5: Formatting: Team Rules_ de [Robert C. Martin's _Clean Code_].

### Não mais de uma instrução por linha

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Formatação](#formatação) > [Esta seção](#não-mais-de-uma-instrução-por-linha)

```ABAP
DATA do_this TYPE i.
do_this = input + 3.
```

Mesmo que algumas ocorrências possam enganá-lo na concepção errada de que isto era legível:

```ABAP
" anti-padrão
DATA do_this TYPE i. do_this = input + 3.
```

### Mantenha um comprimento de linha razoável

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Formatação](#formatação) > [Esta seção](#mantenha-um-comprimento-de-linha-razoável)

Adira a um comprimento máximo de linha de 120 caracteres.

O olho humano lê texto mais confortavelmente se as linhas não forem muito largas -
pergunte a um designer de UI ou investigador de movimento ocular da sua escolha.
Também apreciará o código mais estreito ao depurar ou comparar duas fontes uma ao lado da outra.

O limite de 80 ou mesmo 72 caracteres originário nos dispositivos terminais antigos é um pouco demasiado restritivo.
Enquanto 100 caracteres são frequentemente recomendados e uma escolha viável, 120 caracteres parecem funcionar um pouco melhor para ABAP,
talvez por causa da verbosidade geral da linguagem.

> Como lembrete pode configurar no ADT a margem de impressão para 120 caracteres,
> que depois é visualizada na vista de código como uma linha vertical.
> Configure-o em _Menu_ > _Window_ > _Preferences_ > _General_ > _Editors_ > _Text Editors_.

### Condense o seu código

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Formatação](#formatação) > [Esta seção](#condense-o-seu-código)

```ABAP
DATA(result) = calculate( items ).
```

em vez de adicionar espaços desnecessários

```ABAP
" anti-padrão
DATA(result)        =      calculate(    items =   items )   .
```

### Adicione apenas uma linha em branco para separar coisas, mas não mais

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Formatação](#formatação) > [Esta seção](#adicione-apenas-uma-linha-em-branco-para-separar-coisas-mas-não-mais)

```ABAP
DATA(result) = do_something( ).

DATA(else) = calculate_this( result ).
```

para destacar que as duas instruções fazem coisas diferentes. Mas não há razão para

```ABAP
" anti-padrão
DATA(result) = do_something( ).



DATA(else) = calculate_this( result ).
```

A vontade de adicionar linhas em branco separadoras pode ser um indicador de que o seu método não [faz uma coisa](#faça-uma-coisa-faça-a-bem-faça-a-apenas).

### Não fique obcecado com linhas em branco separadoras

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Formatação](#formatação) > [Esta seção](#não-fique-obcecado-com-linhas-em-branco-separadoras)

```ABAP
METHOD do_something.
  do_this( ).
  then_that( ).
ENDMETHOD.
```

Não há razão para o mau hábito de separar o seu código com linhas em branco

```ABAP
" anti-padrão
METHOD do_something.

  do_this( ).

  then_that( ).

ENDMETHOD.
```

Isto também é o caso dentro de uma instrução, pois isto pode ser facilmente mal interpretado como uma nova instrução ao passar os olhos pelo código.

```abap
" anti-padrão
DATA(result) = merge_structures( a = VALUE #( field_1 = 'X'
                                              field_2 = 'A' )

                                 b = NEW /clean/structure_type( field_3 = 'C'
                                                                field_4 = 'D' ) ).
```

Linhas em branco na realidade só fazem sentido se tiver instruções que abrangem múltiplas linhas

```ABAP
METHOD do_something.

  do_this( ).

  then_that(
    EXPORTING
      variable = 'A'
    IMPORTING
      result   = result ).

ENDMETHOD.
```

### Alinhe atribuições ao mesmo objeto, mas não a diferentes

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Formatação](#formatação) > [Esta seção](#alinhe-atribuições-ao-mesmo-objeto-mas-não-a-diferentes)

Para destacar que estas coisas de alguma forma pertencem juntas

```ABAP
structure-type = 'A'.
structure-id   = '4711'.
```

ou ainda melhor

```ABAP
structure = VALUE #( type = 'A'
                     id   = '4711' ).
```

Mas deixe desalinhadas coisas que não têm nada a ver umas com as outras:

```ABAP
customizing_reader = fra_cust_obj_model_reader=>s_get_instance( ).
hdb_access = fra_hdbr_access=>s_get_instance( ).
```

> Leia mais em _Chapter 5: Formatting: Horizontal Alignment_ de [Robert C. Martin's _Clean Code_].

### Feche parênteses no final da linha

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Formatação](#formatação) > [Esta seção](#feche-parênteses-no-final-da-linha)

```ABAP
modify->update( node           = if_fra_alert_c=>node-item
                key            = item->key
                data           = item
                changed_fields = changed_fields ).
```

em vez do desnecessariamente mais longo

```ABAP
" anti-padrão
modify->update( node           = if_fra_alert_c=>node-item
                key            = item->key
                data           = item
                changed_fields = changed_fields
).
```

### Mantenha chamadas de parâmetro único numa linha

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Formatação](#formatação) > [Esta seção](#mantenha-chamadas-de-parâmetro-único-numa-linha)

```ABAP
DATA(unique_list) = remove_duplicates( list ).
remove_duplicates( CHANGING list = list ).
```

em vez do desnecessariamente mais longo

```ABAP
" anti-padrão
DATA(unique_list) = remove_duplicates(
                           list ).
DATA(unique_list) = remove_duplicates(
                         CHANGING
                           list = list ).
```

### Mantenha parâmetros atrás da chamada

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Formatação](#formatação) > [Esta seção](#mantenha-parâmetros-atrás-da-chamada)

```ABAP
DATA(sum) = add_two_numbers( value_1 = 5
                             value_2 = 6 ).
```

Quando isto torna as linhas muito longas, pode quebrar os parâmetros para a próxima linha:

```ABAP
DATA(sum) = add_two_numbers(
                value_1 = round_up( input DIV 7 ) * 42 + round_down( 19 * step_size )
                value_2 = VALUE #( ( `Cálculo falhou com um resultado muito estranho` ) ) ).
```

### Se quebrar, indente parâmetros sob a chamada

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Formatação](#formatação) > [Esta seção](#se-quebrar-indente-parâmetros-sob-a-chamada)

```ABAP
DATA(sum) = add_two_numbers(
                value_1 = 5
                value_2 = 6 ).
```

Alinhar os parâmetros noutro lugar torna difícil detetar a que pertencem:

```ABAP
" anti-padrão
DATA(sum) = add_two_numbers(
    value_1 = 5
    value_2 = 6 ).
```

No entanto, este é o melhor padrão se quiser evitar que a formatação seja quebrada por uma mudança de comprimento de nome.

### Quebre de linha parâmetros múltiplos

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Formatação](#formatação) > [Esta seção](#quebre-de-linha-parâmetros-múltiplos)

```ABAP
DATA(sum) = add_two_numbers( value_1 = 5
                             value_2 = 6 ).
```

Sim, isto desperdiça espaço.
No entanto, caso contrário, é difícil detetar onde um parâmetro termina e o próximo começa:

```ABAP
" anti-padrão
DATA(sum) = add_two_numbers( value_1 = 5 value_2 = 6 ).
```

### Alinhe parâmetros

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Formatação](#formatação) > [Esta seção](#alinhe-parâmetros)

```ABAP
modify->update( node           = if_fra_alert_c=>node-item
                key            = item->key
                data           = item
                changed_fields = changed_fields ).
```

Margens irregulares tornam difícil ver onde o parâmetro termina e o seu valor começa:

```ABAP
" anti-padrão
modify->update( node = if_fra_alert_c=>node-item
                key = item->key
                data = item
                changed_fields = changed_fields ).
```

> Este é por outro lado o melhor padrão se quiser evitar que a formatação seja quebrada por uma mudança de comprimento de nome.

### Quebre a chamada para uma nova linha se a linha ficar muito longa

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Formatação](#formatação) > [Esta seção](#quebre-a-chamada-para-uma-nova-linha-se-a-linha-ficar-muito-longa)

```ABAP
DATA(some_super_long_param_name) =
  if_some_annoying_interface~add_two_numbers_in_a_long_name(
      value_1 = 5
      value_2 = 6 ).
```

### Indente e alinhe a tabulação

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Formatação](#formatação) > [Esta seção](#indente-e-alinhe-a-tabulação)

Indente palavras-chave de parâmetro por 2 espaços e parâmetros por 4 espaços:

```ABAP
DATA(sum) = add_two_numbers(
              EXPORTING
                value_1 = 5
                value_2 = 6
              CHANGING
                errors  = errors ).
```

Se não tiver palavras-chave, indente os parâmetros por 4 espaços.

```ABAP
DATA(sum) = add_two_numbers(
                value_1 = 5
                value_2 = 6 ).
```

Use a tecla Tab para indentar. É aceitável se isso adicionar mais um espaço do que o necessário.
(Isto acontece se a parte `DATA(sum) =` à esquerda tiver um número ímpar de caracteres.)

### Indente declarações in-line como chamadas de método

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Formatação](#formatação) > [Esta seção](#indente-declarações-in-line-como-chamadas-de-método)

Indente declarações in-line com VALUE ou NEW como se fossem chamadas de método:

```ABAP
DATA(result) = merge_structures( a = VALUE #( field_1 = 'X'
                                              field_2 = 'A' )
                                 b = NEW /clean/structure_type( field_3 = 'C'
                                                                field_4 = 'D' ) ).
```

### Não alinhe cláusulas de tipo

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Formatação](#formatação) > [Esta seção](#não-alinhe-cláusulas-de-tipo)

```ABAP
DATA name TYPE seoclsname.
DATA reader TYPE REF TO /clean/reader.
```

Uma variável e o seu tipo pertencem juntos e devem portanto ser agrupados visualmente em proximidade próxima.
Alinhar as cláusulas `TYPE` desvia a atenção disso e sugere que as variáveis formam um grupo vertical, e os seus tipos outro.
O alinhamento também produz sobrecarga de edição desnecessária, requerendo que ajuste todas as indentações quando o comprimento do nome de variável mais longo muda.

```ABAP
" anti-padrão
DATA name   TYPE seoclsname.
DATA reader TYPE REF TO /clean/reader.
```

### Não encadeie atribuições

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Formatação](#formatação) > [Esta seção](#não-encadeie-atribuições)

```abap
" anti-padrão
var1 = var2 = var3.
```

Atribuições encadeadas geralmente confundem o leitor. Além disso, a declaração inline não funciona em qualquer posição de uma atribuição múltipla.

```abap
var2 = var3.
var1 = var3.
```

Além disso, o anti-padrão parece ambíguo porque `=` é usado para comparações e atribuições em ABAP. Parece similar a como outras linguagens de programação implementam comparações, por exemplo `a = ( b == c )` em JavaScript. [Use `xsdbool` para comparações.](#use-xsdbool-para-definir-variáveis-booleanas)

## Testes

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Esta seção](#testes)

### Princípios

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Esta seção](#princípios)

#### Escreva código testável

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Princípios](#princípios) > [Esta seção](#escreva-código-testável)

Escreva todo o código de uma forma que lhe permita testá-lo de forma automática.

Se isto requer refatorar o seu código, faça-o.
Faça isso primeiro, antes de começar a adicionar outras funcionalidades.

Se adicionar a código legado que é demasiado mal estruturado para ser testado,
refatore-o pelo menos na medida em que possa testar as suas adições.

#### Permita que outros façam mock de si

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Princípios](#princípios) > [Esta seção](#permita-que-outros-façam-mock-de-si)

Se escreve código para ser consumido por outros, permita-lhes escrever testes unitários para o código deles,
por exemplo adicionando interfaces em todos os lugares voltados para fora,
fornecendo test doubles úteis que facilitem testes de integração,
ou aplicando inversão de dependência para lhes permitir substituir a configuração por uma configuração de teste.

#### Regras de legibilidade

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Princípios](#princípios) > [Esta seção](#regras-de-legibilidade)

Torne o seu código de teste ainda mais legível do que o seu código de produção.
Pode lidar com mau código de produção com bons testes, mas se nem sequer tiver os testes, está perdido.

Mantenha o seu código de teste tão simples e estúpido que ainda o entenderá daqui a um ano.

Adira a padrões e normas, para permitir aos seus colegas entrar rapidamente no código.

#### Não faça cópias nem escreva relatórios de teste

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Princípios](#princípios) > [Esta seção](#não-faça-cópias-nem-escreva-relatórios-de-teste)

Não comece a trabalhar num item de backlog fazendo uma cópia `$TMP` de um objeto de desenvolvimento e brincando com ele.
Outros não notarão estes objetos e portanto não saberão o estado do seu trabalho.
Provavelmente desperdiçará muito tempo fazendo a cópia de trabalho em primeiro lugar.
Também se esquecerá de apagar a cópia depois, enviando spam para o seu sistema e dependências.
(Não acredita nisto? Vá ao seu sistema de desenvolvimento e verifique o seu `$TMP` agora mesmo.)

Também, não comece a escrever um relatório de teste que chama algo de uma forma específica,
e repita isso para verificar que as coisas ainda estão a funcionar quando estiver a trabalhar nisso.
Isto é teste de pobre: repetindo um relatório de teste à mão e verificando a olho se tudo ainda está bem.
Dê o próximo passo e automatize este relatório num teste unitário,
com uma asserção automática que lhe diz se o código ainda está ok.
Primeiro, poupará o esforço de ter de escrever os testes unitários depois.
Segundo, poupará muito tempo para as repetições manuais, mais evitar ficar entediado e cansado com isso.

#### Teste públicos, não internos privados

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Princípios](#princípios) > [Esta seção](#teste-públicos-não-internos-privados)

Partes públicas de classes, especialmente as interfaces que implementam, são bastante estáveis e improváveis de mudar.
Deixe os seus testes unitários validar apenas os públicos para torná-los robustos
e minimizar o esforço que tem de gastar quando refatora a classe.
Internos protegidos e privados, em contraste, podem mudar muito rapidamente através de refatoração,
de tal forma que cada refatoração quebraria desnecessariamente os seus testes.

Uma necessidade urgente de testar métodos privados ou protegidos pode ser um sinal de alerta precoce para vários tipos de falhas de design.
Pergunte-se:

- Enterrou acidentalmente um conceito na sua classe que quer sair para a sua própria classe,
  com a sua própria suite dedicada de testes?

- Esqueceu-se de separar a lógica de domínio do código de cola (glue/boilerplate)?
  Por exemplo, implementar a lógica de domínio diretamente na classe que é ligada ao BOPF como uma ação,
  determinação, ou validação, ou que foi gerada pelo SAP Gateway como um provedor de dados `*_DPC_EXT`, pode não ser a melhor ideia.

- As suas interfaces são demasiado complicadas e pedem demasiados dados que são irrelevantes ou que não podem ser mockados facilmente?

#### Não fique obcecado com cobertura

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Princípios](#princípios) > [Esta seção](#não-fique-obcecado-com-cobertura)

Cobertura de código existe para ajudá-lo a encontrar código que se esqueceu de testar, não para atingir algum KPI aleatório:

Não invente testes sem ou com asserções dummy apenas para atingir a cobertura.
Melhor deixar as coisas não testadas para tornar transparente que não pode refatorá-las com segurança.
Pode ter < 100% de cobertura e ainda ter testes perfeitos.
Há casos - tais como IFs no construtor para inserir test doubles -
que podem tornar imprático atingir 100%.
Bons testes tendem a cobrir a mesma instrução múltiplas vezes, para diferentes ramos e condições.
Terão de facto uma cobertura imaginária > 100%.

### Test Classes (Classes de Teste)

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Esta seção](#test-classes-classes-de-teste)

#### Chame classes de teste locais pelo seu propósito

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Test Classes (Classes de Teste)](#test-classes-classes-de-teste) > [Esta seção](#chame-classes-de-teste-locais-pelo-seu-propósito)

Nomeie classes de teste locais ou pela parte "quando" da história

```ABAP
CLASS ltc_<public method name> DEFINITION FOR TESTING ... ."
```

ou a parte "dado que" da história

```ABAP
CLASS ltc_<common setup semantics> DEFINITION FOR TESTING ... .
```

```ABAP
" anti-padrões
CLASS ltc_fra_online_detection_api DEFINITION FOR TESTING ... . " Nós sabemos que essa é a classe sob teste - porquê repeti-la?
CLASS ltc_test DEFINITION FOR TESTING ....                      " Claro que é um teste, o que mais haveria de ser?
```

#### Coloque testes em classes locais

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Test Classes (Classes de Teste)](#test-classes-classes-de-teste) > [Esta seção](#coloque-testes-em-classes-locais)

Coloque testes unitários no include de teste local da classe sob teste.
Isto garante que as pessoas encontram estes testes ao refatorar a classe
e permite-lhes executar todos os testes associados com um único pressionar de tecla,
como descrito em [Como executar classes de teste](#como-executar-classes-de-teste).

Coloque testes de componente, integração e sistema no include de teste local de uma classe global separada.
Eles não se relacionam diretamente a uma única classe sob teste, portanto não devem ser arbitrariamente
colocados numa das classes envolvidas, mas numa separada.
Marque essa classe de teste global como `FOR TESTING` e `ABSTRACT`
para evitar que seja acidentalmente referenciada em código de produção.
Colocar testes noutras classes tem o perigo de que as pessoas os ignorem
e se esqueçam de executá-los ao refatorar as classes envolvidas.

Portanto é benéfico usar _relações de teste_ para documentar que objetos
são testados pelo teste.
Com o exemplo abaixo a classe de teste `hiring_test`
poderia ser executada enquanto se está na classe `recruting` ou `candidate` via o atalho `Shift-Crtl-F12` (Windows) ou `Cmd-Shift-F12` (macOS).

```abap
"! @testing recruting
"! @testing candidate
class hiring_test definition
  for testing risk level dangerous duration medium
  abstract.
  ...
endclass.
```

#### Coloque métodos de ajuda em classes de ajuda

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Test Classes (Classes de Teste)](#test-classes-classes-de-teste) > [Esta seção](#coloque-métodos-de-ajuda-em-classes-de-ajuda)

Coloque métodos de ajuda usados por várias classes de teste numa classe de ajuda. Torne os métodos de ajuda disponíveis através de
herança (relação é-um) ou delegação (relação tem-um).

```abap
" exemplo de herança

CLASS lth_unit_tests DEFINITION ABSTRACT.

  PROTECTED SECTION.
    CLASS-METHODS assert_activity_entity
      IMPORTING
        actual_activity_entity TYPE REF TO zcl_activity_entity
        expected_activity_entity TYPE REF TO zcl_activity_entity.
    ...
ENDCLASS.

CLASS lth_unit_tests IMPLEMENTATION.

  METHOD assert_activity_entity.
    ...
  ENDMETHOD.

ENDCLASS.

CLASS ltc_unit_tests DEFINITION INHERITING FROM lth_unit_tests FINAL FOR TESTING
  DURATION SHORT
  RISK LEVEL HARMLESS.
  ...
ENDCLASS.
```

#### Como executar classes de teste

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Test Classes (Classes de Teste)](#test-classes-classes-de-teste) > [Esta seção](#como-executar-classes-de-teste)

No ABAP Development Tools use os seguintes atalhos de teclado para executar testes rapidamente:
| Teclas | Efeito |
| :--- | :--- |
| `Ctrl`+`Shift`+`F9` | pré-visualizar todos os testes (incluindo relações de teste) |
| `Ctrl`+`Shift`+`F10` | correr todos os testes numa classe |
| `Ctrl`+`Shift`+`F11` | ... e incluir medidas de cobertura |
| `Ctrl`+`Shift`+`F12` | ... e também correr testes noutras classes que são mantidas como relações de teste |

> No macOS, use `Cmd` em vez de `Ctrl`.

### Code Under Test (Código Sob Teste)

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Esta seção](#code-under-test-código-sob-teste)

#### Nomeie o código sob teste significativamente, ou cut por defeito

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Code Under Test (Código Sob Teste)](#code-under-test-código-sob-teste) > [Esta seção](#nomeie-o-código-sob-teste-significativamente-ou-cut-por-defeito)

Dê à variável que representa o código sob teste um nome significativo:

```ABAP
DATA blog_post TYPE REF TO ...
```

Não repita apenas o nome da classe com todos os seus namespaces e prefixos sem valor:

```ABAP
" anti-padrão
DATA clean_fra_blog_post TYPE REF TO ...
```

Se tiver diferentes configurações de teste, pode ser útil descrever o estado variável do objeto:

```ABAP
DATA empty_blog_post TYPE REF TO ...
DATA simple_blog_post TYPE REF TO ...
DATA very_long_blog_post TYPE REF TO ...
```

Se tiver problemas em encontrar um nome significativo, recorra a `cut` como padrão.
A abreviação significa "code under test" (código sob teste).

```ABAP
DATA cut TYPE REF TO ...
```

Especialmente em testes não limpos e confusos, chamar a variável `cut`
pode ajudar temporariamente o leitor a ver o que está realmente a ser testado.
No entanto, arrumar os testes é o caminho real para o longo prazo.

#### Teste contra interfaces, não implementações

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Code Under Test (Código Sob Teste)](#code-under-test-código-sob-teste) > [Esta seção](#teste-contra-interfaces-não-implementações)

Uma consequência prática de [_Teste públicos, não internos privados_](#teste-públicos-não-internos-privados),
tipe o seu código sob teste com uma _interface_

```ABAP
DATA code_under_test TYPE REF TO some_interface.
```

em vez de uma _classe_

```ABAP
" anti-padrão
DATA code_under_test TYPE REF TO some_class.
```

#### Extraia a chamada ao código sob teste para o seu próprio método

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Code Under Test (Código Sob Teste)](#code-under-test-código-sob-teste) > [Esta seção](#extraia-a-chamada-ao-código-sob-teste-para-o-seu-próprio-método)

Se o método a ser testado requer muitos parâmetros ou dados preparados,
pode ajudar extrair a chamada a ele para um método auxiliar próprio que define por defeito os parâmetros desinteressantes:

```ABAP
METHODS map_xml_to_itab
  IMPORTING
    xml_string TYPE string
    config     TYPE /clean/xml2itab_config DEFAULT default_config
    format     TYPE /clean/xml2itab_format DEFAULT default_format.

METHOD map_xml_to_itab.
  result = cut->map_xml_to_itab( xml_string = xml_string
                                 config     = config
                                 format     = format ).
ENDMETHOD.

DATA(itab) = map_xml_to_itab( '<xml></xml>' ).
```

Chamar o método original diretamente pode inundar o seu teste com muitos detalhes sem sentido:

```ABAP
" anti-padrão
DATA(itab) = cut->map_xml_to_itab( xml_string = '<xml></xml>'
                                   config     = VALUE #( 'material irrelevante' )
                                   format     = VALUE #( 'mais material irrelevante' ) ).
```

### Injeção

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Esta seção](#injeção)

#### Use inversão de dependência para injetar test doubles

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Injeção](#injeção) > [Esta seção](#use-inversão-de-dependência-para-injetar-test-doubles)

Inversão de dependência significa que entrega todas as dependências ao construtor:

```ABAP
METHODS constructor
  IMPORTING
    customizing_reader TYPE REF TO if_fra_cust_obj_model_reader.

METHOD constructor.
  me->customizing_reader = customizing_reader.
ENDMETHOD.
```

Não use injeção por setter.
Isso permite usar o código de produção de formas que não são intencionadas:

```ABAP
" anti-padrão
METHODS set_customizing_reader
  IMPORTING
    customizing_reader TYPE REF TO if_fra_cust_obj_model_reader.

METHOD do_something.
  object->set_customizing_reader( a ).
  object->set_customizing_reader( b ). " esperaria que alguém fizesse isto?
ENDMETHOD.
```

Não use injeção por FRIENDS (AMIGOS).
Isso inicializará dependências antes de serem substituídas, com consequências provavelmente inesperadas.
Quebrará assim que renomear os internos.
Também contorna inicializações no construtor.

```ABAP
" anti-padrão
METHOD setup.
  cut = NEW fra_my_class( ). " <- constrói o customizing_reader para o caso de uso de produção primeiro - o que quebrará com isso?
  cut->customizing_reader ?= cl_abap_testdouble=>create( 'if_fra_cust_obj_model_reader' ).
ENDMETHOD.

METHOD constructor.
  customizing_reader = fra_cust_obj_model_reader=>s_get_instance( ).
  customizing_reader->fill_buffer( ). " <- não será chamado no seu test double, portanto sem hipótese de testar isto
ENDMETHOD.
```

#### Considere usar a ferramenta ABAP test double

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Injeção](#injeção) > [Esta seção](#considere-usar-a-ferramenta-abap-test-double)

```ABAP
DATA(customizing_reader) = CAST /clean/customizing_reader( cl_abap_testdouble=>create( '/clean/default_custom_reader' ) ).
cl_abap_testdouble=>configure_call( customizing_reader )->returning( sub_claim_customizing ).
customizing_reader->read( 'SOME_ID' ).
```

Mais curto e fácil de entender do que test doubles personalizados:

```ABAP
" anti-padrão
CLASS /dirty/default_custom_reader DEFINITION FOR TESTING CREATE PUBLIC.
  PUBLIC SECTION.
    INTERFACES /dirty/customizing_reader.
    DATA customizing TYPE /dirty/customizing_table.
ENDCLASS.

CLASS /dirty/default_custom_reader IMPLEMENTATION.
  METHOD /dirty/customizing_reader~read.
    result = customizing.
  ENDMETHOD.
ENDCLASS.

METHOD test_something.
  DATA(customizing_reader) = NEW /dirty/customizing_reader( ).
  customizing_reader->customizing = sub_claim_customizing.
ENDMETHOD.
```

#### Explore as ferramentas de teste

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Injeção](#injeção) > [Esta seção](#explore-as-ferramentas-de-teste)

Em geral, um estilo de programação limpo permitir-lhe-á fazer muito do trabalho com testes unitários ABAP padrão e test doubles.
Uma lista dos frameworks disponíveis com exemplos pode ser encontrada [neste repositório](https://github.com/SAP-samples/abap-test-isolation-examples).
O repositório pode não ser completamente conforme com o guia de estilo Clean ABAP, apenas fornece exemplos para ajudar com ferramentas de isolamento de teste.

#### Use test seams como solução temporária

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Injeção](#injeção) > [Esta seção](#use-test-seams-como-solução-temporária)

Se todas as outras técnicas falharem, ou quando em águas rasas perigosas de código legado,
recorra a [test seams](https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/index.htm?file=abaptest-seam.htm)
para tornar as coisas testáveis.

Embora pareçam confortáveis à primeira vista, test seams são invasivos e tendem a emaranhar-se
em dependências privadas, de tal forma que são difíceis de manter vivos e estáveis a longo prazo.

Recomendamos portanto recorrer a test seams apenas como uma solução temporária
para lhe permitir refatorar o código para uma forma mais testável.

#### Use LOCAL FRIENDS para aceder ao construtor de injeção de dependência

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Injeção](#injeção) > [Esta seção](#use-local-friends-para-aceder-ao-construtor-de-injeção-de-dependência)

```ABAP
CLASS /clean/unit_tests DEFINITION.
  PRIVATE SECTION.
    DATA cut TYPE REF TO /clean/interface_under_test.
    METHODS setup.
ENDCLASS.

CLASS /clean/class_under_test DEFINITION LOCAL FRIENDS unit_tests.

CLASS unit_tests IMPLEMENTATION.
  METHOD setup.
    DATA(mock) = cl_abap_testdouble=>create( '/clean/some_mock' ).
    " /clean/class_under_test é CREATE PRIVATE
     " então isto só funciona por causa do LOCAL FRIENDS
    cut = NEW /clean/class_under_test( mock ).
  ENDMETHOD.
ENDCLASS.
```

#### Não use mal LOCAL FRIENDS para invadir o código testado

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Injeção](#injeção) > [Esta seção](#não-use-mal-local-friends-para-invadir-o-código-testado)

Testes unitários que acedem a membros privados e protegidos para inserir dados mock são frágeis:
quebram quando a estrutura interna do código testado muda.

```ABAP
" anti-padrão
CLASS /dirty/class_under_test DEFINITION LOCAL FRIENDS unit_tests.
CLASS unit_tests IMPLEMENTATION.
  METHOD returns_right_result.
    cut->some_private_member = 'AUNIT_DUMMY'.
  ENDMETHOD.
ENDCLASS.
```

#### Não adicione funcionalidades ao código de produção que servem apenas para testes automatizados

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Injeção](#injeção) > [Esta seção](#não-adicione-funcionalidades-ao-código-de-produção-que-servem-apenas-para-testes-automatizados)

Por razões já descritas em [Use test seams como solução temporária](#use-test-seams-como-solução-temporária), adicionar qualquer coisa ao código de produção que é unicamente intencionado para uso durante testes automatizados deve ser evitado.

```ABAP
" anti-padrão
IF is_unit_test_running = abap_true.
  " alguma lógica aqui que corre apenas durante testes unitários
ENDIF.
```

Note que funcionalidades de teste intencionadas para serem executadas por um utilizador final, e.g. lançamento simulado ou execução de um relatório em modo de teste, formam parte do domínio da aplicação e permanecem um caso de uso válido.

#### Não sub-classifique para fazer mock de métodos

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Injeção](#injeção) > [Esta seção](#não-sub-classifique-para-fazer-mock-de-métodos)

Não sub-classifique e sobrescreva métodos para fazer mock deles nos seus testes unitários.
Embora isso funcione, é frágil porque os testes quebram facilmente ao refatorar o código.
Também permite que consumidores reais herdem a sua classe,
o que [pode apanhá-lo desprevenido quando não desenhar explicitamente para isso](#seja-final-se-não-desenhado-para-herança).

```ABAP
" anti-padrão
CLASS unit_tests DEFINITION INHERITING FROM /dirty/real_class FOR TESTING [...].
  PROTECTED SECTION.
    METHODS needs_to_be_mocked REDEFINITION.
```

Para colocar código legado sob teste,
[recorra a test seams em vez disso](#use-test-seams-como-solução-temporária).
Eles são tão frágeis quanto mas ainda assim a forma mais limpa porque pelo menos não mudam o comportamento da classe em produção,
como aconteceria ao permitir herança removendo uma flag `FINAL` anterior ou mudando o escopo do método de `PRIVATE` para `PROTECTED`.

Ao escrever código novo, leve este problema de testabilidade em conta diretamente ao desenhar a classe,
e encontre uma forma diferente e melhor.
Melhores práticas comuns incluem [recorrer a outras ferramentas de teste](#explore-as-ferramentas-de-teste)
e extrair o método problemático para uma classe separada com a sua própria interface.

#### Não faça mock de coisas que não são necessárias

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Injeção](#injeção) > [Esta seção](#não-faça-mock-de-coisas-que-não-são-necessárias)

```ABAP
cut = NEW /clean/class_under_test( db_reader = db_reader
                                   config    = VALUE #( )
                                   writer    = VALUE #( ) ).
```

Defina os seus givens (dados) tão precisamente quanto possível: não defina dados que o seu teste não precisa,
e não faça mock de objetos que nunca são chamados.
Estas coisas distraem o leitor do que está realmente a acontecer.

```ABAP
" anti-padrão
cut = NEW /dirty/class_under_test( db_reader = db_reader
                                   config    = config
                                   writer    = writer ).
```

Há também casos onde não é necessário fazer qualquer mock -
isto é usualmente o caso com estruturas de dados e contentores de dados.
Por exemplo, os seus testes unitários podem muito bem funcionar com a versão de produção de um `transient_log`
porque apenas armazena dados sem quaisquer efeitos secundários.

#### Não construa frameworks de teste

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Injeção](#injeção) > [Esta seção](#não-construa-frameworks-de-teste)

Testes unitários - em contraste com testes de integração - devem ser dados-em-dados-fora, com todos os dados de teste sendo definidos na hora conforme necessário.

```ABAP
cl_abap_testdouble=>configure_call( test_double )->returning( data ).
```

Não comece a construir frameworks que distinguem "_IDs de casos de teste_" para decidir que dados fornecer.
O código resultante será tão longo e emaranhado que não será capaz de manter estes testes vivos a longo prazo.

```ABAP
" anti-padrão
test_double->set_test_case( 1 ).

CASE test_case.
  WHEN 1.
  WHEN 2.
ENDCASE.
```

### Test Methods (Métodos de Teste)

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Esta seção](#test-methods-métodos-de-teste)

#### Nomes de métodos de teste: reflita o que é dado e esperado

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Test Methods (Métodos de Teste)](#test-methods-métodos-de-teste) > [Esta seção](#nomes-de-métodos-de-teste-reflita-o-que-é-dado-e-esperado)

Bons nomes refletem o dado e o então do teste:

```ABAP
METHOD reads_existing_entry.
METHOD throws_on_invalid_key.
METHOD detects_invalid_input.
```

Maus nomes refletem o quando, repetem factos sem sentido, ou são crípticos:

```ABAP
" anti-padrões

" O que é esperado, sucesso ou falha?
METHOD get_conversion_exits.

" É um método de teste, o que mais haveria de fazer senão "testar"?
METHOD test_loop.

" Então é parametrizado, mas qual é o seu objetivo?
METHOD parameterized_test.

" O que é suposto "_wo_w" significar e ainda se lembrará disso daqui a um ano?
METHOD get_attributes_wo_w.
```

Como o ABAP permite apenas 30 caracteres em nomes de métodos, é justo adicionar um comentário explicativo
se o nome for demasiado curto para transmitir significado suficiente.
ABAP Doc ou a primeira linha no método de teste pode ser uma escolha apropriada para o comentário.

Ter muitos métodos de teste cujos nomes são demasiado longos pode ser um indicador
de que deve dividir a sua classe de teste única em várias
e expressar as diferenças nos dados no nome da classe.

#### Use dado-que-quando-então

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Test Methods (Métodos de Teste)](#test-methods-métodos-de-teste) > [Esta seção](#use-dado-que-quando-então)

Organize o seu código de teste ao longo do paradigma dado-que-quando-então (Given-When-Then):
Primeiro, inicialize coisas numa seção dado ("given"),
segundo chame a coisa realmente testada ("when"),
terceiro valide o resultado ("then").

Se as seções dado ou então ficarem tão longas
que não consegue separar visualmente as três seções mais, extraia sub-métodos.
Linhas em branco ou comentários como separadores podem parecer bem à primeira vista
mas não reduzem realmente a desordem visual.
Ainda assim são úteis para o leitor e o escritor de testes novato separarem as seções.

#### "Quando" é exatamente uma chamada

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Test Methods (Métodos de Teste)](#test-methods-métodos-de-teste) > [Esta seção](#quando-é-exatamente-uma-chamada)

Certifique-se de que a seção "quando" do seu método de teste contém exatamente uma chamada à classe sob teste:

```ABAP
METHOD rejects_invalid_input.
  " quando
  DATA(is_valid) = cut->is_valid_input( 'SOME_RANDOM_ENTRY' ).
  " então
  cl_abap_unit_assert=>assert_false( is_valid ).
ENDMETHOD.
```

Chamar múltiplas coisas indica que o método não tem foco claro e testa demasiado.
Isto torna mais difícil encontrar a causa quando o teste falha:
foi a primeira, segunda, ou terceira chamada que causou a falha?
Também confunde o leitor porque ele não tem certeza qual é a funcionalidade exata sob teste.

#### Não adicione um TEARDOWN a menos que realmente precise

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Test Methods (Métodos de Teste)](#test-methods-métodos-de-teste) > [Esta seção](#não-adicione-um-teardown-a-menos-que-realmente-precise)

Métodos `teardown` são usualmente necessários apenas para limpar entradas de base de dados
ou outros recursos externos em testes de integração.

Reiniciar membros da classe de teste, esp. `cut` e os test doubles usados, é supérfluo;
eles são sobrescritos pelo método `setup` antes do próximo método de teste ser iniciado.

### Test Data (Dados de Teste)

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Esta seção](#test-data-dados-de-teste)

#### Torne fácil detetar significado

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Test Data (Dados de Teste)](#test-data-dados-de-teste) > [Esta seção](#torne-fácil-detetar-significado)

Em testes unitários, quer ser capaz de dizer rapidamente que dados e doubles são importantes,
e quais estão lá apenas para impedir o código de falhar.
Apoie isto dando às coisas que não têm significado nomes e valores óbvios, por exemplo:

```ABAP
DATA(alert_id) = '42'.                             " números sem significado bem conhecidos
DATA(detection_object_type) = '?=/"&'.             " 'acidentes de teclado'
CONSTANTS some_random_number TYPE i VALUE 782346.  " nomes de variáveis reveladores
```

Não engane as pessoas fazendo-as acreditar que algo se conecta a objetos reais ou customizing real se não o faz:

```ABAP
" anti-padrão
DATA(alert_id) = '00000001223678871'.        " este alerta realmente existe
DATA(detection_object_type) = 'FRA_SCLAIM'.  " este tipo de objeto de deteção, também
CONSTANTS memory_limit TYPE i VALUE 4096.    " este número parece escolhido cuidadosamente
```

#### Torne fácil detetar diferenças

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Test Data (Dados de Teste)](#test-data-dados-de-teste) > [Esta seção](#torne-fácil-detetar-diferenças)

```ABAP
exp_parameter_in = VALUE #( ( parameter_name = '45678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789END1' )
                            ( parameter_name = '45678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789END2' ) ).
```

Não force os leitores a comparar longas strings sem significado para detetar pequenas diferenças.

#### Use constantes para descrever propósito e importância de dados de teste

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Test Data (Dados de Teste)](#test-data-dados-de-teste) > [Esta seção](#use-constantes-para-descrever-propósito-e-importância-de-dados-de-teste)

```ABAP
CONSTANTS some_nonsense_key TYPE char8 VALUE 'ABCDEFGH'.

METHOD throws_on_invalid_entry.
  TRY.
      " quando
      cut->read_entry( some_nonsense_key ).
      cl_abap_unit_assert=>fail( ).
    CATCH /clean/customizing_reader_error.
      " então
  ENDTRY.
ENDMETHOD.
```

### Asserções

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Esta seção](#asserções)

#### Poucas asserções focadas

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Asserções](#asserções) > [Esta seção](#poucas-asserções-focadas)

Faça asserção apenas sobre exatamente o que o método de teste é, e isto com um pequeno número de asserções.

```ABAP
METHOD rejects_invalid_input.
  " quando
  DATA(is_valid) = cut->is_valid_input( 'SOME_RANDOM_ENTRY' ).
  " então
  cl_abap_unit_assert=>assert_false( is_valid ).
ENDMETHOD.
```

Fazer demasiadas asserções é um indicador de que o método não tem foco claro.
Isto acopla código de produção e de teste em demasiados lugares: mudar uma funcionalidade
exigirá reescrever um grande número de testes embora não estejam realmente envolvidos com a funcionalidade mudada.
Também confunde o leitor com uma grande variedade de asserções,
obscurecendo a única asserção importante e distintiva entre elas.

```ABAP
" anti-padrão
METHOD rejects_invalid_input.
  " quando
  DATA(is_valid) = cut->is_valid_input( 'SOME_RANDOM_ENTRY' ).
  " então
  cl_abap_unit_assert=>assert_false( is_valid ).
  cl_abap_unit_assert=>assert_not_initial( log->get_messages( ) ).
  cl_abap_unit_assert=>assert_equals( act = sy-langu
                                      exp = 'E' ).
ENDMETHOD.
```

#### Use o tipo de asserção correto

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Asserções](#asserções) > [Esta seção](#use-o-tipo-de-asserção-correto)

```ABAP
cl_abap_unit_assert=>assert_equals( act = table
                                    exp = test_data ).
```

Asserções fazem frequentemente mais do que parece, por exemplo `assert_equals`
inclui correspondência de tipos e fornecer descrições precisas se os valores diferirem.
Usar as asserções erradas, demasiado comuns, forçá-lo-á para o depurador imediatamente
em vez de lhe permitir ver o que está errado logo a partir da mensagem de erro.

```ABAP
" anti-padrão
cl_abap_unit_assert=>assert_true( xsdbool( act = exp ) ).
```

#### Faça asserção de conteúdo, não quantidade

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Asserções](#asserções) > [Esta seção](#faça-asserção-de-conteúdo-não-quantidade)

```ABAP
assert_contains_exactly( actual   = table
                         expected = VALUE string_table( ( `ABC` ) ( `DEF` ) ( `GHI` ) ) ).
```

Não escreva asserções de quantidade de número mágico se puder expressar o conteúdo real que espera.
Números podem variar embora as expectativas ainda sejam cumpridas.
Ao contrário, os números podem coincidir embora o conteúdo seja algo completamente inesperado.

```ABAP
" anti-padrão
assert_equals( act = lines( log_messages )
               exp = 3 ).
```

#### Faça asserção da qualidade, não do conteúdo

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Asserções](#asserções) > [Esta seção](#faça-asserção-da-qualidade-não-do-conteúdo)

Se está interessado numa meta qualidade do resultado,
mas não no conteúdo real em si, expresse isso com uma asserção adequada:

```ABAP
assert_all_lines_shorter_than( actual_lines        = table
                               expected_max_length = 80 ).
```

Fazer asserção do conteúdo preciso obscurece o que realmente quer testar.
É também frágil porque refatoração pode produzir um resultado diferente
mas perfeitamente aceitável, embora quebre todos os seus testes unitários demasiado precisos.

```ABAP
" anti-padrão
assert_equals( act = table
               exp = VALUE string_table( ( `ABC` ) ( `DEF` ) ( `GHI` ) ) ).
```

#### Use FAIL para verificar exceções esperadas

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Asserções](#asserções) > [Esta seção](#use-fail-para-verificar-exceções-esperadas)

```ABAP
METHOD throws_on_empty_input.
  TRY.
      " quando
      cut->do_something( '' ).
      cl_abap_unit_assert=>fail( ).
    CATCH /clean/some_exception.
      " então
  ENDTRY.
ENDMETHOD.
```

#### Encaminhe exceções inesperadas em vez de capturar e falhar

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Asserções](#asserções) > [Esta seção](#encaminhe-exceções-inesperadas-em-vez-de-capturar-e-falhar)

```ABAP
METHODS reads_entry FOR TESTING RAISING /clean/some_exception.

METHOD reads_entry.
  "quando
  DATA(entry) = cut->read_something( ).
  "então
  cl_abap_unit_assert=>assert_not_initial( entry ).
ENDMETHOD.
```

O seu código de teste permanece focado no caminho feliz e é portanto muito mais fácil de ler e entender, em comparação com:

```ABAP
" anti-padrão
METHOD reads_entry.
  TRY.
      DATA(entry) = cut->read_something( ).
    CATCH /clean/some_exception INTO DATA(unexpected_exception).
      cl_abap_unit_assert=>fail( unexpected_exception->get_text( ) ).
  ENDTRY.
  cl_abap_unit_assert=>assert_not_initial( entry ).
ENDMETHOD.
```

#### Escreva asserções personalizadas para encurtar código e evitar duplicação

> [Clean ABAP](#clean-abap) > [Conteúdo](#conteúdo) > [Testes](#testes) > [Asserções](#asserções) > [Esta seção](#escreva-asserções-personalizadas-para-encurtar-código-e-evitar-duplicação)

```ABAP
METHODS assert_contains
  IMPORTING
    actual_entries TYPE STANDARD TABLE OF entries_tab
    expected_key   TYPE key_structure.

METHOD assert_contains.
  TRY.
      actual_entries[ key = expected_key ].
    CATCH cx_sy_itab_line_not_found.
      cl_abap_unit_assert=>fail( |Couldn't find the key { expected_key }| ).
  ENDTRY.
ENDMETHOD.
```

# Guia de Padrões de Desenvolvimento: ABAP Clássico

Este documento detalha as normas de nomenclatura, boas práticas e fluxos para o desenvolvimento em ABAP Clássico no ambiente da Segurança Social.

## 1. Fluxo de Desenvolvimento

Todo desenvolvimento deve seguir rigorosamente as etapas abaixo:

- **Especificação Funcional**: Serve como base obrigatória para qualquer codificação.
- **Codificação**: Deve respeitar os padrões de nomenclatura e performance definidos.
- **Testes Unitários**: Baseados nos cenários da especificação funcional, validando resultados esperados e variantes.
- **Especificação Técnica**: Criada após o desenvolvimento e testes, incluindo o detalhamento técnico e evidências dos testes unitários.

## 2. Regras de Nomenclatura (Dicionário e Workbench)

O idioma padrão para criação de objetos e descrições é o **Português (PT)**. Objetos locais devem obrigatoriamente usar o prefixo `Y`.

### 2.1. Objetos de Programação

| Objeto           | Padrão                             | Exemplo/Notas                                                         |
| :--------------- | :--------------------------------- | :-------------------------------------------------------------------- |
| Programa         | `Z[MD][Tipo]_[Descrição]`          | Tipo: `C` (Carga), `I` (Interface), `F` (Formulário), `R` (Relatório) |
| Include          | `Z[MD][Tipo]_[Descrição]_[Sufixo]` | Sufixos: `TOP`, `PBO`, `PAI`, `F01`, `F02`                            |
| Grupo de Funções | `Z[MD]FG_[Descrição]`              | Descrição abreviada                                                   |
| Módulo de Função | `Z[MD]FM_[Descrição]`              |                                                                       |
| Transação        | `Z[MD][PR][Seq]`                   | `[MD]` Módulo / `[PR]` Processo                                       |

### 2.2. Objetos de Dicionário (SE11)

| Objeto              | Padrão                             |
| :------------------ | :--------------------------------- |
| Tabela Transparente | `Z[MD]T_[Descrição]`               |
| Estrutura           | `Z[MD]ES_[Descrição]`              |
| Categoria de Tabela | `Z[MD]TT_[Descrição]`              |
| Visão / Cluster     | `Z[MD]V_[Desc]` / `Z[MD]VW_[Desc]` |
| Elemento de Dados   | `Z[MD]EL_[Descrição]`              |
| Domínio             | `Z[MD]DM_[Descrição]`              |
| Search Help         | `Z[MD]SH_[Descrição]`              |
| Classe              | `Z[MD]CL_[Descrição]`              |
| Interface           | `Z[MD]IF_[Descrição]`              |

## 3. Convenção de Variáveis e Prefixos Internos

Utilizar os prefixos abaixo para garantir a legibilidade do código fonte:

- **Globais**: `GV_` (Variável), `GT_` (Tabela), `GS_` (Estrutura), `GC_` (Constante).
- **Locais**: `LV_` (Variável), `LT_` (Tabela), `LS_` (Estrutura), `LR_` (Range).
- **Parâmetros de FORM**: `UV_`/`US_` (Using), `CV_`/`CS_` (Changing).
- **Field-Symbols**: `<FS_...>`

## 4. Regras de Ouro e Comandos a Evitar

- **Hard Code**: Proibido o uso de valores fixos no código. Utilize constantes ou Text Elements (Exceção: SHDB).
- **Modificações Standard**: Nunca utilize `INSERT`, `UPDATE` ou `DELETE` em tabelas SAP. Utilize BAPIs ou funções padrão.
- **Controle de Acesso**: Não validar por `SY-UNAME` ou `SY-TCODE`. Utilize Objetos de Autorização (`SU21`).
- **Qualidade de Código**:
  - Executar **Pretty Printer** e **ABAP Cleaner** antes da entrega.
  - É obrigatória a validação pelo **ABAP Test Cockpit (ATC)** com a variante `ZSEGSOCIAL`. Erros de performance ou sintaxe não serão aceitos.

## 5. Documentação de Código (ABAP Doc)

Todos os programas devem conter o bloco de comentário de controle no cabeçalho, incluindo Descrição, Autor, Data e Consultoria. A documentação de métodos e classes deve utilizar a sintaxe do **ABAP Doc**.
