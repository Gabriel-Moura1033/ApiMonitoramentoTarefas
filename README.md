# API de Monitoramento SDA

API REST para monitoramento de clientes SDA, desenvolvida com Node.js, Express e MariaDB. Sistema de autenticação JWT com controle de acesso baseado em roles.

## 📋 Índice

- [Características](#-características)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Endpoints da API](#-endpoints-da-api)
- [Autenticação](#-autenticação)
- [Exemplos de Uso](#-exemplos-de-uso)
- [Scripts Disponíveis](#-scripts-disponíveis)

## ✨ Características

- 🔐 Autenticação JWT com tokens de 24 horas
- 👥 Sistema de roles (usuário comum e admin)
- 📊 Monitoramento de status de clientes em tempo real
- 📈 Histórico de falhas das últimas 24 horas
- 🔒 Middleware de verificação de usuário ativo
- 🎯 Endpoints organizados por funcionalidade
- 🌐 CORS habilitado para integração com frontend

## 🛠 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express 5** - Framework web
- **MariaDB** - Banco de dados relacional
- **JWT** - Autenticação via tokens
- **bcryptjs** - Hash de senhas
- **dotenv** - Gerenciamento de variáveis de ambiente
- **nodemon** - Hot reload em desenvolvimento

## 📦 Pré-requisitos

- Node.js >= 14.x
- MariaDB >= 10.x
- npm ou yarn

### Estrutura do Banco de Dados

A API requer as seguintes tabelas:

```sql
-- Tabela de usuários
CREATE TABLE USUARIOS (
  ID INT AUTO_INCREMENT PRIMARY KEY,
  NOME VARCHAR(255) NOT NULL,
  EMAIL VARCHAR(255) UNIQUE NOT NULL,
  SENHA_HASH VARCHAR(255) NOT NULL,
  ATIVO BOOLEAN DEFAULT 1,
  ADMIN BOOLEAN DEFAULT 0,
  ULTIMO_LOGIN DATETIME
);

-- Tabela de clientes
CREATE TABLE CLIENTES (
  CLIENTE_ID INT AUTO_INCREMENT PRIMARY KEY,
  NOME VARCHAR(255) NOT NULL,
  ATIVO BOOLEAN DEFAULT 1
);

-- Tabela de status SDA
CREATE TABLE CLIENTES_SDA (
  CLIENTE_SDA_ID INT AUTO_INCREMENT PRIMARY KEY,
  CLIENTE_ID INT,
  FALHA BOOLEAN DEFAULT 0,
  FALHA_COSMOS BOOLEAN DEFAULT 0,
  FALHAS_CONSECUTIVAS INT DEFAULT 0,
  ULTIMO_TESTE DATETIME,
  ULTIMO_SUCESSO DATETIME,
  CUSTOM_ACTION VARCHAR(255),
  FOREIGN KEY (CLIENTE_ID) REFERENCES CLIENTES(CLIENTE_ID)
);

-- Tabela de log de falhas
CREATE TABLE LOG_FALHAS (
  LOG_ID INT AUTO_INCREMENT PRIMARY KEY,
  CLIENTE_SDA_ID INT,
  DATA_HORA DATETIME NOT NULL,
  FOREIGN KEY (CLIENTE_SDA_ID) REFERENCES CLIENTES_SDA(CLIENTE_SDA_ID)
);
```

## 🚀 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd ApiDBMonitoramento
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente (veja seção [Configuração](#-configuração))

4. Inicie o servidor:
```bash
npm start
```

## ⚙ Configuração

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Banco de Dados
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_DBNAME=nome_do_banco

# JWT
SEGREDO=sua_chave_secreta_jwt_aqui
```

> ⚠️ **Importante**: Nunca commite o arquivo `.env` no repositório. Ele já está incluído no `.gitignore`.

## 📁 Estrutura do Projeto

```
ApiDBMonitoramento/
├── routes/
│   ├── auth.js          # Autenticação (registro, login)
│   ├── status.js        # Status dos clientes
│   ├── history.js       # Histórico de falhas
│   └── admin.js         # Endpoints administrativos
├── middleware/
│   ├── auth.js          # Middleware de autenticação JWT
│   └── checkUserActive.js  # Middleware de verificação de usuário ativo
├── constants.js         # Constantes da aplicação
├── db.js               # Pool de conexões MariaDB
├── server.js           # Configuração do servidor Express
├── package.json        # Dependências e scripts
├── .env               # Variáveis de ambiente (não versionado)
├── .gitignore         # Arquivos ignorados pelo Git
└── README.md          # Este arquivo
```

## 🌐 Endpoints da API

### Autenticação

#### `POST /api/register`
Registra um novo usuário no sistema.

**Body:**
```json
{
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "senha123"
}
```

**Resposta (201):**
```json
{
  "message": "Usuário cadastrado com sucesso"
}
```

---

#### `POST /api/login`
Autentica um usuário e retorna um token JWT.

**Body:**
```json
{
  "email": "joao@example.com",
  "senha": "senha123"
}
```

**Resposta (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### `GET /api/protegido`
Rota de exemplo protegida por autenticação.

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "message": "Você acessou uma rota protegida!"
}
```

---

### Monitoramento

#### `GET /api/status`
Retorna o status de monitoramento de todos os clientes ativos.

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta (201):**
```json
[
  {
    "CLIENTE_ID": 1,
    "cliente": "Cliente Tarefas",
    "FALHA": 0,
    "FALHA_COSMOS": 0,
    "falhas": 0,
    "ultimoTeste": "10/02/2026 22:30:00",
    "ultimoSucesso": "10/02/2026 22:30:00",
    "customAction": null
  }
]
```

---

#### `GET /api/history?cliente=<nome>`
Retorna o histórico de falhas de um cliente específico nas últimas 24 horas.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Params:**
- `cliente` (string, obrigatório): Nome do cliente

**Resposta (201):**
```json
[
  "2026-02-10 22:30",
  "2026-02-10 21:45",
  "2026-02-10 20:15"
]
```

---

### Administrativo

#### `GET /api/usuariosAtivos`
Lista todos os usuários que já fizeram login. **Requer role de admin.**

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta (201):**
```json
[
  {
    "NOME": "João Silva",
    "ULTIMO_LOGIN": "10/02/2026 22:45:30"
  }
]
```

**Erro (403):**
```json
{
  "error": "Acesso restrito a administradores"
}
```

---

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. O fluxo é:

1. **Registro**: Crie uma conta via `POST /api/register`
2. **Login**: Obtenha um token via `POST /api/login`
3. **Uso**: Inclua o token no header `Authorization: Bearer <token>` em todas as requisições protegidas

### Exemplo de Header de Autenticação

```http
GET /api/status HTTP/1.1
Host: localhost:3301
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Expiração do Token

Os tokens JWT expiram após **24 horas**. Após a expiração, é necessário fazer login novamente.

---

## 💡 Exemplos de Uso

### Usando cURL

**Registro:**
```bash
curl -X POST http://localhost:3301/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@example.com",
    "senha": "senha123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3301/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "senha": "senha123"
  }'
```

**Consultar Status (com token):**
```bash
curl -X GET http://localhost:3301/api/status \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Usando JavaScript (Fetch API)

```javascript
// Login
const login = async () => {
  const response = await fetch('http://localhost:3301/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'joao@example.com',
      senha: 'senha123'
    })
  });
  const data = await response.json();
  return data.token;
};

// Consultar status
const getStatus = async (token) => {
  const response = await fetch('http://localhost:3301/api/status', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};

// Uso
const token = await login();
const status = await getStatus(token);
console.log(status);
```

---

## 📜 Scripts Disponíveis

```bash
# Iniciar servidor em produção
npm start

# Iniciar servidor em desenvolvimento (com hot reload)
npm run dev
```

---

## 🔒 Segurança

- ✅ Senhas são hasheadas com bcrypt (10 rounds)
- ✅ Tokens JWT assinados com chave secreta
- ✅ Verificação de usuário ativo em todas as rotas protegidas
- ✅ Controle de acesso baseado em roles
- ✅ CORS configurado

### Recomendações Adicionais

- Use HTTPS em produção
- Implemente rate limiting para prevenir ataques de força bruta
- Configure variáveis de ambiente adequadamente no servidor
- Mantenha as dependências atualizadas

---

## 📝 Códigos de Status HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado com sucesso |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token não fornecido ou inválido |
| 403 | Forbidden - Usuário sem permissão |
| 500 | Internal Server Error - Erro no servidor |

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

ISC

---

## 👤 Autor

**Gabriel Moura**

---

## 🐛 Reportar Problemas

Se encontrar algum problema, por favor abra uma [issue](link-para-issues) no repositório.
