# Alugai - Sistema de Agendamentos de Quadras Esportivas

Bem-vindo ao **Alugai**, um projeto Next.js desenvolvido para agendamentos de quadras esportivas. Construído com `create-next-app`, este aplicativo utiliza tecnologias web modernas para oferecer uma experiência fluida aos usuários. Este README fornece instruções claras para clonar, configurar e executar o projeto localmente, além de detalhes para contribuir e implantar.

## Índice
- [Pré-requisitos](#pré-requisitos)
- [Primeiros Passos](#primeiros-passos)
  - [Clonando o Repositório](#clonando-o-repositório)
  - [Instalando Dependências](#instalando-dependências)
  - [Executando o Servidor de Desenvolvimento](#executando-o-servidor-de-desenvolvimento)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Otimizações](#otimizações)
- [Contribuindo](#contribuindo)
- [Implantação](#implantação)
- [Saiba Mais](#saiba-mais)
- [Licença](#licença)

## Pré-requisitos

Certifique-se de ter instalado:
- **Node.js**: Versão 18.x ou superior (LTS recomendado). [Baixar Node.js](https://nodejs.org/)
- **Git**: Para clonar o repositório. [Baixar Git](https://git-scm.com/)
- Um gerenciador de pacotes: `npm`, `yarn`, `pnpm` ou `bun`.

## Primeiros Passos

Siga estas etapas para configurar e executar o Alugai localmente.

### Clonando o Repositório

1. Clone o repositório:
   ```bash
   git clone https://github.com/EngStrategy/alugai-frontend.git
   ```
2. Acesse o diretório do projeto:
   ```bash
   cd alugai-front
   ```

### Instalando Dependências

Instale as dependências com seu gerenciador de pacotes preferido:

- Com `npm`:
  ```bash
  npm install
  ```
- Com `yarn`:
  ```bash
  yarn install
  ```
- Com `pnpm`:
  ```bash
  pnpm install
  ```
- Com `bun`:
  ```bash
  bun install
  ```

### Executando o Servidor de Desenvolvimento

Inicie o servidor de desenvolvimento:

- Com `npm`:
  ```bash
  npm run dev
  ```
- Com `yarn`:
  ```bash
  yarn dev
  ```
- Com `pnpm`:
  ```bash
  pnpm dev
  ```
- Com `bun`:
  ```bash
  bun dev
  ```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador para ver o Alugai. O aplicativo atualiza automaticamente conforme você edita o código.

## Estrutura do Projeto

Arquivos e diretórios principais:

- `app/`: Código principal do aplicativo usando o App Router do Next.js.
  - `page.tsx`: Página inicial do sistema.
  - `layout.tsx`: Layout raiz do aplicativo.
- `public/`: Ativos estáticos (imagens, fontes, etc.).
- `components/`: Componentes React reutilizáveis para a interface.
- `styles/`: Arquivos de CSS ou estilos.
- `next.config.js`: Configuração do Next.js.
- `package.json`: Dependências e scripts do projeto.

## Scripts Disponíveis

No diretório do projeto, você pode executar:

- `dev`: Inicia o servidor de desenvolvimento.
- `build`: Compila o aplicativo para produção.
  ```bash
  npm run build
  ```
- `start`: Executa o servidor de produção.
  ```bash
  npm run start
  ```
- `lint`: Verifica a qualidade do código.
  ```bash
  npm run lint
  ```

## Otimizações

O Alugai inclui:
- **Fontes**: Otimizadas com [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) usando [Geist](https://vercel.com/font).
- **App Router**: Melhora roteamento e desempenho.
- **TypeScript**: Garante segurança de tipos e melhor experiência de desenvolvimento.

## Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do repositório.
2. Crie uma branch:
   ```bash
   git checkout -b funcionalidade/sua-funcionalidade
   ```
3. Faça suas alterações e commit:
   ```bash
   git commit -m "Adiciona sua funcionalidade"
   ```
4. Envie para sua branch:
   ```bash
   git push origin funcionalidade/sua-funcionalidade
   ```
5. Abra um Pull Request no GitHub.

Certifique-se de que seu código segue os padrões do projeto e inclui testes.

## Implantação

A maneira mais fácil de implantar o Alugai é com o [Vercel](https://vercel.com/):

1. Envie o código para um repositório no GitHub.
2. Importe o repositório no [Vercel Dashboard](https://vercel.com/new).
3. Configure as opções, se necessário.
4. Implante o aplicativo.

Consulte a [documentação de implantação do Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para outras opções (Netlify, AWS, etc.).

## Saiba Mais

Aprofunde-se no Next.js com estes recursos:
- [Documentação do Next.js](https://nextjs.org/docs)
- [Aprenda Next.js](https://nextjs.org/learn)
- [Repositório do Next.js no GitHub](https://github.com/vercel/next.js)

## Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE).