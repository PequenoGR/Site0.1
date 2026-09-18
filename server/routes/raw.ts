import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';

const router = Router();

/**
 * GET /raw/:id - Pure RAW Luau script endpoint
 * 
 * Strict compliance for Roblox loadstring(game:HttpGet("..."))():
 * - Always returns Content-Type: text/plain; charset=utf-8
 * - Never returns HTML, SPA pages, JSON, or redirects
 * - Public scripts return HTTP 200 with raw Luau code
 * - Missing scripts return HTTP 404 with "Script not found"
 * - Protected scripts without valid key/password return HTTP 401 with "Unauthorized"
 * - Protected scripts with valid ?key=TOKEN or ?pass=SENHA return HTTP 200 with Luau code
 */
const handleRawScript = (req: Request, res: Response) => {
  try {
    // Enforce text/plain headers immediately
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    const rawId = req.params.id || '';
    const id = rawId.trim().replace(/\.lua$/i, '');

    if (!id) {
      return res.status(404).send('Script not found');
    }

    const script = db.getScriptById(id);

    // 1. Script not found
    if (!script) {
      return res.status(404).send('Script not found');
    }

    // 2. Public script -> Return Luau code directly
    if (!script.isPasswordProtected) {
      db.incrementScriptAccess(script.id);
      return res.status(200).send(script.code);
    }

    // 3. Password-protected script -> Authenticate via query parameters (?key= or ?pass=) or headers
    const queryKey = (req.query.key || req.query.token || req.query.access_key) as string | undefined;
    const queryPass = (req.query.pass || req.query.password || req.query.pwd) as string | undefined;
    const authHeader = req.headers.authorization?.replace(/^Bearer\s+/i, '').trim();
    const customHeaderKey = (req.headers['x-script-key'] || req.headers['x-access-key']) as string | undefined;

    let isAuthorized = false;

    // Check Access Key token (from ?key=, auth header, or custom header)
    const tokenCandidate = (queryKey || authHeader || customHeaderKey)?.trim();
    if (tokenCandidate && script.accessKeys && script.accessKeys.length > 0) {
      if (script.accessKeys.some(k => k.key === tokenCandidate)) {
        isAuthorized = true;
      }
    }

    // Also check if token was passed in ?pass=
    if (!isAuthorized && queryPass && script.accessKeys && script.accessKeys.length > 0) {
      if (script.accessKeys.some(k => k.key === queryPass.trim())) {
        isAuthorized = true;
      }
    }

    // Check Password via bcrypt comparison (?pass= or ?password=)
    if (!isAuthorized && queryPass && script.passwordHash) {
      try {
        if (bcrypt.compareSync(queryPass, script.passwordHash)) {
          isAuthorized = true;
        }
      } catch {
        // Safe fallback on bcrypt compare error
      }
    }

    // Check if password was passed in ?key=
    if (!isAuthorized && queryKey && script.passwordHash) {
      try {
        if (bcrypt.compareSync(queryKey, script.passwordHash)) {
          isAuthorized = true;
        }
      } catch {
        // Safe fallback on bcrypt compare error
      }
    }

    const isBrowser = req.headers.accept?.includes('text/html') && !req.query.mode && !req.query.download;

    // If authorized, deliver Luau code
    if (isAuthorized) {
      db.incrementScriptAccess(script.id);
      if (isBrowser) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(`<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Script Desbloqueado • ScriptsGR Shield</title>
  <style>
    body { background: #030712; color: #f8fafc; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
    .card { background: #0b1329; border: 1px solid #1e293b; border-radius: 1.25rem; max-width: 32rem; width: 100%; padding: 2rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7); }
    .badge { display: inline-flex; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 800; background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .code { background: #030712; border: 1px solid #1e293b; border-radius: 0.75rem; padding: 1rem; font-family: monospace; font-size: 0.8125rem; color: #38bdf8; margin: 1rem 0; word-break: break-all; }
    .btn { background: #2563eb; color: #fff; text-decoration: none; padding: 0.75rem 1.25rem; border-radius: 0.75rem; font-weight: 700; display: inline-block; }
  </style>
</head>
<body>
  <div class="card">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h2 style="margin:0; font-size:1.25rem;">ScriptsGR Shield</h2>
      <span class="badge">🛡️ Desbloqueado</span>
    </div>
    <h1 style="font-size:1.5rem; margin:1rem 0 0.5rem 0;">Acesso Concedido</h1>
    <p style="color:#94a3b8; font-size:0.875rem;">O script <strong>${script.title}</strong> foi autenticado com sucesso.</p>
    <div class="code">loadstring(game:HttpGet("${req.protocol}://${req.get('host')}/raw/${script.id}${tokenCandidate ? '?key=' + tokenCandidate : ''}"))()</div>
    <a href="/#/view/${script.id}" class="btn">Abrir no ScriptsGR</a>
  </div>
</body>
</html>`);
      }
      return res.status(200).send(script.code);
    }

    // If not authorized, check if browser request
    if (isBrowser) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(401).send(`<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Acesso Bloqueado • ScriptsGR Shield</title>
  <style>
    body { background: #030712; color: #f8fafc; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
    .card { background: #0b1329; border: 1px solid #1e293b; border-radius: 1.25rem; max-width: 32rem; width: 100%; padding: 2rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7); }
    .badge { display: inline-flex; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 800; background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
    .info { background: #030712; border: 1px solid #1e293b; border-radius: 0.75rem; padding: 1rem; margin: 1.25rem 0; font-size: 0.8125rem; }
    .input-group { display: flex; gap: 0.5rem; margin-top: 1rem; }
    input { flex: 1; background: #030712; border: 1px solid #334155; color: #fff; padding: 0.75rem 1rem; border-radius: 0.75rem; font-size: 0.875rem; }
    button { background: #2563eb; color: #fff; border: none; border-radius: 0.75rem; padding: 0.75rem 1.25rem; font-weight: 700; cursor: pointer; }
    .btn { background: #1e293b; color: #cbd5e1; text-decoration: none; padding: 0.75rem 1.25rem; border-radius: 0.75rem; font-weight: 700; display: inline-block; margin-top: 1rem; }
  </style>
</head>
<body>
  <div class="card">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h2 style="margin:0; font-size:1.25rem;">ScriptsGR Shield</h2>
      <span class="badge">🔒 Código Protegido</span>
    </div>
    <h1 style="font-size:1.5rem; margin:1rem 0 0.5rem 0;">Acesso Bloqueado</h1>
    <p style="color:#94a3b8; font-size:0.875rem;">Este script Luau possui proteção anti-vazamento de código-fonte. O código-fonte não está acessível no navegador sem a chave autorizada.</p>
    <div class="info">
      <div><strong>Script ID:</strong> <span style="color:#38bdf8;">${script.id}</span></div>
      <div style="margin-top:0.25rem;"><strong>Título:</strong> ${script.title}</div>
      <div style="margin-top:0.25rem;"><strong>Status:</strong> <span style="color:#f87171;">Protegido (Anti-Leak Ativo)</span></div>
    </div>
    <form method="GET" action="/raw/${script.id}">
      <div style="font-size: 0.8125rem; color: #94a3b8; font-weight: 600;">Digite a chave ou senha de acesso:</div>
      <div class="input-group">
        <input type="text" name="key" placeholder="Chave ou senha..." required autocomplete="off" />
        <button type="submit">Desbloquear</button>
      </div>
    </form>
    <a href="/#/dashboard" class="btn">Ir para o Painel</a>
  </div>
</body>
</html>`);
    }

    // If not authorized, return 401 Unauthorized in plain text
    return res.status(401).send('Unauthorized\n-- [ScriptsGR Shield] Acesso Bloqueado: Este script possui protecao ativa. Use ?key=SUA_CHAVE ou ?pass=SUA_SENHA.');
  } catch (err) {
    console.error('[ScriptsGR] Error processing /raw request:', err);
    return res.status(500).send('Internal Server Error');
  }
};

// Route matching
router.get('/:id', handleRawScript);
router.head('/:id', handleRawScript);
router.get('/:id/*', handleRawScript);

// Fallback for root /raw or missing ID
router.all('/', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.status(404).send('Script not found');
});

// Any unmatched subroutes under /raw return 404 text/plain (NEVER HTML)
router.use((_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.status(404).send('Script not found');
});

// Error handling middleware to prevent Express default HTML error
router.use((_err: any, _req: Request, res: Response, _next: any) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.status(500).send('Internal Server Error');
});

export default router;
