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

    // If authorized, deliver Luau code
    if (isAuthorized) {
      db.incrementScriptAccess(script.id);
      return res.status(200).send(script.code);
    }

    // If not authorized, return 401 Unauthorized in plain text
    return res.status(401).send('Unauthorized');
  } catch (err) {
    console.error('[LuauRaw] Error processing /raw request:', err);
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
