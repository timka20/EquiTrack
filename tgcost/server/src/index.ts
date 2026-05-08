import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import { testConnection } from './config/database';
import authRoutes from './routes/auth';
import platformRoutes from './routes/platforms';
import bookingRoutes from './routes/bookings';
import favoriteRoutes from './routes/favorites';
import adminRoutes from './routes/admin';
import notificationRoutes from './routes/notifications';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 64738;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:8382', 'http://tgcost.timka20.ru', 'https://tgcost.timka20.ru', 'https://api.tgcost.timka20.ru', 'http://127.0.0.1:8382', 'http://127.0.0.1:5173', 'http://127.0.0.1:4173', 'http://127.0.0.1:64738'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const uploadsPath = path.join(__dirname, '..', 'uploads');
console.log('📁 Serving uploads from:', uploadsPath);
app.use('/uploads', express.static(uploadsPath, {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

app.get('/debug/uploads', (req, res) => {
  try {
    const fs = require('fs');
    const materialsDir = path.join(uploadsPath, 'materials');
    const files = fs.existsSync(materialsDir) ? fs.readdirSync(materialsDir) : [];
    res.json({
      uploadsPath,
      materialsDir,
      files,
      exists: fs.existsSync(uploadsPath),
      materialsExists: fs.existsSync(materialsDir)
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/admin', adminRoutes);
  app.use('/api/notifications', notificationRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

async function startServer() {
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('❌ Failed to connect to database. Exiting...');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║         🚀 TGCost Server Started Successfully!         ║');
    console.log('╠════════════════════════════════════════════════════════╣');
    console.log(`║  Port: ${PORT}                                    ║`);
    console.log(`║  API: http://localhost:${PORT}/api                    ║`);
    console.log('║  Health: http://localhost:' + PORT + '/health                  ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
  });
}

startServer();
