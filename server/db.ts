import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  themePreference?: string;
  accentColor?: string;
}

export interface AccessKey {
  key: string;
  name: string;
  createdAt: string;
}

export interface Script {
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

export interface DatabaseSchema {
  users: User[];
  scripts: Script[];
}

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = isServerless ? '/tmp/data' : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure directory exists safely
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('Could not create DATA_DIR:', err);
}

function loadDatabase(): DatabaseSchema {
  try {
    if (isServerless) {
      if (!fs.existsSync(DB_FILE)) {
        // First try to copy bundled data/db.json from repo
        const bundledFile = path.join(process.cwd(), 'data', 'db.json');
        if (fs.existsSync(bundledFile)) {
          const raw = fs.readFileSync(bundledFile, 'utf-8');
          fs.writeFileSync(DB_FILE, raw, 'utf-8');
          return JSON.parse(raw);
        }
        const initialData: DatabaseSchema = seedInitialData();
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
        return initialData;
      }
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }

    if (!fs.existsSync(DB_FILE)) {
      const initialData: DatabaseSchema = seedInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading database, initializing fresh:', err);
    const initialData = seedInitialData();
    saveDatabase(initialData);
    return initialData;
  }
}

function saveDatabase(data: DatabaseSchema): void {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to save database atomically:', err);
  }
}

function seedInitialData(): DatabaseSchema {
  const demoSalt = bcrypt.genSaltSync(10);
  const demoHash = bcrypt.hashSync('demo123', demoSalt);
  const userId = 'user_demo_001';

  const defaultPublicScript: Script = {
    id: 'fly-speed-v2',
    userId,
    authorUsername: 'demo',
    title: 'Luau Speed & Fly Utility',
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

-- Exemplo de função utilitária
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
    isPasswordProtected: false,
    accessKeys: [],
    accessCount: 142,
    lastAccessedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  };

  const protectedSalt = bcrypt.genSaltSync(10);
  const protectedHash = bcrypt.hashSync('segredo123', protectedSalt);
  const defaultProtectedScript: Script = {
    id: 'admin-hub-vip',
    userId,
    authorUsername: 'demo',
    title: 'Admin Hub VIP (Protegido)',
    description: 'Script restrito para membros VIP. Exige chave ou autenticação prévia.',
    code: `--[[
    Admin Hub VIP - Acesso Restrito
    Autenticado com sucesso via ScriptsGR Security Key!
]]

local Players = game:GetService("Players")
local player = Players.LocalPlayer

print("=========================================")
print("  SCRIPTSGR VIP HUB ATIVADO COM SUCESSO! ")
print("  Usuário autenticado: " .. tostring(player.Name))
print("=========================================")

local function showWelcomeGUI()
    -- Lógica do painel VIP aqui
    warn("[ScriptsGR VIP] Inicializando módulos protegidos...")
end

showWelcomeGUI()
`,
    isPasswordProtected: true,
    passwordHash: protectedHash,
    accessKeys: [
      {
        key: 'key_demo_vip_access_2026',
        name: 'Chave Padrão para Testes',
        createdAt: new Date().toISOString(),
      }
    ],
    accessCount: 58,
    lastAccessedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    users: [
      {
        id: userId,
        username: 'demo',
        email: 'demo@luauraw.dev',
        passwordHash: demoHash,
        createdAt: new Date().toISOString(),
        themePreference: 'dark',
        accentColor: 'cyan',
      }
    ],
    scripts: []
  };
}

let dbInstance = loadDatabase();

export const db = {
  reload(): void {
    dbInstance = loadDatabase();
  },
  getUsers(): User[] {
    return dbInstance.users;
  },
  getUserById(id: string): User | undefined {
    return dbInstance.users.find(u => u.id === id);
  },
  getUserByEmailOrUsername(identifier: string): User | undefined {
    const idf = identifier.trim().toLowerCase();
    return dbInstance.users.find(u => u.email.toLowerCase() === idf || u.username.toLowerCase() === idf);
  },
  addUser(user: User): User {
    dbInstance.users.push(user);
    saveDatabase(dbInstance);
    return user;
  },
  updateUser(id: string, updates: Partial<User>): User | null {
    const idx = dbInstance.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    dbInstance.users[idx] = { ...dbInstance.users[idx], ...updates };
    saveDatabase(dbInstance);
    return dbInstance.users[idx];
  },
  getScripts(): Script[] {
    return dbInstance.scripts;
  },
  getScriptById(id: string): Script | undefined {
    if (!id || typeof id !== 'string') return undefined;
    const target = id.trim().replace(/\.lua$/i, '');
    return dbInstance.scripts.find(s => s.id === target || s.id.toLowerCase() === target.toLowerCase());
  },
  getUserScripts(userId: string): Script[] {
    return dbInstance.scripts.filter(s => s.userId === userId);
  },
  addScript(script: Script): Script {
    dbInstance.scripts.unshift(script);
    saveDatabase(dbInstance);
    return script;
  },
  updateScript(id: string, updates: Partial<Script>): Script | null {
    const idx = dbInstance.scripts.findIndex(s => s.id === id);
    if (idx === -1) return null;
    dbInstance.scripts[idx] = {
      ...dbInstance.scripts[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveDatabase(dbInstance);
    return dbInstance.scripts[idx];
  },
  incrementScriptAccess(id: string): void {
    const script = dbInstance.scripts.find(s => s.id === id);
    if (script) {
      script.accessCount = (script.accessCount || 0) + 1;
      script.lastAccessedAt = new Date().toISOString();
      saveDatabase(dbInstance);
    }
  },
  deleteScript(id: string, userId: string): boolean {
    const initialLen = dbInstance.scripts.length;
    dbInstance.scripts = dbInstance.scripts.filter(s => !(s.id === id && s.userId === userId));
    const deleted = dbInstance.scripts.length < initialLen;
    if (deleted) {
      saveDatabase(dbInstance);
    }
    return deleted;
  },
  generateUniqueId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    let attempts = 0;
    do {
      id = '';
      const bytes = crypto.randomBytes(6);
      for (let i = 0; i < 6; i++) {
        id += chars[bytes[i] % chars.length];
      }
      attempts++;
    } while (dbInstance.scripts.some(s => s.id === id) && attempts < 100);
    return id;
  },
  generateAccessKey(): string {
    return 'key_' + crypto.randomBytes(16).toString('hex');
  }
};
