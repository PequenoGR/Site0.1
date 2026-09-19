import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';

const router = Router();

/**
 * RAW Luau script endpoint handler (GET and POST)
 * 
 * Strict compliance for Roblox loadstring(game:HttpGet("..."))() and Web browser access:
 * - Public scripts: Returns 200 with raw Luau code (or HTML if browser)
 * - Protected scripts without key/pass: Returns 401 Unauthorized (text/plain) or HTML Unlock UI for browser
 * - Protected scripts with valid key/pass: Returns 200 with Luau code (or rich unlocked HTML preview in browser)
 * - Protected scripts with invalid key/pass: Returns 401 with error message (and error alert in browser)
 */
const handleRawScript = (req: Request, res: Response) => {
  try {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    const rawId = req.params.id || '';
    const id = rawId.trim().replace(/\.lua$/i, '');

    if (!id) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.status(404).send('Script not found');
    }

    const script = db.getScriptById(id);

    // 1. Script not found
    if (!script) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.status(404).send('Script not found');
    }

    const wantsRawPlain = Boolean(
      req.query.raw === '1' ||
      req.query.raw === 'true' ||
      req.query.plain === '1' ||
      req.query.text === '1' ||
      req.query.download === '1' ||
      req.query.mode === 'raw'
    );

    const isBrowser = !wantsRawPlain && Boolean(
      req.headers.accept?.includes('text/html') ||
      req.headers.accept?.includes('application/xhtml+xml')
    );

    // 2. Public script
    if (!script.isPasswordProtected) {
      db.incrementScriptAccess(script.id);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.status(200).send(script.code);
    }

    // 3. Password-protected script -> Parse auth params
    const queryKey = (
      (req.query.key as string) ||
      (req.query.token as string) ||
      (req.query.access_key as string) ||
      (req.body?.key as string) ||
      (req.body?.token as string)
    )?.trim();

    const queryPass = (
      (req.query.pass as string) ||
      (req.query.password as string) ||
      (req.query.pwd as string) ||
      (req.body?.pass as string) ||
      (req.body?.password as string)
    )?.trim();

    const authHeader = req.headers.authorization?.replace(/^Bearer\s+/i, '').trim();
    const customHeaderKey = (
      (req.headers['x-script-key'] as string) ||
      (req.headers['x-access-key'] as string) ||
      (req.headers['x-password'] as string)
    )?.trim();

    const candidateKey = queryKey || authHeader || customHeaderKey;
    const candidatePass = queryPass || (queryKey && !script.accessKeys?.some(k => k.key === queryKey) ? queryKey : undefined);

    const hasAttemptedAuth = Boolean(candidateKey || candidatePass);
    let isAuthorized = false;
    let authMethod: 'key' | 'password' | null = null;
    let authorizedParam = '';

    // A. Check against Access Keys list
    if (candidateKey && script.accessKeys && script.accessKeys.length > 0) {
      if (script.accessKeys.some(k => k.key === candidateKey)) {
        isAuthorized = true;
        authMethod = 'key';
        authorizedParam = `key=${encodeURIComponent(candidateKey)}`;
      }
    }

    // B. Check if candidateKey was also tested as candidatePass
    if (!isAuthorized && candidatePass && script.accessKeys && script.accessKeys.length > 0) {
      if (script.accessKeys.some(k => k.key === candidatePass)) {
        isAuthorized = true;
        authMethod = 'key';
        authorizedParam = `key=${encodeURIComponent(candidatePass)}`;
      }
    }

    // C. Check password against bcrypt passwordHash
    if (!isAuthorized && script.passwordHash) {
      if (candidatePass && typeof candidatePass === 'string' && candidatePass.length > 0) {
        try {
          if (bcrypt.compareSync(candidatePass, script.passwordHash)) {
            isAuthorized = true;
            authMethod = 'password';
            authorizedParam = `pass=${encodeURIComponent(candidatePass)}`;
          }
        } catch {
          // bcrypt comparison safe fail
        }
      }
      if (!isAuthorized && candidateKey && typeof candidateKey === 'string' && candidateKey.length > 0) {
        try {
          if (bcrypt.compareSync(candidateKey, script.passwordHash)) {
            isAuthorized = true;
            authMethod = 'password';
            authorizedParam = `pass=${encodeURIComponent(candidateKey)}`;
          }
        } catch {
          // bcrypt comparison safe fail
        }
      }
    }

    const host = req.get('host') || 'scriptsgr.dev';
    const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const fullUrl = `${protocol}://${host}/raw/${script.id}`;

    // If authorized:
    if (isAuthorized) {
      db.incrementScriptAccess(script.id);

      if (isBrowser) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        const loadstringSnippet = `loadstring(game:HttpGet("${fullUrl}?${authorizedParam}"))()`;
        const escapedCode = script.code
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');

        return res.status(200).send(`<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${script.title} • Desbloqueado ScriptsGR</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #030712; color: #f1f5f9; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 1.5rem; }
    .card { background: #0b132b; border: 1px solid #1e293b; border-radius: 1.25rem; max-width: 48rem; width: 100%; padding: 2rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.8); }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 1.25rem; margin-bottom: 1.5rem; }
    .badge { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.35rem 0.85rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .code-box { background: #020617; border: 1px solid #1e293b; border-radius: 0.875rem; padding: 1.25rem; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.8125rem; color: #38bdf8; overflow-x: auto; max-height: 340px; white-space: pre; line-height: 1.5; margin: 1rem 0; }
    .loadstring-box { background: #020617; border: 1px solid #334155; border-radius: 0.75rem; padding: 0.85rem 1rem; font-family: monospace; font-size: 0.8125rem; color: #fbbf24; word-break: break-all; margin-bottom: 1rem; }
    .btn-group { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.25rem; }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.65rem 1.25rem; border-radius: 0.75rem; font-size: 0.8125rem; font-weight: 700; text-decoration: none; cursor: pointer; border: none; transition: all 0.15s ease; }
    .btn-primary { background: #06b6d4; color: #030712; }
    .btn-primary:hover { background: #22d3ee; }
    .btn-secondary { background: #1e293b; color: #cbd5e1; border: 1px solid #334155; }
    .btn-secondary:hover { background: #334155; color: #fff; }
    .toast { position: fixed; bottom: 1.5rem; right: 1.5rem; background: #10b981; color: #022c22; font-weight: 700; font-size: 0.8125rem; padding: 0.75rem 1.25rem; border-radius: 0.75rem; display: none; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5); }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <h1 style="font-size: 1.25rem; font-weight: 800; color: #f8fafc;">${script.title}</h1>
        <p style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem;">ID: <span style="color: #38bdf8; font-family: monospace;">${script.id}</span> • Autor: <strong>${script.authorUsername || 'Anônimo'}</strong></p>
      </div>
      <span class="badge">🛡️ Desbloqueado (${authMethod === 'password' ? 'Senha' : 'Chave'})</span>
    </div>

    <div style="font-size: 0.8125rem; color: #cbd5e1; margin-bottom: 0.5rem; font-weight: 600;">Loadstring Pronto para Roblox / Luau:</div>
    <div class="loadstring-box" id="loadstring-text">${loadstringSnippet}</div>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
      <span style="font-size: 0.8125rem; color: #cbd5e1; font-weight: 600;">Código-Fonte Luau:</span>
      <a href="/raw/${script.id}?${authorizedParam}&raw=true" style="font-size: 0.75rem; color: #38bdf8; text-decoration: none;">Ver Texto Puro (Raw) &rarr;</a>
    </div>
    <div class="code-box" id="code-content">${escapedCode}</div>

    <div class="btn-group">
      <button class="btn btn-primary" onclick="copyText('loadstring-text', 'Loadstring copiado!')">📋 Copiar Loadstring</button>
      <button class="btn btn-secondary" onclick="copyText('code-content', 'Código Luau copiado!')">📄 Copiar Código Luau</button>
      <a href="/#/view/${script.id}" class="btn btn-secondary">Abrir no ScriptsGR</a>
    </div>
  </div>

  <div id="toast" class="toast">Copiado com sucesso!</div>

  <script>
    function copyText(elementId, msg) {
      const text = document.getElementById(elementId).innerText;
      navigator.clipboard.writeText(text).then(() => {
        const toast = document.getElementById('toast');
        toast.innerText = msg;
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 2500);
      });
    }
  </script>
</body>
</html>`);
      }

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.status(200).send(script.code);
    }

    // If NOT authorized:
    if (isBrowser) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      const hasError = hasAttemptedAuth;

      return res.status(401).send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Senha • ScriptsGR</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
    }
    body {
      background-color: #000000;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      min-height: 100vh;
      width: 100vw;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    
    /* Background decorative dark navy orbs matching the custom design */
    .orb-left {
      position: absolute;
      width: 170px;
      height: 170px;
      border-radius: 50%;
      background-color: #1c2e68;
      top: 30%;
      left: 16%;
      pointer-events: none;
      z-index: 1;
    }
    
    .orb-right {
      position: absolute;
      width: 170px;
      height: 170px;
      border-radius: 50%;
      background-color: #1c2e68;
      top: 36%;
      right: 16%;
      pointer-events: none;
      z-index: 1;
    }

    @media (max-width: 640px) {
      .orb-left {
        width: 120px;
        height: 120px;
        top: 26%;
        left: 10%;
      }
      .orb-right {
        width: 120px;
        height: 120px;
        top: 32%;
        right: 10%;
      }
    }

    .container {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      max-width: 360px;
      padding: 1.5rem;
      margin-top: 5vh;
    }

    .title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 26px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 14px;
      letter-spacing: -0.01em;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
    }

    .key-emoji {
      font-size: 26px;
      line-height: 1;
    }

    .form-box {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .input-bar {
      width: 100%;
      max-width: 320px;
      height: 52px;
      background-color: #4f70f4;
      border: none;
      border-radius: 12px;
      color: #ffffff;
      font-size: 18px;
      font-weight: 600;
      text-align: center;
      outline: none;
      box-shadow: 0 4px 20px rgba(79, 112, 244, 0.35);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .input-bar::placeholder {
      color: rgba(255, 255, 255, 0.7);
      font-size: 15px;
      font-weight: 500;
    }

    .input-bar:focus {
      transform: scale(1.02);
      box-shadow: 0 6px 24px rgba(79, 112, 244, 0.55);
    }

    .error-msg {
      margin-top: 14px;
      color: #ef4444;
      font-size: 13px;
      font-weight: 700;
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.3);
      padding: 6px 14px;
      border-radius: 8px;
      animation: shake 0.3s ease-in-out;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-6px); }
      75% { transform: translateX(6px); }
    }
  </style>
</head>
<body>
  <!-- Floating Navy Orbs -->
  <div class="orb-left"></div>
  <div class="orb-right"></div>

  <!-- Main Center Form -->
  <div class="container">
    <div class="title">
      <span class="key-emoji">🔑</span>
      <span>Senha</span>
    </div>

    <form method="GET" action="/raw/${script.id}" class="form-box">
      <input
        type="password"
        name="pass"
        class="input-bar"
        placeholder=""
        autofocus
        required
        autocomplete="off"
      />
    </form>

    ${hasError ? `<div class="error-msg">❌ Senha incorreta</div>` : ''}
  </div>
</body>
</html>`);
    }

    // If game client or direct HTTP without valid auth:
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(401).send('Unauthorized\n-- [ScriptsGR Shield] Acesso Bloqueado: Este script e protegido por senha. Forneca ?pass=SENHA ou ?key=CHAVE no seu loadstring.');
  } catch (err) {
    console.error('[ScriptsGR] Error processing /raw request:', err);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(500).send('Internal Server Error');
  }
};

// Route handlers
router.get('/:id', handleRawScript);
router.post('/:id', handleRawScript);
router.head('/:id', handleRawScript);
router.get('/:id/*', handleRawScript);
router.post('/:id/*', handleRawScript);

// Fallback for root /raw
router.all('/', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.status(404).send('Script not found');
});

// Any unmatched subroutes under /raw return 404 text/plain
router.use((_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.status(404).send('Script not found');
});

// Error handling middleware
router.use((_err: any, _req: Request, res: Response, _next: any) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.status(500).send('Internal Server Error');
});

export default router;
