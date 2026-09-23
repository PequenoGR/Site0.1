import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { generateToken, requireAuth, rateLimiter, AuthenticatedRequest } from '../security.js';

const router = Router();

// Rate limit: 15 login/register attempts per 10 minutes per IP
const authLimiter = rateLimiter({
  maxRequests: 15,
  windowMs: 10 * 60 * 1000,
  message: 'Muitas tentativas de login ou registro. Tente novamente em alguns minutos.'
});

// POST /api/auth/register
router.post('/register', authLimiter, (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({ error: 'O nome de usuário deve ter pelo menos 3 caracteres.' });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Informe um endereço de e-mail válido.' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres.' });
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (cleanUsername.length < 3) {
      return res.status(400).json({ error: 'Nome de usuário inválido. Utilize letras, números, hífen ou sublinhado.' });
    }

    const existingUser = db.getUserByEmailOrUsername(cleanUsername) || db.getUserByEmailOrUsername(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Nome de usuário ou e-mail já cadastrado.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = db.addUser({
      id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      username: cleanUsername,
      email: email.trim().toLowerCase(),
      passwordHash,
      createdAt: new Date().toISOString(),
      themePreference: 'dark',
      accentColor: 'cyan',
    });

    const token = generateToken({ id: newUser.id, username: newUser.username, email: newUser.email });
    res.setHeader('Set-Cookie', `luauraw_token=${token}; Path=/; Max-Age=604800; SameSite=Lax`);

    return res.status(201).json({
      message: 'Conta criada com sucesso!',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        themePreference: newUser.themePreference || 'dark',
        accentColor: newUser.accentColor || 'cyan',
      }
    });
  } catch (err: any) {
    console.error('Error during register:', err);
    return res.status(500).json({ error: 'Erro interno ao processar cadastro.' });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Informe seu usuário/e-mail e senha.' });
    }

    const user = db.getUserByEmailOrUsername(identifier);
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas. Verifique usuário e senha.' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas. Verifique usuário e senha.' });
    }

    const token = generateToken({ id: user.id, username: user.username, email: user.email });
    res.setHeader('Set-Cookie', `luauraw_token=${token}; Path=/; Max-Age=604800; SameSite=Lax`);

    return res.json({
      message: 'Login efetuado com sucesso!',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        themePreference: user.themePreference || 'dark',
        accentColor: user.accentColor || 'cyan',
      }
    });
  } catch (err: any) {
    console.error('Error during login:', err);
    return res.status(500).json({ error: 'Erro interno ao autenticar.' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = db.getUserById(req.user!.id);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }

  return res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      themePreference: user.themePreference || 'dark',
      accentColor: user.accentColor || 'cyan',
    }
  });
});

// PUT /api/auth/preferences
router.put('/preferences', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { themePreference, accentColor, currentPassword, newPassword } = req.body;
    const user = db.getUserById(req.user!.id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    const updates: any = {};
    if (themePreference && ['dark', 'light'].includes(themePreference)) {
      updates.themePreference = themePreference;
    }
    if (accentColor && ['cyan', 'emerald', 'violet', 'amber', 'rose', 'blue'].includes(accentColor)) {
      updates.accentColor = accentColor;
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Informe a senha atual para alteração.' });
      }
      if (!bcrypt.compareSync(currentPassword, user.passwordHash)) {
        return res.status(400).json({ error: 'A senha atual está incorreta.' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' });
      }
      const salt = bcrypt.genSaltSync(10);
      updates.passwordHash = bcrypt.hashSync(newPassword, salt);
    }

    const updated = db.updateUser(user.id, updates);
    return res.json({
      message: 'Preferências salvas com sucesso!',
      user: {
        id: updated!.id,
        username: updated!.username,
        email: updated!.email,
        themePreference: updated!.themePreference || 'dark',
        accentColor: updated!.accentColor || 'cyan',
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao atualizar preferências.' });
  }
});

export default router;
