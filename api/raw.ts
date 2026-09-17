import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../server/db.js';

export default function handler(req: Request, res: Response) {
  try {
    // 1. Always enforce text/plain headers for Roblox loadstring compatibility
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    // 2. Extract Script ID from multiple possible locations (Vercel query rewrites, URL path, headers)
    let rawId = '';

    if (typeof req.query.id === 'string' && req.query.id.trim()) {
      rawId = req.query.id;
    } else if (typeof req.query.scriptId === 'string' && req.query.scriptId.trim()) {
      rawId = req.query.scriptId;
    } else if (req.params && typeof (req.params as any).id === 'string') {
      rawId = (req.params as any).id;
    } else {
      // Parse from req.url or x-matched-path or x-forwarded-uri
      const candidates = [
        req.url,
        req.originalUrl,
        req.headers['x-matched-path'] as string,
        req.headers['x-forwarded-uri'] as string,
      ].filter(Boolean);

      for (const uri of candidates) {
        const match = uri.match(/(?:^\/api\/raw\/|^\/raw\/|\/raw\/|\/api\/raw\?id=)([^/?#]+)/i);
        if (match && match[1]) {
          rawId = match[1];
          break;
        }
      }
    }

    const id = rawId.trim().replace(/\.lua$/i, '');

    if (!id) {
      return res.status(404).send('Script not found');
    }

    // 3. Lookup script in database
    const script = db.getScriptById(id);

    if (!script) {
      return res.status(404).send('Script not found');
    }

    // 4. Public Script -> Deliver pure Luau string directly
    if (!script.isPasswordProtected) {
      db.incrementScriptAccess(script.id);
      return res.status(200).send(script.code);
    }

    // 5. Password-protected Script -> Check key or password from query/headers
    const queryKey = (req.query.key || req.query.token || req.query.access_key) as string | undefined;
    const queryPass = (req.query.pass || req.query.password || req.query.pwd) as string | undefined;
    const authHeader = req.headers.authorization?.replace(/^Bearer\s+/i, '').trim();
    const customHeaderKey = (req.headers['x-script-key'] || req.headers['x-access-key']) as string | undefined;

    let isAuthorized = false;

    // Check Access Key token
    const tokenCandidate = (queryKey || authHeader || customHeaderKey)?.trim();
    if (tokenCandidate && script.accessKeys && script.accessKeys.length > 0) {
      if (script.accessKeys.some(k => k.key === tokenCandidate)) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized && queryPass && script.accessKeys && script.accessKeys.length > 0) {
      if (script.accessKeys.some(k => k.key === queryPass.trim())) {
        isAuthorized = true;
      }
    }

    // Check Password via bcrypt comparison
    if (!isAuthorized && queryPass && script.passwordHash) {
      try {
        if (bcrypt.compareSync(queryPass, script.passwordHash)) {
          isAuthorized = true;
        }
      } catch {
        // Safe fallback
      }
    }

    if (!isAuthorized && queryKey && script.passwordHash) {
      try {
        if (bcrypt.compareSync(queryKey, script.passwordHash)) {
          isAuthorized = true;
        }
      } catch {
        // Safe fallback
      }
    }

    if (isAuthorized) {
      db.incrementScriptAccess(script.id);
      return res.status(200).send(script.code);
    }

    return res.status(401).send('Unauthorized');
  } catch (err) {
    console.error('[ScriptsGR] Error processing /raw request in serverless handler:', err);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(500).send('Internal Server Error');
  }
}
