'use strict';

const multer = require('multer');
const path   = require('path');
const fs     = require('fs');
const { v4: uuidv4 } = require('uuid');

const MAX_SIZE = Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5 MB default
const UPLOAD_BASE = path.resolve(process.env.UPLOAD_DIR || './uploads');

// ── Allowed MIME types ─────────────────────────────────────────────────────────
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOCS = ['application/pdf', ...ALLOWED_MIME];

/**
 * Create a multer storage (MemoryStorage for Vercel, DiskStorage for Local).
 * @param {string} subfolder  e.g. 'photos', 'projects', 'certificates'
 */
function makeStorage(subfolder) {
  // Jika di Vercel Serverless, gunakan MemoryStorage (RAM sementara)
  if (process.env.VERCEL) {
    return multer.memoryStorage();
  }

  // Jika di lingkungan Local Development (Laptop)
  const dest = path.join(UPLOAD_BASE, subfolder);
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dest),
    filename: (_req, file, cb) => {
      const ext      = path.extname(file.originalname).toLowerCase();
      const filename = `${uuidv4()}${ext}`;
      cb(null, filename);
    }
  });
}

/**
 * Generic file filter factory.
 * @param {string[]} allowedMimes
 */
function makeFilter(allowedMimes) {
  return (_req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: ${allowedMimes.join(', ')}`));
    }
  };
}

// ── Multer instances ──────────────────────────────────────────────────────────

/** Upload profile photo (images only, field: "photo") */
const uploadPhoto = multer({
  storage: makeStorage('photos'),
  limits: { fileSize: MAX_SIZE },
  fileFilter: makeFilter(ALLOWED_MIME)
}).single('photo');

/** Upload project image (images only, field: "image") */
const uploadProjectImage = multer({
  storage: makeStorage('projects'),
  limits: { fileSize: MAX_SIZE },
  fileFilter: makeFilter(ALLOWED_MIME)
}).single('image');

/** Upload certificate image (images only, field: "image") */
const uploadCertImage = multer({
  storage: makeStorage('certificates'),
  limits: { fileSize: MAX_SIZE },
  fileFilter: makeFilter(ALLOWED_MIME)
}).single('image');

/** Upload CV / resume (PDF or image, field: "cv") */
const uploadCV = multer({
  storage: makeStorage('photos'),
  limits: { fileSize: MAX_SIZE },
  fileFilter: makeFilter(ALLOWED_DOCS)
}).single('cv');

/**
 * Wrap a multer instance in a promise so it can be used with async/await.
 * Converts multer errors into HTTP 400 responses.
 * @param {Function} multerFn  Single multer upload handler
 */
function handleUpload(multerFn) {
  return (req, res, next) => {
    multerFn(req, res, (err) => {
      if (!err) return next();
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, message: `File too large. Maximum size is ${MAX_SIZE / 1024 / 1024} MB.` });
        }
        return res.status(400).json({ success: false, message: err.message });
      }
      return res.status(400).json({ success: false, message: err.message });
    });
  };
}

module.exports = {
  uploadPhoto:        handleUpload(uploadPhoto),
  uploadProjectImage: handleUpload(uploadProjectImage),
  uploadCertImage:    handleUpload(uploadCertImage),
  uploadCV:           handleUpload(uploadCV)
};