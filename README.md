Parceira AppBem-vindo ao Parceira App! Este é um projeto Next.js completo, projetado para gerenciar pedidos de um restaurante, com funcionalidades de autenticação, carrinho de compras, gestão de produtos e um dashboard para acompanhamento de pedidos.🚀 ComeçandoPara iniciar o projeto em seu ambiente de desenvolvimento, siga os passos abaixo:InstalaçãoClone o repositório e instale as dependências:git clone <URL_DO_REPOSITORIO>
cd parceria-app
npm install # ou yarn install, pnpm install, bun install
Configuração do Banco de DadosEste projeto utiliza Prisma como ORM. Certifique-se de ter um banco de dados configurado (PostgreSQL, MySQL, SQLite, etc.) e configure a string de conexão no seu arquivo .env.Após configurar o banco de dados, aplique as migrações:npx prisma migrate dev --name init # Aplica as migrações iniciais
Você também pode popular o banco de dados com dados de exemplo:npx prisma db seed # Popula o banco de dados com dados de exemplo
Rodando o Servidor de Desenvolvimentonpm run dev

# ou

yarn dev

# ou

pnpm dev

# ou

bun dev
Abra http://localhost:3000 no seu navegador para ver o resultado.✨ Funcionalidades PrincipaisAutenticação de UsuárioO aplicativo conta com um sistema completo de autenticação utilizando NextAuth.js e credenciais (email/senha).Login: Usuários podem fazer login com suas credenciais.Registro: Novos usuários podem criar uma conta.Sessão: As sessões dos usuários são gerenciadas com JWT.Catálogo de Produtos e Pedidos (Área do Cliente)A interface do cliente permite aos usuários navegar por categorias e produtos, adicionar itens ao carrinho e finalizar pedidos.Listagem de Categorias: Visualize produtos agrupados por categorias.Visualização de Produtos: Detalhes do produto, incluindo preço, imagem, descrição, adicionais e opções de tamanho (para pizzas).Carrinho de Compras: Adicione, remova e ajuste a quantidade de itens no carrinho.Checkout: Selecione ou adicione endereços de entrega, escolha a forma de pagamento (cartão de crédito, débito, Pix, dinheiro) e especifique o troco, se necessário.Meus Pedidos: Visualize o histórico de pedidos com seus respectivos status e detalhes.Dashboard de Gestão (Área da Loja - Acesso Restrito)Para administradores e caixas, há um painel de controle para gerenciar produtos e pedidos.Login Restrito: Acesso ao dashboard é restrito a usuários com perfis "ADMIN" ou "CASHIER".Gestão de Produtos: Adicione, edite e exclua produtos, incluindo a definição de preços, descontos, imagens e tamanhos (para pizzas).Gestão de Pedidos: Visualize pedidos por status (pendente, em preparo, em trânsito, entregue, cancelado) e atualize o status dos pedidos.Impressão de Pedidos: Gere e imprima recibos de pedidos para cozinha e expedição.🛠️ Tecnologias UtilizadasNext.js: Framework React para aplicações web.Prisma: ORM para Node.js e TypeScript.NextAuth.js: Autenticação flexível para Next.js.Tailwind CSS: Framework CSS para estilização rápida.Zustand: Gerenciamento de estado leve para React.TypeScript: Linguagem de programação para tipagem estática.Shadcn UI: Componentes de UI reutilizáveis.Lucide React: Biblioteca de ícones.📂 Estrutura do ProjetoA estrutura do projeto segue as convenções do Next.js, com rotas definidas na pasta app/ e a API em app/api/.parceria-app/
├── prisma/ # Esquemas e migrações do Prisma
├── public/ # Assets estáticos
├── src/
│ ├── app/
│ │ ├── (auth)/ # Rotas de autenticação (login, register)
│ │ ├── (home)/ # Rotas da página inicial
│ │ ├── api/ # Rotas da API
│ │ ├── categorias/[id]/ # Página de categoria por ID
│ │ ├── checkout/ # Páginas de checkout e adição de endereço
│ │ ├── loja/ # Área administrativa (dashboard, adicionar-produtos, gestor)
│ │ ├── pedidos/ # Página de pedidos do usuário
│ │ ├── produto/[id]/ # Página de detalhes do produto
│ │ ├── globals.css # Estilos globais
│ │ ├── layout.tsx # Layout principal da aplicação
│ │ └── page.tsx # Página inicial
│ ├── components/ # Componentes reutilizáveis (UI, layout, cart)
│ ├── helpers/ # Funções utilitárias (formatação de moeda, tradução de status)
│ ├── hooks/ # Hooks customizados (cartStore, use-mobile)
│ ├── lib/ # Configurações de bibliotecas (prisma, utils)
│ ├── providers/ # Provedores de contexto (AuthProvider)
│ └── types/ # Definições de tipos (next-auth.d.ts)
├── next.config.ts # Configurações do Next.js
├── package.json # Dependências e scripts do projeto
└── README.md # Este arquivo
