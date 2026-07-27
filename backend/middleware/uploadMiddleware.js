'use strict';

const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ── Validasi environment variables Cloudinary saat modul dimuat ───────────────
const REQUIRED_CLOUDINARY_VARS = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];
REQUIRED_CLOUDINARY_VARS.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`[uploadMiddleware] WARNING: env var ${key} is not set. File uploads will fail.`);
  }
});

// ── Konfigurasi Cloudinary ────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Helper: buat CloudinaryStorage dinamis ────────────────────────────────────
const createCloudinaryStorage = (folderName = 'portfolio_uploads') => {
  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder:           folderName,
      allowed_formats:  ['jpg', 'png', 'jpeg', 'webp', 'pdf'],
      // resource_type auto agar PDF ikut tersimpan
      resource_type:    'auto',
    },
  });
};

// ── Middleware dinamis (folder + fieldName kustom) ────────────────────────────
const uploadToCloudinaryMiddleware = (folderName, fieldName = 'file') => {
  const storage = createCloudinaryStorage(folderName);
  return multer({ storage }).single(fieldName);
};

// ── Memory storage (untuk proses buffer manual, misal Sharp) ─────────────────
const uploadSingle = (fieldName = 'file') =>
  multer({ storage: multer.memoryStorage() }).single(fieldName);

// ── Upload sertifikat — field 'image' ─────────────────────────────────────────
const uploadCertImage = multer({
  storage: createCloudinaryStorage('portfolio/certificates'),
}).single('image');

// ── Upload foto profil — field 'photo' ───────────────────────────────────────
const uploadPhoto = multer({
  storage: createCloudinaryStorage('portfolio/photos'),
}).single('photo');

// ── Upload CV — field 'cv' ────────────────────────────────────────────────────
const uploadCV = multer({
  storage: createCloudinaryStorage('portfolio/cv'),
}).single('cv');

// ── Upload gambar project — field 'image' ─────────────────────────────────────
const uploadProjectImage = multer({
  storage: createCloudinaryStorage('portfolio/projects'),
}).single('image');

module.exports = {
  uploadToCloudinaryMiddleware,
  uploadSingle,
  uploadCertImage,
  uploadPhoto,
  uploadCV,
  uploadProjectImage,
};