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

const DEFAULT_DEMO_SCRIPTS: StoredScript[] = [];

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
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
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
