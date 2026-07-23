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

// ── Trust proxy (required on Render, Railway, Heroku, etc.) ─────────────────
// Render sits behind a reverse proxy; this lets express see the real client IP
// and allows express-rate-limit to work correctly.
app.set('trust proxy', 1);

// ── Security Headers (Helmet) ─────────────────────────────────────────────────
app.use(helmet({
  // Allow images served from /uploads to be loaded by cross-origin frontends
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// ── Dynamic CORS ──────────────────────────────────────────────────────────────
// CORS_ORIGINS in .env is a comma-separated list, e.g.:
//   http://localhost:5500,https://my-portfolio.vercel.app,https://my-admin.vercel.app
//
// In addition we ALWAYS allow *.vercel.app and *.netlify.app preview deployments
// so you don't have to update the env var for every Vercel preview branch.

const staticOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

// Dynamic-pattern matchers for cloud preview URLs
const dynamicPatterns = [
  /^https:\/\/[a-z0-9\-]+\.vercel\.app$/,
  /^https:\/\/[a-z0-9\-]+\.netlify\.app$/
];

function isAllowedOrigin(origin) {
  if (!origin) return true;                           // allow non-browser clients
  if (staticOrigins.includes(origin)) return true;   // exact match
  return dynamicPatterns.some(re => re.test(origin)); // wildcard patterns
}

app.use(cors({
  origin: (origin, cb) => {
    if (isAllowedOrigin(origin)) return cb(null, true);
    console.warn(`[CORS] Blocked origin: ${origin}`);
    cb(new Error(`CORS: origin "${origin}" not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Respond to OPTIONS pre-flight immediately
app.options('*', cors());

// ── General Middleware ────────────────────────────────────────────────────────
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static: serve uploaded files ──────────────────────────────────────────────
// On Render free tier the filesystem is ephemeral — uploaded files won't persist
// across deploys/restarts. Consider using Cloudinary or S3 for persistent uploads.
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

// Stricter limiter for auth (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again in 15 minutes.' }
});
app.use('/api/auth/', authLimiter);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    status: 'OK',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
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
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message || err);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ── Bootstrap ─────────────────────────────────────────────────────────────────
(async () => {
  await testConnection();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀  Portfolio API → http://0.0.0.0:${PORT}`);
    console.log(`    ENV      : ${process.env.NODE_ENV || 'development'}`);
    console.log(`    DB Host  : ${process.env.DB_HOST}`);
    console.log(`    SSL      : ${process.env.DB_SSL === 'true' ? 'enabled ✅' : 'disabled'}\n`);
  });
})();
