import { ScriptItem, User } from '../types';
import { localStore } from './localStore';

const TOKEN_KEY = 'luauraw_token';
const USER_KEY = 'luauraw_user';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  getUser: (): User | null => {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setUser: (user: User) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  removeUser: () => localStorage.removeItem(USER_KEY),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

let fallbackToLocal = false;

function isStaticOrNotFound(status: number, data: any): boolean {
  if (status === 404 || status === 502 || status === 503 || status === 504) return true;
  if (typeof data === 'string') {
    const lower = data.toLowerCase();
    if (lower.includes('not_found') || lower.includes('could not be found') || lower.includes('<!doctype') || lower.includes('gru1::')) {
      return true;
    }
  }
  return false;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (fallbackToLocal) {
    throw new Error('FALLBACK_TO_LOCAL');
  }

  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      ...options,
      headers,
    });
  } catch (err) {
    fallbackToLocal = true;
    throw new Error('FALLBACK_TO_LOCAL');
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    if (isStaticOrNotFound(response.status, data)) {
      fallbackToLocal = true;
      throw new Error('FALLBACK_TO_LOCAL');
    }
    const errorMessage =
      (typeof data === 'object' && data?.error) ||
      (typeof data === 'string' && data) ||
      'Erro na requisição.';
    throw new Error(errorMessage);
  }

  return data as T;
}

export const api = {
  // Auth
  async login(identifier: string, password: string): Promise<{ token: string; user: User; message: string }> {
    try {
      const res = await request<{ token: string; user: User; message: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });
      authStorage.setToken(res.token);
      authStorage.setUser(res.user);
      return res;
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_LOCAL' || fallbackToLocal) {
        const localRes = localStore.login(identifier, password);
        authStorage.setToken(localRes.token);
        authStorage.setUser(localRes.user);
        return localRes;
      }
      throw err;
    }
  },

  async register(username: string, email: string, password: string): Promise<{ token: string; user: User; message: string }> {
    try {
      const res = await request<{ token: string; user: User; message: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      });
      authStorage.setToken(res.token);
      authStorage.setUser(res.user);
      return res;
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_LOCAL' || fallbackToLocal) {
        const localRes = localStore.register(username, email, password);
        authStorage.setToken(localRes.token);
        authStorage.setUser(localRes.user);
        return localRes;
      }
      throw err;
    }
  },

  async getMe(): Promise<{ user: User }> {
    try {
      const res = await request<{ user: User }>('/api/auth/me');
      authStorage.setUser(res.user);
      return res;
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_LOCAL' || fallbackToLocal) {
        const currentUser = authStorage.getUser();
        const localRes = localStore.getMe(currentUser?.id);
        authStorage.setUser(localRes.user);
        return localRes;
      }
      throw err;
    }
  },

  async updatePreferences(data: {
    themePreference?: string;
    accentColor?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<{ user: User; message: string }> {
    try {
      const res = await request<{ user: User; message: string }>('/api/auth/preferences', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      authStorage.setUser(res.user);
      return res;
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_LOCAL' || fallbackToLocal) {
        const currentUser = authStorage.getUser();
        const localRes = localStore.updatePreferences(currentUser?.id || 'user_demo_001', data);
        authStorage.setUser(localRes.user);
        return localRes;
      }
      throw err;
    }
  },

  // Scripts
  async getScripts(params?: { filter?: string; search?: string; scope?: string }): Promise<{ scripts: ScriptItem[] }> {
    try {
      const query = new URLSearchParams();
      if (params?.filter) query.set('filter', params.filter);
      if (params?.search) query.set('search', params.search);
      if (params?.scope) query.set('scope', params.scope);
      return await request<{ scripts: ScriptItem[] }>(`/api/scripts?${query.toString()}`);
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_LOCAL' || fallbackToLocal) {
        const currentUser = authStorage.getUser();
        return localStore.getScripts(params, currentUser?.id);
      }
      throw err;
    }
  },

  async getScriptById(id: string, key?: string, password?: string): Promise<{ script: ScriptItem }> {
    try {
      const query = new URLSearchParams();
      if (key) query.set('key', key);
      if (password) query.set('password', password);
      const qs = query.toString() ? `?${query.toString()}` : '';
      return await request<{ script: ScriptItem }>(`/api/scripts/${id}${qs}`);
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_LOCAL' || fallbackToLocal) {
        const currentUser = authStorage.getUser();
        return localStore.getScriptById(id, key, password, currentUser?.id);
      }
      throw err;
    }
  },

  async createScript(payload: {
    title: string;
    category?: string;
    description?: string;
    thumbnailUrl?: string;
    code: string;
    isPasswordProtected: boolean;
    password?: string;
  }): Promise<{ message: string; script: ScriptItem }> {
    try {
      return await request<{ message: string; script: ScriptItem }>('/api/scripts', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_LOCAL' || fallbackToLocal) {
        const currentUser = authStorage.getUser();
        return localStore.createScript(payload, currentUser);
      }
      throw err;
    }
  },

  async updateScript(
    id: string,
    payload: {
      title?: string;
      category?: string;
      description?: string;
      thumbnailUrl?: string;
      code?: string;
      isPasswordProtected?: boolean;
      password?: string;
    }
  ): Promise<{ message: string; script: ScriptItem }> {
    try {
      return await request<{ message: string; script: ScriptItem }>(`/api/scripts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_LOCAL' || fallbackToLocal) {
        const currentUser = authStorage.getUser();
        return localStore.updateScript(id, payload, currentUser?.id);
      }
      throw err;
    }
  },

  async deleteScript(id: string): Promise<{ message: string }> {
    try {
      return await request<{ message: string }>(`/api/scripts/${id}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_LOCAL' || fallbackToLocal) {
        return localStore.deleteScript(id);
      }
      throw err;
    }
  },

  async unlockScript(id: string, password: string): Promise<{ message: string; code: string; accessKey?: string }> {
    try {
      return await request<{ message: string; code: string; accessKey?: string }>(`/api/scripts/${id}/unlock`, {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_LOCAL' || fallbackToLocal) {
        return localStore.unlockScript(id, password);
      }
      throw err;
    }
  },

  async createAccessKey(id: string, name: string): Promise<{ message: string; accessKey: { key: string; name: string; createdAt: string } }> {
    try {
      return await request<{ message: string; accessKey: { key: string; name: string; createdAt: string } }>(`/api/scripts/${id}/keys`, {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_LOCAL' || fallbackToLocal) {
        return localStore.createAccessKey(id, name);
      }
      throw err;
    }
  },

  async revokeAccessKey(id: string, key: string): Promise<{ message: string }> {
    try {
      return await request<{ message: string }>(`/api/scripts/${id}/keys/${key}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_LOCAL' || fallbackToLocal) {
        return localStore.revokeAccessKey(id, key);
      }
      throw err;
    }
  },

  // Test RAW endpoint
  async fetchRaw(id: string, key?: string): Promise<{ status: number; text: string }> {
    const url = key ? `/raw/${id}?key=${encodeURIComponent(key)}` : `/raw/${id}`;
    try {
      const res = await fetch(url);
      const text = await res.text();
      if (isStaticOrNotFound(res.status, text)) {
        return localStore.fetchRaw(id, key);
      }
      return { status: res.status, text };
    } catch {
      return localStore.fetchRaw(id, key);
    }
  },
};
