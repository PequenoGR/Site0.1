import { ScriptItem } from '../types';

export function getScriptSlug(title?: string): string {
  if (!title) return 'script.lua';
  const clean = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${clean || 'script'}.lua`;
}

export function getRawUrl(
  script: Pick<ScriptItem, 'id' | 'title' | 'isPasswordProtected'>,
  activeKey?: string,
  withSlug = true
): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://scriptsgr.dev';
  const slugPart = withSlug ? `/${getScriptSlug(script.title)}` : '';
  const base = `${origin}/raw/${script.id}${slugPart}`;

  if (script.isPasswordProtected && activeKey) {
    return `${base}?key=${encodeURIComponent(activeKey)}`;
  }
  return base;
}

export function getLoadstring(rawUrl: string): string {
  return `loadstring(game:HttpGet("${rawUrl}"))()`;
}
