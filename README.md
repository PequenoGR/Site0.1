# LuauRaw - Hospedagem e Gerenciamento de Scripts Luau

LuauRaw é uma plataforma completa desenvolvida especificamente para desenvolvedores Roblox e programadores Luau. Ela atua como um Pastebin/Raw de alto desempenho, permitindo criar, editar, proteger por senha e servir scripts via URLs RAW limpas e compatíveis com a função `loadstring(game:HttpGet(...))()`.

---

## 🚀 Funcionalidades Principais

- **Criação e Edição de Scripts Luau**: Editor de código integrado com destaque de sintaxe Luau (Monaco Editor), atalhos de teclado (Ctrl+S), contagem de linhas e modelos prontos.
- **Link RAW Direto**: Cada script recebe uma rota exclusiva `/raw/ID_DO_SCRIPT` que retorna **estritamente texto puro** (`Content-Type: text/plain; charset=utf-8`), sem tags HTML, menus ou scripts externos.
- **Execução Imediata via Loadstring**:
  ```lua
  loadstring(game:HttpGet("https://seu-dominio.com/raw/ID_DO_SCRIPT"))()
  ```
- **Proteção por Senha & Tokens de Acesso**:
  - Scripts protegidos por senha têm a senha mestra criptografada no servidor via **bcrypt** (10 salt rounds).
  - Como o executor Luau não é um navegador com suporte a HTML, o sistema gera **Chaves de Acesso / Tokens** para query string:
    ```lua
    loadstring(game:HttpGet("https://seu-dominio.com/raw/ID_DO_SCRIPT?key=SUA_CHAVE"))()
    ```
- **Gerenciador de Links RAW**: Testador em tempo real integrado para inspecionar status HTTP (200 OK / 401 Unauthorized), headers e corpo da resposta diretamente na interface.
- **Interface Dinâmica & Personalizável**:
  - Modo Escuro (Dark) e Modo Claro (Light).
  - 6 Paletas de Cores de Destaque (Ciano, Esmeralda, Violeta, Âmbar, Rosa e Azul) configuráveis pelo usuário.
  - Layout moderno, leve e 100% responsivo para celulares, tablets e computadores.
- **Segurança Robusta**:
  - Autenticação via JSON Web Tokens (JWT).
  - Rate limiting contra ataques de força bruta em senhas e requisições excessivas.
  - Sanitização de cabeçalhos HTTP com `X-Content-Type-Options: nosniff`.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Monaco Editor (@monaco-editor/react).
- **Backend**: Node.js, Express, Vite Middleware (modo híbrido SPA + API).
- **Segurança**: bcryptjs (hashing de senhas), jsonwebtoken (sessões JWT).
- **Armazenamento**: Banco de dados JSON local atômico com isolamento de metadados (`data/database.json`).

---

## 💻 Como Executar Localmente

### Pré-requisitos
- Node.js versão 18 ou superior instalado.
- npm ou yarn.

### Passo 1: Clonar o repositório e instalar dependências
```bash
git clone https://github.com/seu-usuario/luauraw.git
cd luauraw
npm install
```

### Passo 2: Configurar variáveis de ambiente
Crie um arquivo `.env` baseado no `.env.example`:
```env
PORT=3000
JWT_SECRET=sua_chave_secreta_longa_e_aleatoria
NODE_ENV=development
```

### Passo 3: Iniciar o servidor de desenvolvimento
```bash
npm run dev
```
O servidor iniciará em `http://localhost:3000` fornecendo tanto a API REST quanto o frontend com suporte a Hot Reload.

---

## 📦 Build e Execução em Produção

Para gerar a build de produção:
```bash
npm run build
```
Esse comando compila o frontend estático para `dist/` e empacota o backend para `dist/server.cjs` via `esbuild`.

Para iniciar em produção:
```bash
npm start
```

---

## 🌐 Instruções para Deploy

### Opção 1: Cloudflare Workers (Recomendado)
A aplicação conta com suporte nativo a Cloudflare Workers (`src/worker.ts`, `wrangler.jsonc`, `wrangler.toml`):

1. Gere o build dos assets estáticos:
```bash
bun run build
# ou
npm run build
```

2. Publique com o Wrangler:
```bash
npx wrangler deploy
```

O Cloudflare Worker interceptará e responderá automaticamente:
- `/raw/:id` -> Retorna texto puro Luau para o Roblox `loadstring`.
- `/api/*` -> Responde todas as rotas REST em formato JSON estruturado.
- `/` e rotas do frontend -> Serve os assets estáticos do Vite com fallback SPA.

### Opção 2: Google Cloud Run / Docker
A aplicação já vem pronta para rodar em containers na porta 3000:

1. Crie ou utilize o Dockerfile da aplicação:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

2. Realize o deploy para o Cloud Run:
```bash
gcloud run deploy luauraw \
  --source . \
  --port 3000 \
  --allow-unauthenticated
```

### Opção 2: VPS (Ubuntu / Debian com PM2 e Nginx)
1. Instale o Node.js e o PM2 globalmente:
```bash
npm install -g pm2
```
2. Clone o repositório, instale as dependências e rode o build:
```bash
npm install
npm run build
```
3. Inicie o processo pelo PM2:
```bash
pm2 start dist/server.cjs --name "luauraw"
pm2 save
```

---

## 📖 Endpoints Principais da API

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/raw/:id` | Retorna o código Luau em **texto puro** para o loadstring. Aceita `?key=CHAVE` ou `?password=SENHA`. |
| `POST` | `/api/auth/register` | Cria uma nova conta de usuário. |
| `POST` | `/api/auth/login` | Realiza login e gera token JWT. |
| `GET` | `/api/scripts` | Lista os scripts do usuário ou públicos. |
| `POST` | `/api/scripts` | Cria um novo script Luau com título, código e visibilidade. |
| `PUT` | `/api/scripts/:id` | Atualiza título, descrição, código ou proteção do script. |
| `DELETE` | `/api/scripts/:id` | Exclui o script permanentemente. |
| `POST` | `/api/scripts/:id/keys` | Cria um novo Token de Acesso para scripts protegidos. |
| `DELETE` | `/api/scripts/:id/keys/:key` | Revoga um Token de Acesso. |

---

## 🎮 Exemplos de Código Luau

### 1. Script Público
```lua
loadstring(game:HttpGet("https://seu-dominio.com/raw/meu-script"))()
```

### 2. Script Protegido por Chave
```lua
loadstring(game:HttpGet("https://seu-dominio.com/raw/meu-script-vip?key=chave_gerada_no_painel"))()
```

### 3. Script Protegido com Verificação de Erro
```lua
local rawUrl = "https://seu-dominio.com/raw/meu-script-vip?key=chave_gerada_no_painel"
local success, content = pcall(function()
    return game:HttpGet(rawUrl)
end)

if success and content then
    local func, err = loadstring(content)
    if func then
        func()
    else
        warn("Erro ao compilar: " .. tostring(err))
    end
else
    warn("Falha ao baixar script: " .. tostring(content))
end
```

---

## 🔒 Licença
MIT License. Desenvolvido para a comunidade de desenvolvedores Luau e Roblox.
