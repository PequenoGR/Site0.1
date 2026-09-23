import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'luau-raw-fallback-secret-key-2026';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

// In-memory rate limiting structures
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const ipBuckets = new Map<string, RateLimitRecord>();

export function rateLimiter(options: { maxRequests: number; windowMs: number; message?: string }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const key = `${req.path}:${ip}`;
    const now = Date.now();
    const current = ipBuckets.get(key);

    if (!current || now > current.resetAt) {
      ipBuckets.set(key, {
        count: 1,
        resetAt: now + options.windowMs,
      });
      return next();
    }

    if (current.count >= options.maxRequests) {
      res.setHeader('Retry-After', Math.ceil((current.resetAt - now) / 1000));
      return res.status(429).json({
        error: options.message || 'Muitas requisições. Por favor, aguarde alguns instantes antes de tentar novamente.',
      });
    }

    current.count++;
    return next();
  };
}

// Password verification rate limiter (Brute Force Protection)
const passwordAttemptBuckets = new Map<string, RateLimitRecord>();

export function checkPasswordRateLimit(ipOrId: string): boolean {
  const now = Date.now();
  const current = passwordAttemptBuckets.get(ipOrId);
  if (!current || now > current.resetAt) {
    passwordAttemptBuckets.set(ipOrId, { count: 1, resetAt: now + 5 * 60 * 1000 }); // 5 minutes window
    return true;
  }
  if (current.count >= 5) {
    return false; // locked out after 5 failed attempts
  }
  current.count++;
  return true;
}

export function resetPasswordRateLimit(ipOrId: string): void {
  passwordAttemptBuckets.delete(ipOrId);
}

// Cleanup expired buckets every 10 minutes to prevent memory leaks in production
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of ipBuckets.entries()) {
    if (now > record.resetAt) {
      ipBuckets.delete(key);
    }
  }
  for (const [key, record] of passwordAttemptBuckets.entries()) {
    if (now > record.resetAt) {
      passwordAttemptBuckets.delete(key);
    }
  }
}, 10 * 60 * 1000).unref();

// Generate JWT token
export function generateToken(payload: { id: string; username: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Verify JWT middleware (Optional: if token exists, attaches user, does not reject if missing)
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username: string; email: string };
    const user = db.getUserById(decoded.id);
    if (user) {
      req.user = { id: user.id, username: user.username, email: user.email };
    }
  } catch {
    // Token invalid/expired; continue unauthenticated
  }
  next();
}

// Strict Auth Middleware (Requires valid logged-in user)
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acesso não autorizado. Por favor faça login.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username: string; email: string };
    const user = db.getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado ou sessão expirada.' });
    }
    req.user = { id: user.id, username: user.username, email: user.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Token de autenticação inválido ou expirado.' });
  }
}
