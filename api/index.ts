import express, { Request, Response, NextFunction } from 'express';
import authRoutes from '../server/routes/auth.js';
import scriptRoutes from '../server/routes/scripts.js';
import rawRoutes from '../server/routes/raw.js';

const app = express();

app.set('trust proxy', true);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Global CORS headers for API and RAW
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Script-Key, X-Access-Key');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// RAW loadstring endpoints (Roblox loadstring compatible)
app.use('/raw', rawRoutes);
app.use('/api/raw', rawRoutes);

// API REST routes
app.use('/api/auth', authRoutes);
app.use('/api/scripts', scriptRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'ScriptsGR Vercel Serverless',
    time: new Date().toISOString(),
  });
});

// Catch-all for /api 404 (JSON)
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint da API não encontrado.' });
});

// Catch-all for /raw 404 (Pure text/plain)
app.use('/raw/*', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.status(404).send('Script not found');
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[ScriptsGR] Server error:', err);
  if (req.originalUrl?.startsWith('/raw') || req.url?.startsWith('/raw')) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(500).send('Internal Server Error');
  }
  return res.status(500).json({ error: 'Erro interno no servidor.' });
});

export default app;
