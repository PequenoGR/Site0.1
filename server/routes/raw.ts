import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { checkPasswordRateLimit, resetPasswordRateLimit, JWT_SECRET, parseCookies } from '../security.js';

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

function renderRawHtmlViewer(script: any, fullRawUrl: string, loadstringSnippet: string, isOwner: boolean = false): string {
  const lineCount = (script.code || '').split('\n').length;
  const slug = getScriptSlug(script.title);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(script.title)} - Scripts GR</title>
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
      display: flex;
      flex-direction: column;
      padding: 24px 20px;
    }
    .top-bar {
      width: 100%;
      max-width: 900px;
      margin: 0 auto 36px auto;
    }
    .logo {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #ffffff;
      display: inline-flex;
      align-items: baseline;
      text-decoration: none;
      user-select: none;
    }
    .logo-gr-wrapper {
      position: relative;
      display: inline-block;
      margin-left: 5px;
    }
    .logo-gr-underline {
      position: absolute;
      bottom: -3px;
      left: 0;
      right: 0;
      height: 3.5px;
      background-color: #ef4444;
      border-radius: 2px;
    }
    .container {
      width: 100%;
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .lines-count {
      font-size: 20px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 10px;
      letter-spacing: -0.2px;
      user-select: none;
    }
    .blue-box {
      background-color: #4f6ef7;
      border-radius: 8px;
      width: 100%;
      min-height: 600px;
      flex: 1;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);
    }
    .buttons-header {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 10px;
      width: 100%;
    }
    .btn-green {
      background-color: #00d26a;
      color: #ffffff;
      border: none;
      border-radius: 7px;
      padding: 6px 18px;
      font-size: 15px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      transition: background-color 0.15s ease, transform 0.1s ease;
      user-select: none;
      outline: none;
    }
    .btn-green:hover {
      background-color: #00e676;
      transform: translateY(-1px);
    }
    .btn-green:active {
      transform: translateY(1px);
    }
    .code-area {
      flex: 1;
      margin-top: 14px;
      overflow: auto;
      width: 100%;
    }
    .code-area pre {
      margin: 0;
      padding: 0;
      white-space: pre-wrap;
      word-break: break-all;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      font-size: 13.5px;
      line-height: 1.55;
      color: #ffffff;
      user-select: text;
    }
    .code-area code {
      font-family: inherit;
      color: inherit;
    }
    .code-area::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    .code-area::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 4px;
    }
    .code-area::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.35);
      border-radius: 4px;
    }
    .code-area::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.55);
    }
    .toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(80px);
      background-color: #111827;
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 800;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
      border: 1px solid #374151;
      opacity: 0;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 9999;
      pointer-events: none;
    }
    .toast.show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  </style>
</head>
<body>
  <div class="top-bar">
    <a href="/" class="logo">
      <span>Scripts</span>
      <span class="logo-gr-wrapper">
        GR
        <span class="logo-gr-underline"></span>
      </span>
    </a>
  </div>

  <main class="container">
    <div class="lines-count">
      ${lineCount}:Linhas
    </div>

    <div class="blue-box">
      <div class="buttons-header">
        <button id="btn-copy" class="btn-green" onclick="handleCopy()">
          Copiar
        </button>
        <button id="btn-download" class="btn-green" onclick="handleDownload()">
          Abaixar
        </button>
      </div>

      <div class="code-area">
        <pre><code>${escapeHtml(script.code || '')}</code></pre>
      </div>
    </div>
  </main>

  <div id="toast" class="toast"></div>

  <script>
    var scriptData = ${JSON.stringify(script.code || '')};
    var scriptFilename = ${JSON.stringify(slug)};

    function showToast(message) {
      var toast = document.getElementById('toast');
      toast.innerText = message;
      toast.classList.add('show');
      setTimeout(function() {
        toast.classList.remove('show');
      }, 2000);
    }

    function handleCopy() {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(scriptData).then(function() {
          showToast('Copiado!');
        }).catch(function() {
          fallbackCopy(scriptData);
        });
      } else {
        fallbackCopy(scriptData);
      }
    }

    function fallbackCopy(text) {
      var textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        showToast('Copiado!');
      } catch (err) {
        showToast('Erro ao copiar');
      }
      document.body.removeChild(textArea);
    }

    function handleDownload() {
      try {
        var blob = new Blob([scriptData], { type: 'text/plain;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = scriptFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('Download iniciado!');
      } catch (e) {
        window.location.href = window.location.pathname + '?download=1';
      }
    }
  </script>
</body>
</html>`;
}

/**
 * RAW script endpoint handler (GET and POST)
 * 
 * Strict compliance for Roblox loadstring(game:HttpGet("..."))() and Web browser access:
 * - Public scripts: Returns 200 with raw script (or HTML if browser)
 * - Protected scripts without key/pass: Returns 401 Unauthorized (text/plain) or HTML Unlock UI for browser
 * - Protected scripts with valid key/pass: Returns 200 with code (or rich unlocked HTML preview in browser)
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

    const isBrowser = !isRobloxOrExecutor && (
      Boolean(req.headers.accept?.includes('text/html') || req.headers.accept?.includes('application/xhtml+xml')) ||
      (!wantsRawPlain && !userAgent.includes('curl') && !userAgent.includes('Wget'))
    );

    // Extract logged-in user from headers or cookie
    const cookieHeader = req.headers.cookie;
    const cookies = parseCookies(cookieHeader);
    const rawToken = req.headers.authorization?.replace(/^Bearer\s+/i, '').trim() ||
      cookies['luauraw_token'] ||
      (req.query.token as string);

    let loggedInUser: { id: string; username: string; email: string } | null = null;
    if (rawToken) {
      try {
        const decoded = jwt.verify(rawToken, JWT_SECRET) as { id: string; username: string; email: string };
        const user = db.getUserById(decoded.id);
        if (user) {
          loggedInUser = { id: user.id, username: user.username, email: user.email };
        }
      } catch {}
    }

    const isOwner = Boolean(
      loggedInUser && (
        script.userId === loggedInUser.id ||
        (script.authorEmail && loggedInUser.email && script.authorEmail.toLowerCase() === loggedInUser.email.toLowerCase())
      )
    );

    const host = req.get('host') || 'scriptsgr.dev';
    const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const slug = getScriptSlug(script.title);
    const prettyUrl = `${protocol}://${host}/raw/${script.id}/${slug}`;
    const loadstringCode = `loadstring(game:HttpGet("${prettyUrl}"))()`;

    // Non-owner in a browser cannot bypass to plain text via ?raw=1
    if (wantsRawPlain && isBrowser && !isOwner) {
      if (script.isPasswordProtected) {
        // Will continue to password check below
      } else {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(renderRawHtmlViewer(script, prettyUrl, loadstringCode, false));
      }
    }

    // 2. Public script
    if (!script.isPasswordProtected) {
      db.incrementScriptAccess(script.id);
      if (req.query.download === '1') {
        const downloadFilename = getScriptSlug(script.title);
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
        return res.status(200).send(script.code);
      }
      if (isBrowser) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(renderRawHtmlViewer(script, prettyUrl, loadstringCode, isOwner));
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
    <h2>Bloqueio Temporário</h2>
    <p>Muitas tentativas incorretas de senha para este script. Por segurança contra ataques de força bruta, tente novamente em 5 minutos.</p>
  </div>
</body>
</html>`);
      }
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.status(429).send('-- [ScriptsGR Shield] 429 Too Many Requests: Muitas tentativas incorretas. Tente novamente em 5 minutos.');
    }

    let isAuthorized = Boolean(isOwner);
    let authMethod: 'owner' | 'key' | 'password' | null = isOwner ? 'owner' : null;
    let authorizedParam = '';

    // A. Check against Access Keys list
    if (!isAuthorized && candidateKey && script.accessKeys && script.accessKeys.length > 0) {
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

    // If authorized:
    // In Roblox/Executor: Return pure RAW script directly
    // In Browser: Return viewer with anti-leak protection (only owner can inspect code)
    if (isAuthorized) {
      db.incrementScriptAccess(script.id);
      if (req.query.download === '1') {
        const downloadFilename = getScriptSlug(script.title);
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
        return res.status(200).send(script.code);
      }
      if (isBrowser) {
        const authQuery = authorizedParam ? `?${authorizedParam}` : '';
        const authedPrettyUrl = `${prettyUrl}${authQuery}`;
        const authedLoadstring = `loadstring(game:HttpGet("${authedPrettyUrl}"))()`;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(renderRawHtmlViewer(script, authedPrettyUrl, authedLoadstring, isOwner));
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

    ${hasError ? `<div class="error-msg">Senha incorreta</div>` : ''}
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
