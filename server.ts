import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import authRoutes from './server/routes/auth.js';
import scriptRoutes from './server/routes/scripts.js';
import rawRoutes from './server/routes/raw.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Basic security and parsing middlewares
  app.set('trust proxy', true);
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // Global CORS headers for API and RAW
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Script-Key, X-Access-Key');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // RAW loadstring route FIRST: /raw/:id (and /api/raw/:id alias)
  app.use('/raw', rawRoutes);
  app.use('/api/raw', rawRoutes);

  // API REST routes
  app.use('/api/auth', authRoutes);
  app.use('/api/scripts', scriptRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'LuauRaw Service',
      time: new Date().toISOString()
    });
  });

  // Serve Vite development or production build
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LuauRaw] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[LuauRaw] Failed to start server:', err);
  process.exit(1);
});
