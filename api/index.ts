import express from 'express';
import authRoutes from '../server/routes/auth.js';
import scriptRoutes from '../server/routes/scripts.js';
import rawRoutes from '../server/routes/raw.js';

const app = express();

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

// RAW loadstring route
app.use('/raw', rawRoutes);
app.use('/api/raw', rawRoutes);

// API REST routes
app.use('/api/auth', authRoutes);
app.use('/api/scripts', scriptRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ScriptsGR Vercel Serverless',
    time: new Date().toISOString(),
  });
});

export default app;
