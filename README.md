
<h1 align="center">Orienta.ai</h1>

Orienta\.ai é uma aplicação web que utiliza inteligência artificial para ajudar estudantes a escolher um orientador de acordo com o tema de interesse, seja para TCC, dissertação, tese etc. Esse projeto é uma forma de demonstrar a capacidade de criar e hospedar sistemas completos que integram IA, utilizando apenas ferramentas gratuitas.

Para acessar a aplicação, visite [Orienta.ai](https://orienta-ai-brown.vercel.app/).

### Funcionalidades

- Filtrar orientadores mais indicados com base no tema de pesquisa do estudante, baseando a escolha nas informações do perfil Lattes.
- Navegar pela base de professores, visualizando informações detalhadas sobre cada um.
- Painel de administração para manter a base de professores (adicionar, editar, excluir).

### Stack

- Frontend:
    - Linguagem: [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
    - Framework: [React](https://react.dev/)
    - Hosting: [Vercel](https://vercel.com/)
- Backend:
    - Linguagem: [Python](https://www.python.org/)
    - Framework: [FastAPI](https://fastapi.tiangolo.com/)
    - Hosting: [VPS Oracle](https://www.oracle.com/br/cloud/free/)
- Outros:
    - Conteinerização: [Docker](https://www.docker.com/)
    - Proxy Reverso: [NGINX](https://www.nginx.com/)
    - CI/CD: [GitHub Actions](https://github.com/features/actions)
    - LLM: [Groq](https://groq.com/)

### Funcionamento

#### 1. Sobre cadastrar um professor

O usuário administrador pode cadastrar um novo professor na base de dados, inserindo o PDF, referente ao currículo Lattes do professor, no painel do admin. Esse arquivo é enviado à API. O procedimento de ingestão de PDFs e extração de informações é realizado na seguinte ordem:

1. O PDF é convertido em texto com o *LiteParse*
2. O texto é filtrado, eliminando informações dispendiosas como boilerplate do Lattes, participação em bancas, trabalhos muito antigos, etc.
3. O texto é enviado para a LLM, que estrutura as informações em um JSON, seguindo uma estrutura pré-determinada.
4. Por fim, os dados são persistidos na base, que se consiste de um arquivo JSON.

#### 2. Sobre escolher um orientador

A API recebe o tema de interesse do estudante, e retorna um orientador mais indicado, baseando-se nas informações do perfil Lattes. O procedimento de consulta ao LLM é realizado na seguinte ordem:

1. O tema de interesse do estudante é enviado para a API.
2. A API realizar uma pré filtragem dos professores, normalizando a entrada e realizando a comparação por similaridade dos textos, mantendo os top 5.
3. Os 5 professores mais similares são enviados para a LLM, que estrutura as informações para serem apresentadas ao estudante.
4. Por fim, o estudante escolhe o orientador desejado.