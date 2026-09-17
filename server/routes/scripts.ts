import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db, Script, AccessKey } from '../db.js';
import {
  requireAuth,
  optionalAuth,
  AuthenticatedRequest,
  rateLimiter,
  checkPasswordRateLimit,
  resetPasswordRateLimit
} from '../security.js';

const router = Router();

// Rate limit: 60 script operations per 5 minutes
const scriptsLimiter = rateLimiter({
  maxRequests: 60,
  windowMs: 5 * 60 * 1000,
});

// GET /api/scripts - List scripts
router.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { filter = 'all', search = '', scope = 'mine' } = req.query as {
      filter?: string;
      search?: string;
      scope?: string;
    };

    let scripts: Script[] = [];

    if (req.user && scope !== 'explore') {
      scripts = db.getUserScripts(req.user.id);
    } else {
      // Return public scripts for explore or guests
      scripts = db.getScripts().filter(s => !s.isPasswordProtected || (req.user && s.userId === req.user.id));
    }

    // Apply visibility filter
    if (filter === 'public') {
      scripts = scripts.filter(s => !s.isPasswordProtected);
    } else if (filter === 'protected') {
      scripts = scripts.filter(s => s.isPasswordProtected);
    }

    // Apply search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      scripts = scripts.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
      );
    }

    // Format output (hide password hashes!)
    const sanitized = scripts.map(s => {
      const isOwner = req.user && req.user.id === s.userId;
      return {
        id: s.id,
        userId: s.userId,
        authorUsername: s.authorUsername,
        title: s.title,
        category: s.category,
        description: s.description,
        thumbnailUrl: s.thumbnailUrl,
        codeLength: s.code.length,
        isPasswordProtected: s.isPasswordProtected,
        accessCount: s.accessCount,
        lastAccessedAt: s.lastAccessedAt,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        accessKeysCount: s.accessKeys.length,
        // Only provide access keys if owner
        accessKeys: isOwner ? s.accessKeys : [],
        isOwner: Boolean(isOwner),
      };
    });

    return res.json({ scripts: sanitized });
  } catch (err) {
    console.error('Error fetching scripts:', err);
    return res.status(500).json({ error: 'Erro ao listar scripts.' });
  }
});

// GET /api/scripts/:id - Get specific script details
router.get('/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { key, password } = req.query as { key?: string; password?: string };
    const script = db.getScriptById(id);

    if (!script) {
      return res.status(404).json({ error: 'Script não encontrado com o ID especificado.' });
    }

    const isOwner = req.user && req.user.id === script.userId;

    let isAuthorized = false;

    if (!script.isPasswordProtected || isOwner) {
      isAuthorized = true;
    } else if (key && script.accessKeys.some(k => k.key === key)) {
      isAuthorized = true;
    } else if (password && script.passwordHash && bcrypt.compareSync(password, script.passwordHash)) {
      isAuthorized = true;
    }

    return res.json({
      script: {
        id: script.id,
        userId: script.userId,
        authorUsername: script.authorUsername,
        title: script.title,
        category: script.category,
        description: script.description,
        thumbnailUrl: script.thumbnailUrl,
        isPasswordProtected: script.isPasswordProtected,
        accessCount: script.accessCount,
        lastAccessedAt: script.lastAccessedAt,
        createdAt: script.createdAt,
        updatedAt: script.updatedAt,
        isOwner: Boolean(isOwner),
        isUnlocked: isAuthorized,
        // Only return code if authorized!
        code: isAuthorized ? script.code : '',
        accessKeys: isOwner ? script.accessKeys : (isAuthorized && key ? [{ key, name: 'Chave ativa', createdAt: '' }] : []),
      }
    });
  } catch (err) {
    console.error('Error getting script:', err);
    return res.status(500).json({ error: 'Erro ao buscar script.' });
  }
});

// POST /api/scripts - Create new script
router.post('/', optionalAuth, scriptsLimiter, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, category = '', description = '', code, thumbnailUrl = '', isPasswordProtected = false, password = '' } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'O título do script é obrigatório.' });
    }

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return res.status(400).json({ error: 'O código Luau não pode estar vazio.' });
    }

    if (code.length > 1024 * 1024) {
      return res.status(400).json({ error: 'O código Luau excede o limite máximo permitido de 1MB.' });
    }

    let passwordHash: string | undefined = undefined;
    const accessKeys: AccessKey[] = [];

    if (isPasswordProtected) {
      if (!password || typeof password !== 'string' || password.length < 4) {
        return res.status(400).json({ error: 'Scripts protegidos requerem uma senha com no mínimo 4 caracteres.' });
      }
      const salt = bcrypt.genSaltSync(10);
      passwordHash = bcrypt.hashSync(password, salt);

      // Auto generate a primary access key for the creator's loadstring
      accessKeys.push({
        key: db.generateAccessKey(),
        name: 'Chave Principal (Gerada automaticamente)',
        createdAt: new Date().toISOString(),
      });
    }

    const scriptId = db.generateUniqueId();
    const userId = req.user ? req.user.id : ('guest_' + Date.now().toString(36));
    const authorUsername = req.user ? req.user.username : 'Anônimo';

    const newScript: Script = {
      id: scriptId,
      userId,
      authorUsername,
      title: title.trim().slice(0, 100),
      category: typeof category === 'string' ? category.trim() : undefined,
      description: description.trim().slice(0, 500),
      code,
      thumbnailUrl: typeof thumbnailUrl === 'string' ? thumbnailUrl.trim() : undefined,
      isPasswordProtected: Boolean(isPasswordProtected),
      passwordHash,
      accessKeys,
      accessCount: 0,
      lastAccessedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.addScript(newScript);

    return res.status(201).json({
      message: 'Script Luau criado com sucesso!',
      script: {
        id: newScript.id,
        title: newScript.title,
        category: newScript.category,
        description: newScript.description,
        thumbnailUrl: newScript.thumbnailUrl,
        isPasswordProtected: newScript.isPasswordProtected,
        accessCount: newScript.accessCount,
        accessKeys: newScript.accessKeys,
        createdAt: newScript.createdAt,
      }
    });
  } catch (err) {
    console.error('Error creating script:', err);
    return res.status(500).json({ error: 'Erro ao criar script.' });
  }
});

// PUT /api/scripts/:id - Update script
router.put('/:id', requireAuth, scriptsLimiter, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, category, description, code, thumbnailUrl, isPasswordProtected, password } = req.body;

    const existing = db.getScriptById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Script não encontrado.' });
    }

    if (existing.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Você não tem permissão para editar este script.' });
    }

    const updates: Partial<Script> = {};

    if (category !== undefined) {
      updates.category = typeof category === 'string' ? category.trim() : '';
    }

    if (thumbnailUrl !== undefined) {
      updates.thumbnailUrl = typeof thumbnailUrl === 'string' ? thumbnailUrl.trim() : '';
    }

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ error: 'O título não pode estar vazio.' });
      }
      updates.title = title.trim().slice(0, 100);
    }

    if (description !== undefined) {
      updates.description = String(description).trim().slice(0, 500);
    }

    if (code !== undefined) {
      if (typeof code !== 'string' || code.trim().length === 0) {
        return res.status(400).json({ error: 'O código Luau não pode estar vazio.' });
      }
      if (code.length > 1024 * 1024) {
        return res.status(400).json({ error: 'O código Luau excede o limite máximo permitido de 1MB.' });
      }
      updates.code = code;
    }

    if (isPasswordProtected !== undefined) {
      const willBeProtected = Boolean(isPasswordProtected);
      updates.isPasswordProtected = willBeProtected;

      if (willBeProtected) {
        if (password) {
          if (password.length < 4) {
            return res.status(400).json({ error: 'A senha deve ter no mínimo 4 caracteres.' });
          }
          const salt = bcrypt.genSaltSync(10);
          updates.passwordHash = bcrypt.hashSync(password, salt);
        } else if (!existing.passwordHash) {
          return res.status(400).json({ error: 'Defina uma senha para proteger o script.' });
        }

        // If had no keys, generate one
        if (existing.accessKeys.length === 0) {
          updates.accessKeys = [
            {
              key: db.generateAccessKey(),
              name: 'Chave Principal',
              createdAt: new Date().toISOString(),
            }
          ];
        }
      } else {
        updates.passwordHash = undefined;
      }
    }

    const updated = db.updateScript(id, updates);
    return res.json({
      message: 'Script atualizado com sucesso!',
      script: {
        id: updated!.id,
        title: updated!.title,
        description: updated!.description,
        isPasswordProtected: updated!.isPasswordProtected,
        accessCount: updated!.accessCount,
        accessKeys: updated!.accessKeys,
        updatedAt: updated!.updatedAt,
      }
    });
  } catch (err) {
    console.error('Error updating script:', err);
    return res.status(500).json({ error: 'Erro ao atualizar script.' });
  }
});

// DELETE /api/scripts/:id - Delete script
router.delete('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = db.getScriptById(id);

    if (!existing) {
      return res.status(404).json({ error: 'Script não encontrado.' });
    }

    if (existing.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Você não tem permissão para excluir este script.' });
    }

    db.deleteScript(id, req.user!.id);
    return res.json({ message: 'Script excluído com sucesso!' });
  } catch (err) {
    console.error('Error deleting script:', err);
    return res.status(500).json({ error: 'Erro ao excluir script.' });
  }
});

// POST /api/scripts/:id/unlock - Test/Verify password to view script in UI
router.post('/:id/unlock', (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    if (!checkPasswordRateLimit(`unlock:${id}:${ip}`)) {
      return res.status(429).json({
        error: 'Muitas tentativas incorretas. Por segurança, tente novamente em 5 minutos.'
      });
    }

    const script = db.getScriptById(id);
    if (!script) {
      return res.status(404).json({ error: 'Script não encontrado.' });
    }

    if (!script.isPasswordProtected) {
      return res.json({
        message: 'Script público desbloqueado.',
        code: script.code,
      });
    }

    if (!script.passwordHash || !bcrypt.compareSync(password, script.passwordHash)) {
      return res.status(401).json({ error: 'Senha incorreta para este script.' });
    }

    resetPasswordRateLimit(`unlock:${id}:${ip}`);

    // Return the code and generate a temporary session access key so user can test loadstring
    let activeKey = script.accessKeys[0]?.key;
    if (!activeKey) {
      activeKey = db.generateAccessKey();
      script.accessKeys.push({
        key: activeKey,
        name: 'Chave gerada no desbloqueio',
        createdAt: new Date().toISOString(),
      });
      db.updateScript(id, { accessKeys: script.accessKeys });
    }

    return res.json({
      message: 'Script desbloqueado com sucesso!',
      code: script.code,
      accessKey: activeKey,
    });
  } catch (err) {
    console.error('Error unlocking script:', err);
    return res.status(500).json({ error: 'Erro ao validar senha do script.' });
  }
});

// POST /api/scripts/:id/keys - Create new Access Key (for script owner)
router.post('/:id/keys', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name = 'Nova Chave de Acesso' } = req.body;

    const script = db.getScriptById(id);
    if (!script) {
      return res.status(404).json({ error: 'Script não encontrado.' });
    }

    if (script.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Apenas o autor pode criar chaves de acesso.' });
    }

    const newKey: AccessKey = {
      key: db.generateAccessKey(),
      name: String(name).slice(0, 50),
      createdAt: new Date().toISOString(),
    };

    script.accessKeys.push(newKey);
    db.updateScript(id, { accessKeys: script.accessKeys });

    return res.status(201).json({
      message: 'Chave de acesso gerada com sucesso!',
      accessKey: newKey,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao gerar chave de acesso.' });
  }
});

// DELETE /api/scripts/:id/keys/:key - Revoke Access Key
router.delete('/:id/keys/:key', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id, key } = req.params;
    const script = db.getScriptById(id);
    if (!script) {
      return res.status(404).json({ error: 'Script não encontrado.' });
    }

    if (script.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Apenas o autor pode gerenciar chaves.' });
    }

    script.accessKeys = script.accessKeys.filter(k => k.key !== key);
    db.updateScript(id, { accessKeys: script.accessKeys });

    return res.json({ message: 'Chave revogada com sucesso!' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao revogar chave.' });
  }
});

export default router;
