'use strict';

require('dotenv').config();
const express      = require('express');
const helmet       = require('helmet');
const cors         = require('cors');
const compression  = require('compression');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');
const path         = require('path');

const { testConnection } = require('./config/db');

// ── Routes ────────────────────────────────────────────────────────────────────
const authRoutes        = require('./routes/authRoutes');
const profileRoutes     = require('./routes/profileRoutes');
const experienceRoutes  = require('./routes/experienceRoutes');
const projectRoutes     = require('./routes/projectRoutes');
const educationRoutes   = require('./routes/educationRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const skillRoutes       = require('./routes/skillRoutes');
const contactRoutes     = require('./routes/contactRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Trust proxy ───────────────────────────────────────────────────────────────
app.set('trust proxy', 1);

// ── Security Headers (Helmet) ─────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// ── Simple & Safe CORS for Vercel Serverless ─────────────────────────────────
const corsOptions = {
  origin: true, // Dinamis mengizinkan origin mana pun yang memanggil
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-CSRF-Token']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle semua preflight request

// ── General Middleware ────────────────────────────────────────────────────────
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static Files ──────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Global Rate Limiter ───────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again in 15 minutes.' }
});
app.use('/api/auth', authLimiter);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    status: 'OK',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint test
app.get('/', (_req, res) => {
  res.json({ success: true, message: 'Portfolio API Backend is Running on Vercel Serverless!' });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/profile',      profileRoutes);
app.use('/api/experiences',  experienceRoutes);
app.use('/api/projects',     projectRoutes);
app.use('/api/education',    educationRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/skills',       skillRoutes);
app.use('/api/contacts',     contactRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found.' });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message || err);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ── Mode Handling (Serverless Vercel vs Local) ────────────────────────────────
if (!process.env.VERCEL) {
  // Hanya jalankan app.listen & testConnection secara async jika di LOCAL
  (async () => {
    await testConnection();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀  Portfolio API → http://0.0.0.0:${PORT}`);
    });
  })();
}

// Export app untuk Vercel Serverless Function
module.exports = app;