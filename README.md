# Sistema de Controle de Estoque - Projeto Integrador

Um sistema web completo de controle de estoque com autenticação de usuários, gerenciamento de produtos e categorias, registro de movimentações e dashboard em tempo real.

## Tecnologias Utilizadas

- **Backend**: Node.js + Express
- **Banco de Dados**: MySQL
- **Frontend**: HTML, CSS, JavaScript
- **Autenticação**: JWT (JSON Web Tokens)
- **Segurança**: Bcryptjs para hash de senhas

## Estrutura do Projeto

```
controle-estoque/
├── database/                    # Scripts SQL
│   ├── schema.sql              # Estrutura do banco
│   └── seed.sql                # Dados de exemplo
├── backend/                     # API Node.js + Express
│   ├── src/
│   │   ├── config/             # Configuração do banco
│   │   ├── models/             # Acesso a dados (SQL)
│   │   ├── services/           # Regras de negócio
│   │   ├── controllers/        # Recebe requisições
│   │   ├── routes/             # Endpoints da API
│   │   ├── middlewares/        # Autenticação e erros
│   │   ├── app.js              # Configuração Express
│   │   └── server.js           # Servidor HTTP
│   ├── package.json            # Dependências
│   ├── .env.example            # Modelo de variáveis
│   └── testar-conexao.js       # Diagnóstico do banco
└── frontend/                    # Interface HTML/CSS/JS
    ├── css/
    │   └── style.css           # Estilos
    ├── js/
    │   ├── config.js           # URL da API
    │   ├── api.js              # Comunicação com API
    │   ├── login.js            # Tela de login
    │   └── app.js              # Lógica da aplicação
    ├── index.html              # Página de login
    └── app.html                # Página do sistema
```

## Requisitos

- Node.js (v14+)
- MySQL Server
- npm ou yarn
- Visual Studio Code (recomendado)

## Instalação

### 1. Banco de Dados

Abra o MySQL Workbench e execute os scripts na seguinte ordem:

1. `database/schema.sql` - Cria banco e tabelas
2. `database/seed.sql` - Insere dados de exemplo

### 2. Backend

```bash
cd backend

# Copie o arquivo de configuração
cp .env.example .env

# Edite o .env com suas credenciais do MySQL
nano .env

# Instale as dependências
npm install

# Inicie o servidor (desenvolvimento)
npm run dev

# Ou para produção
npm start
```

A API estará disponível em `http://localhost:3000`

### 3. Frontend

Abra o VS Code e use a extensão **Live Server** para servir o frontend:

- Clique com o botão direito em `frontend/index.html`
- Selecione "Open with Live Server"
- A aplicação será aberta em `http://localhost:5500`

## Credenciais de Teste

**Email**: `admin@estoque.com`  
**Senha**: `123456`

## Funcionalidades

- ✅ Autenticação com JWT
- ✅ CRUD de categorias
- ✅ CRUD de produtos
- ✅ Registro de movimentações (entrada/saída)
- ✅ Dashboard com indicadores
- ✅ Alertas de estoque mínimo
- ✅ Validação de dados
- ✅ Tratamento de erros centralizado
- ✅ Interface responsiva

## Endpoints da API

### Autenticação (Públicos)

- `POST /auth/login` - Fazer login
- `POST /auth/registrar` - Registrar novo usuário

### Categorias (Protegidas)

- `GET /categorias` - Listar todas
- `GET /categorias/:id` - Buscar por ID
- `POST /categorias` - Criar nova
- `PUT /categorias/:id` - Atualizar
- `DELETE /categorias/:id` - Excluir

### Produtos (Protegidas)

- `GET /produtos` - Listar todos
- `GET /produtos/:id` - Buscar por ID
- `POST /produtos` - Criar novo
- `PUT /produtos/:id` - Atualizar
- `DELETE /produtos/:id` - Excluir

### Movimentações (Protegidas)

- `GET /movimentacoes` - Listar histórico
- `GET /movimentacoes/dashboard` - Resumo para dashboard
- `POST /movimentacoes` - Registrar entrada/saída
- `DELETE /movimentacoes/:id` - Excluir movimentação

## Diagnóstico de Problemas

Se houver erro na conexão com o banco, execute:

```bash
cd backend
node testar-conexao.js
```

Este script testa a conexão e oferece dicas em português para resolver o problema.

## Commits Importantes

O desenvolvimento segue um padrão de commits descritivos:

- `feat: cria scripts de banco de dados`
- `feat: cria estrutura backend com Express`
- `feat: cria camada de models`
- `feat: cria camada de services`
- `feat: cria middlewares de autenticação`
- `feat: cria controllers e rotas`
- `feat: cria frontend com HTML/CSS`
- `feat: implementa lógica JavaScript`

## Autor

Desenvolvido como Projeto Integrador do Curso Técnico em Desenvolvimento de Sistemas.

## Licença

MIT