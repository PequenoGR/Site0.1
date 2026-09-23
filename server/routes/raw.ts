import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { checkPasswordRateLimit, resetPasswordRateLimit } from '../security.js';

const router = Router();

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getScriptSlug(title?: string): string {
  if (!title) return 'script.lua';
  const clean = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${clean || 'script'}.lua`;
}

function renderRawHtmlViewer(script: any, fullRawUrl: string, loadstringSnippet: string): string {
  const lineCount = (script.code || '').split('\n').length;
  const sizeBytes = Buffer.byteLength(script.code || '', 'utf8');
  const sizeKb = (sizeBytes / 1024).toFixed(1);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(script.title)} • ScriptsGR RAW</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #030712;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      background: #090d16;
      border-bottom: 1px solid #1e293b;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      font-weight: 900;
      font-size: 18px;
      letter-spacing: -0.5px;
    }
    .brand-blue { color: #3b82f6; }
    .brand-white { color: #ffffff; }
    .title-area {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .script-title {
      font-size: 15px;
      font-weight: 800;
      color: #f8fafc;
    }
    .badge {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .badge-lua { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
    .badge-secure { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge-author { background: #1e293b; color: #94a3b8; }
    .actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .btn {
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      border: 1px solid transparent;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
      text-decoration: none;
    }
    .btn-primary {
      background: #2563eb;
      color: #ffffff;
    }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-secondary {
      background: #1e293b;
      color: #e2e8f0;
      border-color: #334155;
    }
    .btn-secondary:hover { background: #334155; color: #ffffff; }
    .main-content {
      flex: 1;
      padding: 20px;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .url-bar {
      background: #090d16;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      color: #38bdf8;
      word-break: break-all;
    }
    .meta-bar {
      font-size: 12px;
      color: #64748b;
      display: flex;
      gap: 16px;
      font-weight: 600;
    }
    .code-container {
      background: #090d16;
      border: 1px solid #1e293b;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    pre {
      padding: 16px;
      overflow-x: auto;
      font-family: "Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 13px;
      line-height: 1.6;
      color: #e2e8f0;
      tab-size: 2;
    }
    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #10b981;
      color: #ffffff;
      padding: 10px 18px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 13px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.4);
      opacity: 0;
      transform: translateY(12px);
      transition: all 0.2s ease;
      pointer-events: none;
      z-index: 100;
    }
    .toast.show {
      opacity: 1;
      transform: translateY(0);
    }
  </style>
</head>
<body>
  <header>
    <div class="title-area">
      <a href="/" class="brand">
        <span class="brand-blue">Scripts</span><span class="brand-white">GR</span>
      </a>
      <span class="script-title">${escapeHtml(script.title)}</span>
      <span class="badge badge-lua">Luau .lua</span>
      <span class="badge badge-secure">HTTPS SSL</span>
      ${script.authorUsername ? `<span class="badge badge-author">@${escapeHtml(script.authorUsername)}</span>` : ''}
    </div>

    <div class="actions">
      <button class="btn btn-primary" onclick="copyText('${escapeHtml(loadstringSnippet)}', 'Script Luau copiado!')">
        ⚡ Copiar Script
      </button>
      <button class="btn btn-secondary" onclick="copyText('${escapeHtml(fullRawUrl)}', 'Link RAW copiado!')">
        🔗 Copiar Link RAW
      </button>
      <a href="?raw=1" class="btn btn-secondary">
        📄 Texto Puro (Raw)
      </a>
    </div>
  </header>

  <main class="main-content">
    <div class="url-bar">
      <span>${escapeHtml(fullRawUrl)}</span>
    </div>

    <div class="meta-bar">
      <span>Linhas: ${lineCount}</span>
      <span>Tamanho: ${sizeKb} KB</span>
      <span>Acessos: ${script.accessCount || 0}</span>
    </div>

    <div class="code-container">
      <pre><code>${escapeHtml(script.code || '')}</code></pre>
    </div>
  </main>

  <div id="toast" class="toast"></div>

  <script>
    function copyText(text, msg) {
      navigator.clipboard.writeText(text).then(function() {
        showToast(msg);
      });
    }
    function showToast(msg) {
      var t = document.getElementById('toast');
      t.innerText = msg;
      t.classList.add('show');
      setTimeout(function() { t.classList.remove('show'); }, 2000);
    }
  </script>
</body>
</html>`;
}

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

    const userAgent = (req.headers['user-agent'] as string) || '';
    const isRobloxOrExecutor = /roblox|synapse|krnl|fluxus|scriptware|delta|arceus|codex|electron|solara|wave|celery|evon|httpclient/i.test(userAgent);

    const isBrowser = !wantsRawPlain && !isRobloxOrExecutor && Boolean(
      req.headers.accept?.includes('text/html') ||
      req.headers.accept?.includes('application/xhtml+xml')
    );

    const host = req.get('host') || 'scriptsgr.dev';
    const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const slug = getScriptSlug(script.title);
    const prettyUrl = `${protocol}://${host}/raw/${script.id}/${slug}`;
    const loadstringCode = `loadstring(game:HttpGet("${prettyUrl}"))()`;

    // 2. Public script
    if (!script.isPasswordProtected) {
      db.incrementScriptAccess(script.id);
      if (isBrowser) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(renderRawHtmlViewer(script, prettyUrl, loadstringCode));
      }
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
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const rateLimitKey = `raw:${script.id}:${ip}`;

    if (hasAttemptedAuth && !checkPasswordRateLimit(rateLimitKey)) {
      if (isBrowser) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(429).send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Muitas Tentativas • ScriptsGR Shield</title>
  <style>
    body { background: #000; color: #fff; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 1rem; text-align: center; }
    .box { background: #18181b; border: 1px solid #ef4444; border-radius: 16px; padding: 2rem; max-width: 400px; box-shadow: 0 0 30px rgba(239, 68, 68, 0.2); }
    h2 { color: #ef4444; margin-bottom: 0.5rem; }
    p { color: #a1a1aa; font-size: 14px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="box">
    <h2>🛡️ Bloqueio Temporário</h2>
    <p>Muitas tentativas incorretas de senha para este script. Por segurança contra ataques de força bruta, tente novamente em 5 minutos.</p>
  </div>
</body>
</html>`);
      }
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.status(429).send('-- [ScriptsGR Shield] 429 Too Many Requests: Muitas tentativas incorretas. Tente novamente em 5 minutos.');
    }

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

    if (isAuthorized) {
      resetPasswordRateLimit(rateLimitKey);
    }

    const fullUrl = `${protocol}://${host}/raw/${script.id}`;

    // If authorized (or public): Return pure RAW Luau code directly
    if (isAuthorized) {
      db.incrementScriptAccess(script.id);
      if (isBrowser) {
        const authQuery = authorizedParam ? `?${authorizedParam}` : '';
        const authedPrettyUrl = `${prettyUrl}${authQuery}`;
        const authedLoadstring = `loadstring(game:HttpGet("${authedPrettyUrl}"))()`;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(renderRawHtmlViewer(script, authedPrettyUrl, authedLoadstring));
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
