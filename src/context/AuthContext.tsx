import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { api, authStorage } from '../lib/api';
import { useTheme } from './ThemeContext';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (ident: string, pass: string) => Promise<void>;
  register: (user: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(authStorage.getUser());
  const [loading, setLoading] = useState<boolean>(true);
  const { setMode, setAccent } = useTheme();

  useEffect(() => {
    async function initAuth() {
      const token = authStorage.getToken();
      if (token) {
        try {
          const res = await api.getMe();
          setUser(res.user);
          if (res.user.themePreference) {
            setMode(res.user.themePreference as any);
          }
          if (res.user.accentColor) {
            setAccent(res.user.accentColor as any);
          }
        } catch {
          authStorage.clear();
          setUser(null);
        }
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const login = async (ident: string, pass: string) => {
    const res = await api.login(ident, pass);
    setUser(res.user);
    if (res.user.themePreference) setMode(res.user.themePreference as any);
    if (res.user.accentColor) setAccent(res.user.accentColor as any);
  };

  const register = async (usr: string, eml: string, pass: string) => {
    const res = await api.register(usr, eml, pass);
    setUser(res.user);
    if (res.user.themePreference) setMode(res.user.themePreference as any);
    if (res.user.accentColor) setAccent(res.user.accentColor as any);
  };

  const logout = () => {
    authStorage.clear();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      setUser(res.user);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
