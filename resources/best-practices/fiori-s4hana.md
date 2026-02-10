# Documentação de Padrões: Fiori (UI5)

## 1. Desenvolvimento Front-End (BAS / VSCode)

A nomenclatura para a criação de aplicativos nas ferramentas de desenvolvimento deve seguir as regras abaixo:

| Objeto                                | Regra                                                                                 | Exemplo                       |
| :------------------------------------ | :------------------------------------------------------------------------------------ | :---------------------------- |
| **Nome do APP (Module Name)**         | Deve iniciar com `Z` seguido de uma descrição aberta com no máximo **21 caracteres**. | `ZTROCA_EMAIL`                |
| **Namespace (Application Namespace)** | Deve ser obrigatoriamente o valor fixo.                                               | `[com ou pt ou br].[empresa]` |
| **Objeto BSP (Deploy)**               | Utilize o prefixo `ZZ1` seguido do nome do APP abreviado (máximo **12 caracteres**).  | `ZZ1TROCAEM`                  |

## 2. Configurações no Fiori Launchpad Designer

A equipe de ABAP é responsável pela gestão técnica desses objetos para disponibilização dos APPs.

**Observação**: Todos os objetos do Launchpad Designer devem ser salvos em uma única Request de transporte.

### 2.1. Catálogos e Grupos

| Objeto                                      | Padrão               | Exemplo       |
| :------------------------------------------ | :------------------- | :------------ |
| **Catálogo Técnico (Technical Catalog)**    | `ZTC_[MD]`           | `ZTC_FI`      |
| **Catálogo de Negócios (Business Catalog)** | `ZBC_[MD]_[PROJETO]` | `ZBC_SD_COOP` |
| **Grupo de Catálogos (Group Catalog)**      | `ZGP_[MD]_[PROJETO]` | `ZGP_SD_COOP` |

### 2.2. Target Mapping

| Campo                  | Regra                                                         |
| :--------------------- | :------------------------------------------------------------ |
| **Objeto Semântico**   | Utilizar o nome do APP.                                       |
| **Ação**               | Definida de acordo com o processo que o APP executa.          |
| **Regra de Unicidade** | A combinação de `Objeto` + `Ação` deve ser única no ambiente. |

## 3. Versionamento e Organização no Repositório

- **IDE**: A escolha entre **VSCode** ou **Business Application Studio (BAS)** é livre.
- **Repositório**: O código-fonte dos projetos deve ser obrigatoriamente versionado no **SVN do Projeto**.
- **Estrutura de Pastas**: Os aplicativos devem ser organizados em pastas separadas por **módulo** (ex: `FI`, `SD`, `MM`) para facilitar a localização e organização dos mesmos.
