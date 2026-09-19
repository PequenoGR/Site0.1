import { ScriptItem, User, ThemeMode, AccentColor } from '../types';

const LOCAL_USERS_KEY = 'scriptsgr_local_users';
const LOCAL_SCRIPTS_KEY = 'scriptsgr_local_scripts';

interface StoredUser extends User {
  password: string;
}

interface StoredScript extends ScriptItem {
  passwordPlain?: string;
}

const DEFAULT_DEMO_USER: StoredUser = {
  id: 'user_demo_001',
  username: 'demo',
  email: 'demo@luauraw.dev',
  password: 'demo123',
  createdAt: '2026-09-16T20:00:00.000Z',
  themePreference: 'dark',
  accentColor: 'cyan',
};

const DEFAULT_DEMO_SCRIPTS: StoredScript[] = [
  {
    id: 'blox-fruit',
    userId: 'user_demo_001',
    authorUsername: 'demo',
    title: 'Blox Fruit',
    category: 'Blox Fruit',
    description: 'Auto Farm, Raid, Mastery e Sea Events para Blox Fruits.',
    code: `local INTERFACE_URL = "https://raw.githubusercontent.com/PequenoGR/Gr_Script/refs/heads/main/InterfaceScript"
local ok, err = pcall(function()
    local source = game:HttpGet(INTERFACE_URL)
    local fn = loadstring(source)
    if fn then fn() end
end)
print("[ScriptsGR] Blox Fruit Script carregado!")`,
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    isPasswordProtected: false,
    accessKeys: [],
    accessCount: 200,
    lastAccessedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'universal',
    userId: 'user_demo_001',
    authorUsername: 'demo',
    title: 'Universal',
    category: 'Universal',
    description: 'Módulos universais de ESP, Fly, Speed e utilitários.',
    code: `local INTERFACE_URL = "https://raw.githubusercontent.com/PequenoGR/Gr_Script/refs/heads/main/InterfaceScript"
local ok, err = pcall(function()
    local source = game:HttpGet(INTERFACE_URL)
    local fn = loadstring(source)
    if fn then fn() end
end)
print("[ScriptsGR] Universal Script carregado!")`,
    thumbnailUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80',
    isPasswordProtected: false,
    accessKeys: [],
    accessCount: 30,
    lastAccessedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'roube-um-egg',
    userId: 'user_demo_001',
    authorUsername: 'demo',
    title: 'Roube um Egg',
    category: 'Roube um Egg',
    description: 'Auto hatch, auto steal e multiplicador de ovos.',
    code: `local INTERFACE_URL = "https://raw.githubusercontent.com/PequenoGR/Gr_Script/refs/heads/main/InterfaceScript"
local ok, err = pcall(function()
    local source = game:HttpGet(INTERFACE_URL)
    local fn = loadstring(source)
    if fn then fn() end
end)
print("[ScriptsGR] Roube um Egg Script carregado!")`,
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    isPasswordProtected: false,
    accessKeys: [],
    accessCount: 249,
    lastAccessedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'roube-um-brainrot',
    userId: 'user_demo_001',
    authorUsername: 'demo',
    title: 'Roube um Brainrot',
    category: 'Roube um Brainrot',
    description: 'Auto farm de dinheiro, secret pets e teleporte.',
    code: `local INTERFACE_URL = "https://raw.githubusercontent.com/PequenoGR/Gr_Script/refs/heads/main/InterfaceScript"
local ok, err = pcall(function()
    local source = game:HttpGet(INTERFACE_URL)
    local fn = loadstring(source)
    if fn then fn() end
end)
print("[ScriptsGR] Roube um Brainrot Script carregado!")`,
    thumbnailUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
    isPasswordProtected: false,
    accessKeys: [],
    accessCount: 333,
    lastAccessedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
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
    description: 'Script utilitário GR Hub para execução direta via Roblox loadstring com proteção anti-vazamento de código.',
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

function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (!raw) {
      const initial = [DEFAULT_DEMO_USER];
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.some((u) => u.username === 'demo')) {
      const merged = [DEFAULT_DEMO_USER, ...(Array.isArray(parsed) ? parsed : [])];
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch {
    return [DEFAULT_DEMO_USER];
  }
}

function saveStoredUsers(users: StoredUser[]): void {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save local users', e);
  }
}

function getStoredScripts(): StoredScript[] {
  try {
    const raw = localStorage.getItem(LOCAL_SCRIPTS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_SCRIPTS_KEY, JSON.stringify(DEFAULT_DEMO_SCRIPTS));
      return DEFAULT_DEMO_SCRIPTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(LOCAL_SCRIPTS_KEY, JSON.stringify(DEFAULT_DEMO_SCRIPTS));
      return DEFAULT_DEMO_SCRIPTS;
    }
    return parsed;
  } catch {
    return DEFAULT_DEMO_SCRIPTS;
  }
}

function saveStoredScripts(scripts: StoredScript[]): void {
  try {
    localStorage.setItem(LOCAL_SCRIPTS_KEY, JSON.stringify(scripts));
  } catch (e) {
    console.error('Failed to save local scripts', e);
  }
}

export const localStore = {
  login(identifier: string, pass: string): { token: string; user: User; message: string } {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();
    const users = getStoredUsers();

    const user = users.find(
      (u) =>
        (u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId) &&
        u.password === cleanPass
    );

    if (!user) {
      throw new Error('Usuário ou senha incorretos.');
    }

    const { password: _, ...safeUser } = user;
    const token = `local_token_${user.id}_${Date.now()}`;

    return {
      token,
      user: safeUser,
      message: 'Login realizado com sucesso!',
    };
  },

  register(username: string, email: string, pass: string): { token: string; user: User; message: string } {
    const cleanUser = username.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanUser || cleanUser.length < 3) {
      throw new Error('O usuário deve ter pelo menos 3 caracteres.');
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('E-mail inválido.');
    }
    if (!cleanPass || cleanPass.length < 6) {
      throw new Error('A senha deve ter pelo menos 6 caracteres.');
    }

    const users = getStoredUsers();
    const exists = users.some(
      (u) => u.username.toLowerCase() === cleanUser.toLowerCase() || u.email.toLowerCase() === cleanEmail
    );

    if (exists) {
      throw new Error('Usuário ou e-mail já cadastrado.');
    }

    const newUser: StoredUser = {
      id: `user_${Math.random().toString(36).substring(2, 9)}`,
      username: cleanUser,
      email: cleanEmail,
      password: cleanPass,
      createdAt: new Date().toISOString(),
      themePreference: 'dark',
      accentColor: 'cyan',
    };

    users.push(newUser);
    saveStoredUsers(users);

    const { password: _, ...safeUser } = newUser;
    const token = `local_token_${newUser.id}_${Date.now()}`;

    return {
      token,
      user: safeUser,
      message: 'Conta criada com sucesso!',
    };
  },

  getMe(currentUserId?: string): { user: User } {
    const users = getStoredUsers();
    const user = users.find((u) => u.id === currentUserId) || DEFAULT_DEMO_USER;
    const { password: _, ...safeUser } = user;
    return { user: safeUser };
  },

  updatePreferences(
    currentUserId: string,
    data: { themePreference?: string; accentColor?: string; currentPassword?: string; newPassword?: string }
  ): { user: User; message: string } {
    const users = getStoredUsers();
    const index = users.findIndex((u) => u.id === currentUserId);
    if (index === -1) {
      throw new Error('Usuário não encontrado.');
    }

    if (data.newPassword) {
      if (users[index].password !== data.currentPassword) {
        throw new Error('Senha atual incorreta.');
      }
      users[index].password = data.newPassword;
    }

    if (data.themePreference) users[index].themePreference = data.themePreference as ThemeMode;
    if (data.accentColor) users[index].accentColor = data.accentColor as AccentColor;

    saveStoredUsers(users);
    const { password: _, ...safeUser } = users[index];
    return { user: safeUser, message: 'Preferências salvas.' };
  },

  getScripts(params?: { filter?: string; search?: string; scope?: string }, currentUserId?: string): { scripts: ScriptItem[] } {
    let scripts = getStoredScripts();

    if (params?.search) {
      const q = params.search.toLowerCase();
      scripts = scripts.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.category && s.category.toLowerCase().includes(q)) ||
          (s.description && s.description.toLowerCase().includes(q))
      );
    }

    if (params?.scope === 'mine' && currentUserId) {
      scripts = scripts.filter((s) => s.userId === currentUserId);
    }

    const safeScripts: ScriptItem[] = scripts.map((s) => {
      const isOwner = Boolean(currentUserId && s.userId === currentUserId);
      return {
        ...s,
        code: s.isPasswordProtected && !isOwner ? '-- [PROTEGIDO] Insira a senha para visualizar o código' : s.code,
        isOwner,
      };
    });

    return { scripts: safeScripts };
  },

  getScriptById(id: string, key?: string, pass?: string, currentUserId?: string): { script: ScriptItem } {
    const scripts = getStoredScripts();
    const found = scripts.find((s) => s.id === id);
    if (!found) {
      throw new Error('Script não encontrado.');
    }

    const isOwner = Boolean(currentUserId && found.userId === currentUserId);
    let hasAccess = !found.isPasswordProtected || isOwner;

    if (pass && found.passwordPlain && pass === found.passwordPlain) {
      hasAccess = true;
    }

    if (key && found.accessKeys && found.accessKeys.some((k) => k.key === key)) {
      hasAccess = true;
    }

    return {
      script: {
        ...found,
        code: hasAccess ? found.code : '-- [PROTEGIDO] Insira a senha para visualizar o código',
        isOwner,
      },
    };
  },

  createScript(
    payload: {
      title: string;
      category?: string;
      description?: string;
      thumbnailUrl?: string;
      code: string;
      isPasswordProtected: boolean;
      password?: string;
    },
    currentUser?: User | null
  ): { message: string; script: ScriptItem } {
    const scripts = getStoredScripts();
    const newId = Math.random().toString(36).substring(2, 8);

    const userId = currentUser?.id || 'user_demo_001';
    const authorUsername = currentUser?.username || 'demo';

    const newScript: StoredScript = {
      id: newId,
      userId,
      authorUsername,
      title: payload.title.trim(),
      category: payload.category || 'Geral',
      description: payload.description || '',
      thumbnailUrl: payload.thumbnailUrl || '',
      code: payload.code,
      isPasswordProtected: payload.isPasswordProtected,
      passwordPlain: payload.password?.trim() || undefined,
      accessKeys: [],
      accessCount: 0,
      lastAccessedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isOwner: true,
    };

    scripts.unshift(newScript);
    saveStoredScripts(scripts);

    return {
      message: 'Script publicado com sucesso!',
      script: newScript,
    };
  },

  updateScript(
    id: string,
    payload: {
      title?: string;
      category?: string;
      description?: string;
      thumbnailUrl?: string;
      code?: string;
      isPasswordProtected?: boolean;
      password?: string;
    },
    currentUserId?: string
  ): { message: string; script: ScriptItem } {
    const scripts = getStoredScripts();
    const index = scripts.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error('Script não encontrado.');
    }

    const current = scripts[index];
    if (payload.title !== undefined) current.title = payload.title.trim();
    if (payload.category !== undefined) current.category = payload.category;
    if (payload.description !== undefined) current.description = payload.description;
    if (payload.thumbnailUrl !== undefined) current.thumbnailUrl = payload.thumbnailUrl;
    if (payload.code !== undefined) current.code = payload.code;
    if (payload.isPasswordProtected !== undefined) current.isPasswordProtected = payload.isPasswordProtected;
    if (payload.password !== undefined && payload.password.trim()) {
      current.passwordPlain = payload.password.trim();
    }
    current.updatedAt = new Date().toISOString();

    scripts[index] = current;
    saveStoredScripts(scripts);

    return {
      message: 'Script atualizado com sucesso!',
      script: {
        ...current,
        isOwner: Boolean(currentUserId && current.userId === currentUserId),
      },
    };
  },

  deleteScript(id: string): { message: string } {
    const scripts = getStoredScripts();
    const filtered = scripts.filter((s) => s.id !== id);
    saveStoredScripts(filtered);
    return { message: 'Script excluído com sucesso.' };
  },

  unlockScript(id: string, pass: string): { message: string; code: string; accessKey?: string } {
    const scripts = getStoredScripts();
    const script = scripts.find((s) => s.id === id);
    if (!script) {
      throw new Error('Script não encontrado.');
    }
    if (script.passwordPlain && script.passwordPlain !== pass) {
      throw new Error('Senha incorreta.');
    }
    return {
      message: 'Script desbloqueado com sucesso!',
      code: script.code || '',
    };
  },

  createAccessKey(id: string, name: string): { message: string; accessKey: { key: string; name: string; createdAt: string } } {
    const scripts = getStoredScripts();
    const script = scripts.find((s) => s.id === id);
    if (!script) {
      throw new Error('Script não encontrado.');
    }
    const newKey = {
      key: `key_${Math.random().toString(36).substring(2, 12)}`,
      name: name.trim() || 'Chave de Acesso',
      createdAt: new Date().toISOString(),
    };
    if (!script.accessKeys) script.accessKeys = [];
    script.accessKeys.push(newKey);
    saveStoredScripts(scripts);
    return {
      message: 'Chave criada com sucesso!',
      accessKey: newKey,
    };
  },

  revokeAccessKey(id: string, key: string): { message: string } {
    const scripts = getStoredScripts();
    const script = scripts.find((s) => s.id === id);
    if (script && script.accessKeys) {
      script.accessKeys = script.accessKeys.filter((k) => k.key !== key);
      saveStoredScripts(scripts);
    }
    return { message: 'Chave revogada com sucesso.' };
  },

  fetchRaw(id: string, key?: string): { status: number; text: string } {
    const scripts = getStoredScripts();
    const script = scripts.find((s) => s.id === id);
    if (!script) {
      return { status: 404, text: 'Script não encontrado (404)' };
    }
    if (script.isPasswordProtected) {
      const validKey = key && script.accessKeys && script.accessKeys.some((k) => k.key === key);
      if (!validKey) {
        return { status: 403, text: '-- [ACESSO NEGADO] Script protegido por chave.' };
      }
    }
    return { status: 200, text: script.code || '' };
  },
};
