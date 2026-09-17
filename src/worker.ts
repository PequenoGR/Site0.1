import bcrypt from 'bcryptjs';

export interface Env {
  ASSETS?: {
    fetch: (request: Request) => Promise<Response>;
  };
  SCRIPTSGR_KV?: any;
  DB?: any;
  KV?: any;
  JWT_SECRET?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  themePreference?: string;
  accentColor?: string;
}

interface AccessKey {
  key: string;
  name: string;
  createdAt: string;
}

interface Script {
  id: string;
  userId: string;
  authorUsername: string;
  title: string;
  category?: string;
  description: string;
  code: string;
  thumbnailUrl?: string;
  isPasswordProtected: boolean;
  passwordHash?: string;
  accessKeys: AccessKey[];
  accessCount: number;
  lastAccessedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_JWT_SECRET = 'scriptsgr_cf_worker_super_secure_jwt_secret_2026_key';

// Initial default scripts
const INITIAL_DEMO_HASH = '$2b$10$kEgqbG2b4EvLwbh/1aEDdu2CmfiJ4co3akmEFjB/AkrkZp6719Ct2'; // demo123

const INITIAL_USERS: User[] = [
  {
    id: 'user_demo_001',
    username: 'demo',
    email: 'demo@luauraw.dev',
    passwordHash: INITIAL_DEMO_HASH,
    createdAt: '2026-09-16T20:00:00.000Z',
    themePreference: 'dark',
    accentColor: 'cyan',
  },
];

const INITIAL_SCRIPTS: Script[] = [
  {
    id: 'w33umz',
    userId: 'user_demo_001',
    authorUsername: 'demo',
    title: 'GR Hub Luau',
    category: 'Universal',
    description: 'Script utilitário GR Hub com interface e módulos automáticos.',
    code: `local INTERFACE_URL = "https://raw.githubusercontent.com/PequenoGR/Gr_Script/refs/heads/main/InterfaceScript"

local ok, err = pcall(function()
    local source = game:HttpGet(INTERFACE_URL)
    if not source or source == "" then
        error("Não foi possível baixar a interface (fonte vazia).")
    end
    local fn, compileErr = loadstring(source)
    if not fn then
        error("Erro ao compilar interface: " .. tostring(compileErr))
    end
    fn()
end)

if not ok then
    warn("[GR Hub] Falha ao carregar a interface: " .. tostring(err))
    return
end

local Hub = getgenv().GRHub
if not Hub then
    local tries = 0
    repeat
        task.wait(0.1)
        tries = tries + 1
        Hub = getgenv().GRHub
    until Hub or tries >= 50
end

if not Hub then
    warn("[GR Hub] A API (getgenv().GRHub) não foi exposta pela interface.")
    return
end

print("[GR Hub] Inicializado com sucesso via ScriptsGR!")
return Hub
`,
    thumbnailUrl: '',
    isPasswordProtected: false,
    accessKeys: [],
    accessCount: 142,
    lastAccessedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'wgj62t',
    userId: 'user_demo_001',
    authorUsername: 'demo',
    title: 'GR Hub Luau Main',
    category: 'Universal',
    description: 'Script utilitário principal GR Hub para execução direta via Roblox loadstring.',
    code: `local INTERFACE_URL = "https://raw.githubusercontent.com/PequenoGR/Gr_Script/refs/heads/main/InterfaceScript"

local ok, err = pcall(function()
    local source = game:HttpGet(INTERFACE_URL)
    if not source or source == "" then
        error("Não foi possível baixar a interface (fonte vazia).")
    end
    local fn, compileErr = loadstring(source)
    if not fn then
        error("Erro ao compilar interface: " .. tostring(compileErr))
    end
    fn()
end)

if not ok then
    warn("[GR Hub] Falha ao carregar a interface: " .. tostring(err))
    return
end

local Hub = getgenv().GRHub
if not Hub then
    local tries = 0
    repeat
        task.wait(0.1)
        tries = tries + 1
        Hub = getgenv().GRHub
    until Hub or tries >= 50
end

if not Hub then
    warn("[GR Hub] A API (getgenv().GRHub) não foi exposta pela interface.")
    return
end

print("[GR Hub] Inicializado com sucesso via ScriptsGR!")
return Hub
`,
    thumbnailUrl: '',
    isPasswordProtected: false,
    accessKeys: [],
    accessCount: 85,
    lastAccessedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'd44evg',
    userId: 'user_demo_001',
    authorUsername: 'demo',
    title: 'GR Hub Luau Loader (d44evg)',
    category: 'Universal',
    description: 'Script utilitário GR Hub para execução direta via Roblox loadstring.',
    code: `local INTERFACE_URL = "https://raw.githubusercontent.com/PequenoGR/Gr_Script/refs/heads/main/InterfaceScript"

local ok, err = pcall(function()
    local source = game:HttpGet(INTERFACE_URL)
    if not source or source == "" then
        error("Não foi possível baixar a interface (fonte vazia).")
    end
    local fn, compileErr = loadstring(source)
    if not fn then
        error("Erro ao compilar interface: " .. tostring(compileErr))
    end
    fn()
end)

if not ok then
    warn("[GR Hub] Falha ao carregar a interface: " .. tostring(err))
    return
end

local Hub = getgenv().GRHub
if not Hub then
    local tries = 0
    repeat
        task.wait(0.1)
        tries = tries + 1
        Hub = getgenv().GRHub
    until Hub or tries >= 50
end

if not Hub then
    warn("[GR Hub] A API (getgenv().GRHub) não foi exposta pela interface.")
    return
end

print("[GR Hub] Inicializado com sucesso via ScriptsGR!")
return Hub
`,
    thumbnailUrl: '',
    isPasswordProtected: false,
    accessKeys: [],
    accessCount: 92,
    lastAccessedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'f7rt2f',
    userId: 'user_demo_001',
    authorUsername: 'demo',
    title: 'Jeje',
    category: 'Universal',
    description: '',
    code: `local INTERFACE_URL = "https://raw.githubusercontent.com/PequenoGR/Gr_Script/refs/heads/main/InterfaceScript"

local ok, err = pcall(function()
    local source = game:HttpGet(INTERFACE_URL)
    if not source or source == "" then
        error("Não foi possível baixar a interface (fonte vazia).")
    end
    local fn, compileErr = loadstring(source)
    if not fn then
        error("Erro ao compilar interface: " .. tostring(compileErr))
    end
    fn()
end)

if not ok then
    warn("[GR Hub] Falha ao carregar a interface: " .. tostring(err))
    return
end

local Hub = getgenv().GRHub
if not Hub then
    local tries = 0
    repeat
        task.wait(0.1)
        tries = tries + 1
        Hub = getgenv().GRHub
    until Hub or tries >= 50
end

if not Hub then
    warn("[GR Hub] A API (getgenv().GRHub) não foi exposta pela interface.")
    return
end

print("[GR Hub] Carregado!")
`,
    thumbnailUrl: '',
    isPasswordProtected: false,
    accessKeys: [],
    accessCount: 68,
    lastAccessedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fly-speed-v2',
    userId: 'user_demo_001',
    authorUsername: 'demo',
    title: 'Luau Speed & Fly Utility',
    category: 'Universal',
    description: 'Script utilitário em Luau com controle suave de movimentação, teleporte e notificações no console.',
    code: `--[[
    Luau Utility Script v2.4
    Hospedado via ScriptsGR
    Exemplo compatível com loadstring(game:HttpGet(...))()
]]

local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local LocalPlayer = Players.LocalPlayer

local function notify(title, text)
    print(string.format("[%s]: %s", title, text))
end

notify("ScriptsGR", "Script carregado com sucesso pelo loadstring!")

local function setWalkSpeed(speed)
    local character = LocalPlayer.Character or LocalPlayer.CharacterAdded:Wait()
    local humanoid = character:FindFirstChildOfClass("Humanoid")
    if humanoid then
        humanoid.WalkSpeed = speed
        notify("Velocidade", "Ajustada para " .. tostring(speed))
    end
end

setWalkSpeed(24)
return { version = "2.4.0", status = "active" }
`,
    thumbnailUrl: '',
    isPasswordProtected: false,
    accessKeys: [],
    accessCount: 195,
    lastAccessedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// In-Memory Global Storage fallback for the worker instance
let inMemoryUsers: User[] = [...INITIAL_USERS];
let inMemoryScripts: Script[] = [...INITIAL_SCRIPTS];

// Helpers for KV Storage if present
async function getKV(env: Env) {
  return env.SCRIPTSGR_KV || env.DB || env.KV;
}

async function loadData(env: Env): Promise<{ users: User[]; scripts: Script[] }> {
  const kv = await getKV(env);
  if (kv) {
    try {
      const usersRaw = await kv.get('db_users', 'json');
      const scriptsRaw = await kv.get('db_scripts', 'json');
      const users = Array.isArray(usersRaw) && usersRaw.length > 0 ? (usersRaw as User[]) : inMemoryUsers;
      let scripts = Array.isArray(scriptsRaw) && scriptsRaw.length > 0 ? (scriptsRaw as Script[]) : inMemoryScripts;
      
      // Ensure all initial seeds are present if not already in scripts
      const existingIds = new Set(scripts.map(s => s.id.toLowerCase()));
      for (const initScript of INITIAL_SCRIPTS) {
        if (!existingIds.has(initScript.id.toLowerCase())) {
          scripts.push(initScript);
        }
      }
      return { users, scripts };
    } catch {
      // Fallback to in-memory
    }
  }
  return { users: inMemoryUsers, scripts: inMemoryScripts };
}

async function saveData(env: Env, users: User[], scripts: Script[]): Promise<void> {
  inMemoryUsers = users;
  inMemoryScripts = scripts;
  const kv = await getKV(env);
  if (kv) {
    try {
      await kv.put('db_users', JSON.stringify(users));
      await kv.put('db_scripts', JSON.stringify(scripts));
      // Also persist direct keys for ultra-fast single script lookups across regions
      for (const s of scripts) {
        await kv.put('script_' + s.id.toLowerCase(), JSON.stringify(s));
      }
    } catch (e) {
      console.warn('Failed to persist to KV:', e);
    }
  }
}

async function findScript(env: Env, scriptId: string): Promise<Script | null> {
  const cleanId = scriptId.trim().replace(/\.lua$/i, '').toLowerCase();
  if (!cleanId) return null;

  const kv = await getKV(env);
  if (kv) {
    try {
      const direct = await kv.get('script_' + cleanId, 'json');
      if (direct && typeof direct === 'object' && (direct as any).code) {
        return direct as Script;
      }
    } catch {}
  }

  const { scripts } = await loadData(env);
  const found = scripts.find((s) => s.id.toLowerCase() === cleanId || s.id === scriptId.trim());
  if (found) return found;

  const seed = INITIAL_SCRIPTS.find((s) => s.id.toLowerCase() === cleanId || s.id === scriptId.trim());
  return seed || null;
}

// Token creation and verification with Web Crypto API
function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return atob(str);
}

async function signToken(payload: { id: string; username: string; email: string }, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days
  const tokenPayload = { ...payload, exp };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  const sigBytes = String.fromCharCode(...new Uint8Array(signature));
  const encodedSignature = base64UrlEncode(sigBytes);

  return `${data}.${encodedSignature}`;
}

async function verifyToken(token: string, secret: string): Promise<{ id: string; username: string; email: string } | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const data = `${encodedHeader}.${encodedPayload}`;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const sigStr = base64UrlDecode(encodedSignature);
    const sigBuf = new Uint8Array(sigStr.length);
    for (let i = 0; i < sigStr.length; i++) {
      sigBuf[i] = sigStr.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify('HMAC', key, sigBuf, enc.encode(data));
    if (!isValid) return null;

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return { id: payload.id, username: payload.username, email: payload.email };
  } catch {
    return null;
  }
}

// CORS Headers helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Script-Key, X-Access-Key, X-Requested-With',
};

function jsonResponse(data: any, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders,
      ...extraHeaders,
    },
  });
}

function textResponse(text: string, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(text, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      ...corsHeaders,
      ...extraHeaders,
    },
  });
}

function generateId(prefix = ''): string {
  return prefix + Math.random().toString(36).substring(2, 8);
}

function generateAccessKey(): string {
  return 'key_' + Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();
    const pathname = url.pathname;

    // Handle CORS Preflight OPTIONS
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const secret = env.JWT_SECRET || DEFAULT_JWT_SECRET;
    const authHeader = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '').trim();
    const userAuth = authHeader ? await verifyToken(authHeader, secret) : null;

    // =========================================================================
    // 1. RAW LUAU SCRIPT ENDPOINT (/raw/:id and /api/raw/:id)
    // =========================================================================
    if (pathname.startsWith('/raw') || pathname.startsWith('/api/raw')) {
      let rawId = '';
      const queryId = url.searchParams.get('id') || url.searchParams.get('scriptId');

      if (queryId) {
        rawId = queryId;
      } else {
        const parts = pathname.replace(/^\/api\/raw\/?|^\/raw\/?/, '').split('/');
        rawId = parts[0] || '';
      }

      const id = rawId.trim().replace(/\.lua$/i, '');

      if (!id) {
        return textResponse('Script not found', 404);
      }

      const script = await findScript(env, id);

      if (!script) {
        return textResponse('Script not found', 404);
      }

      // Public script -> Deliver raw Luau code directly
      if (!script.isPasswordProtected) {
        script.accessCount = (script.accessCount || 0) + 1;
        script.lastAccessedAt = new Date().toISOString();
        return textResponse(script.code, 200);
      }

      // Protected script -> Check key or password
      const queryKey = url.searchParams.get('key') || url.searchParams.get('token') || url.searchParams.get('access_key');
      const queryPass = url.searchParams.get('pass') || url.searchParams.get('password') || url.searchParams.get('pwd');
      const customKey = request.headers.get('x-script-key') || request.headers.get('x-access-key');

      let isAuthorized = false;
      const tokenCandidate = (queryKey || authHeader || customKey)?.trim();

      if (tokenCandidate && script.accessKeys && script.accessKeys.length > 0) {
        if (script.accessKeys.some((k) => k.key === tokenCandidate)) {
          isAuthorized = true;
        }
      }

      if (!isAuthorized && queryPass && script.accessKeys && script.accessKeys.length > 0) {
        if (script.accessKeys.some((k) => k.key === queryPass.trim())) {
          isAuthorized = true;
        }
      }

      if (!isAuthorized && queryPass && script.passwordHash) {
        try {
          if (bcrypt.compareSync(queryPass, script.passwordHash)) {
            isAuthorized = true;
          }
        } catch {}
      }

      if (!isAuthorized && queryKey && script.passwordHash) {
        try {
          if (bcrypt.compareSync(queryKey, script.passwordHash)) {
            isAuthorized = true;
          }
        } catch {}
      }

      if (isAuthorized) {
        script.accessCount = (script.accessCount || 0) + 1;
        script.lastAccessedAt = new Date().toISOString();
        return textResponse(script.code, 200);
      }

      return textResponse('Unauthorized', 401);
    }

    // =========================================================================
    // 2. HEALTH CHECK (/api/health)
    // =========================================================================
    if (pathname === '/api/health') {
      return jsonResponse({
        status: 'ok',
        service: 'ScriptsGR Cloudflare Worker',
        runtime: 'cloudflare-workers',
        time: new Date().toISOString(),
      });
    }

    // =========================================================================
    // 3. AUTHENTICATION ROUTES (/api/auth/*)
    // =========================================================================
    if (pathname === '/api/auth/register' && method === 'POST') {
      try {
        const body: any = await request.json().catch(() => ({}));
        const { username, email, password } = body;

        if (!username || typeof username !== 'string' || username.trim().length < 3) {
          return jsonResponse({ error: 'O nome de usuário deve ter pelo menos 3 caracteres.' }, 400);
        }
        if (!email || typeof email !== 'string' || !email.includes('@')) {
          return jsonResponse({ error: 'Informe um endereço de e-mail válido.' }, 400);
        }
        if (!password || typeof password !== 'string' || password.length < 6) {
          return jsonResponse({ error: 'A senha deve ter no mínimo 6 caracteres.' }, 400);
        }

        const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
        const { users, scripts } = await loadData(env);

        if (users.some((u) => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === email.trim().toLowerCase())) {
          return jsonResponse({ error: 'Nome de usuário ou e-mail já cadastrado.' }, 400);
        }

        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(password, salt);

        const newUser: User = {
          id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
          username: cleanUsername,
          email: email.trim().toLowerCase(),
          passwordHash,
          createdAt: new Date().toISOString(),
          themePreference: 'dark',
          accentColor: 'cyan',
        };

        users.push(newUser);
        await saveData(env, users, scripts);

        const token = await signToken(
          { id: newUser.id, username: newUser.username, email: newUser.email },
          secret
        );

        return jsonResponse(
          {
            message: 'Conta criada com sucesso!',
            token,
            user: {
              id: newUser.id,
              username: newUser.username,
              email: newUser.email,
              themePreference: newUser.themePreference || 'dark',
              accentColor: newUser.accentColor || 'cyan',
            },
          },
          201
        );
      } catch (err: any) {
        return jsonResponse({ error: err.message || 'Erro ao registrar usuário.' }, 500);
      }
    }

    if (pathname === '/api/auth/login' && method === 'POST') {
      try {
        const body: any = await request.json().catch(() => ({}));
        const { identifier, password } = body;

        if (!identifier || !password) {
          return jsonResponse({ error: 'Informe seu usuário/e-mail e senha.' }, 400);
        }

        const { users } = await loadData(env);
        const cleanId = identifier.trim().toLowerCase();
        const user = users.find(
          (u) => u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId
        );

        if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
          return jsonResponse({ error: 'Credenciais inválidas. Verifique usuário e senha.' }, 401);
        }

        const token = await signToken(
          { id: user.id, username: user.username, email: user.email },
          secret
        );

        return jsonResponse({
          message: 'Login efetuado com sucesso!',
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            themePreference: user.themePreference || 'dark',
            accentColor: user.accentColor || 'cyan',
          },
        });
      } catch (err: any) {
        return jsonResponse({ error: err.message || 'Erro ao efetuar login.' }, 500);
      }
    }

    if (pathname === '/api/auth/me' && method === 'GET') {
      if (!userAuth) {
        return jsonResponse({ error: 'Não autenticado.' }, 401);
      }
      const { users } = await loadData(env);
      const user = users.find((u) => u.id === userAuth.id);
      if (!user) {
        return jsonResponse({ error: 'Usuário não encontrado.' }, 404);
      }
      return jsonResponse({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          themePreference: user.themePreference || 'dark',
          accentColor: user.accentColor || 'cyan',
        },
      });
    }

    if (pathname === '/api/auth/preferences' && method === 'PUT') {
      if (!userAuth) {
        return jsonResponse({ error: 'Não autenticado.' }, 401);
      }
      try {
        const body: any = await request.json().catch(() => ({}));
        const { themePreference, accentColor, currentPassword, newPassword } = body;
        const { users, scripts } = await loadData(env);
        const user = users.find((u) => u.id === userAuth.id);

        if (!user) {
          return jsonResponse({ error: 'Usuário não encontrado.' }, 404);
        }

        if (newPassword) {
          if (!currentPassword || !bcrypt.compareSync(currentPassword, user.passwordHash)) {
            return jsonResponse({ error: 'Senha atual incorreta.' }, 400);
          }
          if (newPassword.length < 6) {
            return jsonResponse({ error: 'A nova senha deve ter no mínimo 6 caracteres.' }, 400);
          }
          user.passwordHash = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
        }

        if (themePreference) user.themePreference = themePreference;
        if (accentColor) user.accentColor = accentColor;

        await saveData(env, users, scripts);

        return jsonResponse({
          message: 'Preferências atualizadas.',
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            themePreference: user.themePreference,
            accentColor: user.accentColor,
          },
        });
      } catch (err: any) {
        return jsonResponse({ error: err.message || 'Erro ao atualizar preferências.' }, 500);
      }
    }

    // =========================================================================
    // 4. SCRIPTS API (/api/scripts and /api/scripts/*)
    // =========================================================================
    // GET /api/scripts - List all scripts
    if (pathname === '/api/scripts' && method === 'GET') {
      try {
        const filter = url.searchParams.get('filter') || 'all';
        const search = url.searchParams.get('search') || '';
        const scope = url.searchParams.get('scope') || 'mine';

        const { scripts } = await loadData(env);
        let list: Script[] = [];

        if (userAuth && scope !== 'explore') {
          list = scripts.filter((s) => s.userId === userAuth.id);
        } else {
          list = scripts.filter((s) => !s.isPasswordProtected || (userAuth && s.userId === userAuth.id));
        }

        if (filter === 'public') {
          list = list.filter((s) => !s.isPasswordProtected);
        } else if (filter === 'protected') {
          list = list.filter((s) => s.isPasswordProtected);
        }

        if (search.trim()) {
          const q = search.trim().toLowerCase();
          list = list.filter(
            (s) =>
              s.title.toLowerCase().includes(q) ||
              s.description.toLowerCase().includes(q) ||
              s.id.toLowerCase().includes(q) ||
              (s.category && s.category.toLowerCase().includes(q))
          );
        }

        const sanitized = list.map((s) => {
          const isOwner = Boolean(userAuth && s.userId === userAuth.id);
          return {
            id: s.id,
            userId: s.userId,
            authorUsername: s.authorUsername,
            title: s.title,
            category: s.category || 'Geral',
            description: s.description || '',
            thumbnailUrl: s.thumbnailUrl || '',
            codeLength: s.code ? s.code.length : 0,
            isPasswordProtected: Boolean(s.isPasswordProtected),
            accessCount: s.accessCount || 0,
            lastAccessedAt: s.lastAccessedAt,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
            accessKeysCount: s.accessKeys ? s.accessKeys.length : 0,
            accessKeys: isOwner ? s.accessKeys || [] : [],
            isOwner,
          };
        });

        return jsonResponse({ scripts: sanitized });
      } catch (err: any) {
        return jsonResponse({ error: 'Erro ao listar scripts.', scripts: [] }, 500);
      }
    }

    // POST /api/scripts - Create new script
    if (pathname === '/api/scripts' && method === 'POST') {
      if (!userAuth) {
        return jsonResponse(
          { error: 'Você precisa estar conectado à sua conta para publicar e gerenciar scripts.' },
          401
        );
      }

      try {
        const body: any = await request.json().catch(() => ({}));
        const { title, category = 'Geral', description = '', code, thumbnailUrl = '', isPasswordProtected = false, password = '' } = body;

        if (!title || typeof title !== 'string' || !title.trim()) {
          return jsonResponse({ error: 'O título do script é obrigatório.' }, 400);
        }
        if (!code || typeof code !== 'string' || !code.trim()) {
          return jsonResponse({ error: 'O código Luau não pode estar vazio.' }, 400);
        }

        let passwordHash: string | undefined = undefined;
        const accessKeys: AccessKey[] = [];

        if (isPasswordProtected) {
          if (!password || typeof password !== 'string' || password.length < 4) {
            return jsonResponse({ error: 'Scripts protegidos requerem uma senha com no mínimo 4 caracteres.' }, 400);
          }
          passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
          accessKeys.push({
            key: generateAccessKey(),
            name: 'Chave Principal (Gerada automaticamente)',
            createdAt: new Date().toISOString(),
          });
        }

        const { users, scripts } = await loadData(env);
        const scriptId = generateId();

        const newScript: Script = {
          id: scriptId,
          userId: userAuth.id,
          authorUsername: userAuth.username,
          title: title.trim().slice(0, 100),
          category: typeof category === 'string' ? category.trim() : 'Geral',
          description: typeof description === 'string' ? description.trim().slice(0, 500) : '',
          code,
          thumbnailUrl: typeof thumbnailUrl === 'string' ? thumbnailUrl.trim() : '',
          isPasswordProtected: Boolean(isPasswordProtected),
          passwordHash,
          accessKeys,
          accessCount: 0,
          lastAccessedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        scripts.unshift(newScript);
        await saveData(env, users, scripts);

        return jsonResponse(
          {
            message: 'Script publicado com sucesso!',
            script: {
              ...newScript,
              isOwner: true,
              isUnlocked: true,
            },
          },
          201
        );
      } catch (err: any) {
        return jsonResponse({ error: err.message || 'Erro ao criar script.' }, 500);
      }
    }

    // Match /api/scripts/:id and subroutes
    const scriptMatch = pathname.match(/^\/api\/scripts\/([^/?#]+)(?:\/(.*))?$/);
    if (scriptMatch) {
      const scriptId = scriptMatch[1].replace(/\.lua$/i, '');
      const subAction = scriptMatch[2] || '';
      const { users, scripts } = await loadData(env);
      const script = scripts.find((s) => s.id === scriptId || s.id.toLowerCase() === scriptId.toLowerCase());

      if (!script) {
        return jsonResponse({ error: 'Script não encontrado com o ID especificado.' }, 404);
      }

      const isOwner = Boolean(userAuth && script.userId === userAuth.id);

      // GET /api/scripts/:id
      if (!subAction && method === 'GET') {
        const key = url.searchParams.get('key');
        const pass = url.searchParams.get('password');

        let isAuthorized = false;
        if (!script.isPasswordProtected || isOwner) {
          isAuthorized = true;
        } else if (key && script.accessKeys && script.accessKeys.some((k) => k.key === key)) {
          isAuthorized = true;
        } else if (pass && script.passwordHash && bcrypt.compareSync(pass, script.passwordHash)) {
          isAuthorized = true;
        }

        return jsonResponse({
          script: {
            id: script.id,
            userId: script.userId,
            authorUsername: script.authorUsername,
            title: script.title,
            category: script.category,
            description: script.description,
            thumbnailUrl: script.thumbnailUrl,
            isPasswordProtected: script.isPasswordProtected,
            accessCount: script.accessCount,
            lastAccessedAt: script.lastAccessedAt,
            createdAt: script.createdAt,
            updatedAt: script.updatedAt,
            isOwner,
            isUnlocked: isAuthorized,
            code: isAuthorized ? script.code : '',
            accessKeys: isOwner ? script.accessKeys || [] : [],
          },
        });
      }

      // PUT /api/scripts/:id - Update script
      if (!subAction && method === 'PUT') {
        if (!userAuth || !isOwner) {
          return jsonResponse({ error: 'Você não tem permissão para alterar este script. Apenas o criador pode editá-lo.' }, 403);
        }

        const body: any = await request.json().catch(() => ({}));
        const { title, category, description, code, thumbnailUrl, isPasswordProtected, password } = body;

        if (title !== undefined) script.title = String(title).trim().slice(0, 100);
        if (category !== undefined) script.category = String(category).trim();
        if (description !== undefined) script.description = String(description).trim().slice(0, 500);
        if (code !== undefined) script.code = String(code);
        if (thumbnailUrl !== undefined) script.thumbnailUrl = String(thumbnailUrl).trim();

        if (isPasswordProtected !== undefined) {
          script.isPasswordProtected = Boolean(isPasswordProtected);
          if (script.isPasswordProtected && password && password.length >= 4) {
            script.passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
          } else if (!script.isPasswordProtected) {
            script.passwordHash = undefined;
          }
        }

        script.updatedAt = new Date().toISOString();
        await saveData(env, users, scripts);

        return jsonResponse({
          message: 'Script atualizado com sucesso!',
          script: {
            ...script,
            isOwner: true,
            isUnlocked: true,
          },
        });
      }

      // DELETE /api/scripts/:id - Delete script
      if (!subAction && method === 'DELETE') {
        if (!userAuth || !isOwner) {
          return jsonResponse({ error: 'Você não tem permissão para excluir este script. Apenas o criador pode apagá-lo.' }, 403);
        }

        const idx = scripts.findIndex((s) => s.id === script.id);
        if (idx !== -1) {
          scripts.splice(idx, 1);
          await saveData(env, users, scripts);
          const kv = await getKV(env);
          if (kv) {
            try {
              await kv.delete('script_' + script.id.toLowerCase());
            } catch {}
          }
        }

        return jsonResponse({ message: 'Script excluído com sucesso.' });
      }

      // POST /api/scripts/:id/unlock - Unlock with password
      if (subAction === 'unlock' && method === 'POST') {
        const body: any = await request.json().catch(() => ({}));
        const { password } = body;

        if (!password || !script.passwordHash || !bcrypt.compareSync(password, script.passwordHash)) {
          return jsonResponse({ error: 'Senha incorreta para desbloquear o script.' }, 401);
        }

        return jsonResponse({
          message: 'Desbloqueado com sucesso!',
          code: script.code,
          accessKey: script.accessKeys && script.accessKeys.length > 0 ? script.accessKeys[0].key : undefined,
        });
      }

      // POST /api/scripts/:id/keys - Create Access Key
      if (subAction === 'keys' && method === 'POST') {
        if (!userAuth || !isOwner) {
          return jsonResponse({ error: 'Apenas o autor pode gerar novas chaves de acesso.' }, 403);
        }

        const body: any = await request.json().catch(() => ({}));
        const name = body?.name || 'Nova Chave';
        const newKey: AccessKey = {
          key: generateAccessKey(),
          name: String(name).trim().slice(0, 50),
          createdAt: new Date().toISOString(),
        };

        script.accessKeys = script.accessKeys || [];
        script.accessKeys.push(newKey);
        await saveData(env, users, scripts);

        return jsonResponse({ message: 'Chave criada com sucesso!', accessKey: newKey }, 201);
      }

      // DELETE /api/scripts/:id/keys/:key - Delete Access Key
      if (subAction.startsWith('keys/') && method === 'DELETE') {
        if (!userAuth || !isOwner) {
          return jsonResponse({ error: 'Apenas o autor pode revogar chaves de acesso.' }, 403);
        }

        const keyToDelete = subAction.replace('keys/', '').trim();
        script.accessKeys = (script.accessKeys || []).filter((k) => k.key !== keyToDelete);
        await saveData(env, users, scripts);

        return jsonResponse({ message: 'Chave de acesso revogada com sucesso.' });
      }
    }

    // =========================================================================
    // 5. UNMATCHED /api/* -> JSON 404 (NEVER HTML)
    // =========================================================================
    if (pathname.startsWith('/api/')) {
      return jsonResponse({ error: 'Endpoint da API não encontrado.' }, 404);
    }

    // =========================================================================
    // 6. FRONTEND STATIC ASSETS & SPA FALLBACK (Cloudflare Workers Assets)
    // =========================================================================
    if (env.ASSETS) {
      return await env.ASSETS.fetch(request);
    }

    return new Response('ScriptsGR Server Ready', {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  },
};
