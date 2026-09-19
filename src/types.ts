export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  themePreference?: 'dark' | 'light';
  accentColor?: 'cyan' | 'emerald' | 'violet' | 'amber' | 'rose' | 'blue' | 'red' | 'pink';
}

export interface AccessKey {
  key: string;
  name: string;
  createdAt: string;
}

export interface ScriptItem {
  id: string;
  userId: string;
  authorUsername: string;
  authorEmail?: string;
  title: string;
  category?: string;
  description: string;
  code?: string;
  codeLength?: number;
  thumbnailUrl?: string;
  isPasswordProtected: boolean;
  accessCount: number;
  lastAccessedAt: string | null;
  createdAt: string;
  updatedAt: string;
  accessKeysCount?: number;
  accessKeys?: AccessKey[];
  isOwner?: boolean;
  isUnlocked?: boolean;
}

export type ThemeMode = 'dark' | 'light';
export type AccentColor = 'cyan' | 'emerald' | 'violet' | 'amber' | 'rose' | 'blue' | 'red' | 'pink';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}
