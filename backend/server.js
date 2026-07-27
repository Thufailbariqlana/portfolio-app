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

// ── Trust proxy (Penting untuk Vercel / Reverse Proxy Rate Limiter) ──────────
app.set('trust proxy', 1);

// ── Security Headers (Helmet) ─────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// ── Safe & Production-Ready CORS ──────────────────────────────────────────────
// Membaca daftar origin dari env CORS_ORIGINS (comma-separated, no trailing slash)
// Contoh: https://portfolio.vercel.app,https://admin.vercel.app
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Izinkan jika tidak ada origin (curl / server-to-server) atau origin ada di daftar
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`[CORS] Blocked origin: ${origin}`);
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-CSRF-Token']
};

app.use(cors(corsOptions));

// ── General Body Parsing & Compression ────────────────────────────────────────
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static Files (Fallback) ───────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Rate Limiters ─────────────────────────────────────────────────────────────
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

// ── Public Cache Middleware ───────────────────────────────────────────────────
// Adds Cache-Control: public, max-age=300 (5 min) to GET responses only.
// PUT / POST / DELETE (admin writes) pass through untouched because those
// routes are mounted *without* this middleware.
function setPublicCache(req, res, next) {
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
  }
  next();
}

// ── Health Checks ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    status: 'OK',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (_req, res) => {
  res.json({ success: true, message: 'Portfolio API Backend is Running on Vercel Serverless!' });
});

// ── API Routes Mount ──────────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
// Public read-only routes get cache headers
app.use('/api/profile',      setPublicCache, profileRoutes);
app.use('/api/experiences',  setPublicCache, experienceRoutes);
app.use('/api/projects',     setPublicCache, projectRoutes);
app.use('/api/education',    setPublicCache, educationRoutes);
app.use('/api/certificates', setPublicCache, certificateRoutes);
app.use('/api/skills',       setPublicCache, skillRoutes);
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

// ── Local Development Runner ──────────────────────────────────────────────────
if (!process.env.VERCEL) {
  (async () => {
    try {
      await testConnection();
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n🚀 Portfolio API running local → http://localhost:${PORT}`);
      });
    } catch (dbErr) {
      console.error('❌ Failed to connect DB locally:', dbErr.message);
      // Lokal boleh exit agar developer langsung tahu ada masalah DB
      process.exit(1);
    }
  })();
}

// Export app untuk Vercel Serverless Function
module.exports = app;