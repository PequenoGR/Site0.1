import { ScriptItem, User } from '../types';

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

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMessage = (typeof data === 'object' && data?.error) || (typeof data === 'string' && data) || 'Erro na requisição.';
    throw new Error(errorMessage);
  }

  return data as T;
}

export const api = {
  // Auth
  async login(identifier: string, password: string): Promise<{ token: string; user: User; message: string }> {
    const res = await request<{ token: string; user: User; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    authStorage.setToken(res.token);
    authStorage.setUser(res.user);
    return res;
  },

  async register(username: string, email: string, password: string): Promise<{ token: string; user: User; message: string }> {
    const res = await request<{ token: string; user: User; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    authStorage.setToken(res.token);
    authStorage.setUser(res.user);
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    const res = await request<{ user: User }>('/api/auth/me');
    authStorage.setUser(res.user);
    return res;
  },

  async updatePreferences(data: {
    themePreference?: string;
    accentColor?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<{ user: User; message: string }> {
    const res = await request<{ user: User; message: string }>('/api/auth/preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    authStorage.setUser(res.user);
    return res;
  },

  // Scripts
  async getScripts(params?: { filter?: string; search?: string; scope?: string }): Promise<{ scripts: ScriptItem[] }> {
    const query = new URLSearchParams();
    if (params?.filter) query.set('filter', params.filter);
    if (params?.search) query.set('search', params.search);
    if (params?.scope) query.set('scope', params.scope);
    return request<{ scripts: ScriptItem[] }>(`/api/scripts?${query.toString()}`);
  },

  async getScriptById(id: string, key?: string, password?: string): Promise<{ script: ScriptItem }> {
    const query = new URLSearchParams();
    if (key) query.set('key', key);
    if (password) query.set('password', password);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ script: ScriptItem }>(`/api/scripts/${id}${qs}`);
  },

  async createScript(payload: {
    title: string;
    description?: string;
    code: string;
    isPasswordProtected: boolean;
    password?: string;
  }): Promise<{ message: string; script: ScriptItem }> {
    return request<{ message: string; script: ScriptItem }>('/api/scripts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateScript(
    id: string,
    payload: {
      title?: string;
      description?: string;
      code?: string;
      isPasswordProtected?: boolean;
      password?: string;
    }
  ): Promise<{ message: string; script: ScriptItem }> {
    return request<{ message: string; script: ScriptItem }>(`/api/scripts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteScript(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/scripts/${id}`, {
      method: 'DELETE',
    });
  },

  async unlockScript(id: string, password: string): Promise<{ message: string; code: string; accessKey?: string }> {
    return request<{ message: string; code: string; accessKey?: string }>(`/api/scripts/${id}/unlock`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },

  async createAccessKey(id: string, name: string): Promise<{ message: string; accessKey: { key: string; name: string; createdAt: string } }> {
    return request<{ message: string; accessKey: { key: string; name: string; createdAt: string } }>(`/api/scripts/${id}/keys`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  async revokeAccessKey(id: string, key: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/scripts/${id}/keys/${key}`, {
      method: 'DELETE',
    });
  },

  // Test RAW endpoint
  async fetchRaw(id: string, key?: string): Promise<{ status: number; text: string }> {
    const url = key ? `/raw/${id}?key=${encodeURIComponent(key)}` : `/raw/${id}`;
    const res = await fetch(url);
    const text = await res.text();
    return { status: res.status, text };
  }
};
