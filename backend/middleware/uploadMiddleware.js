'use strict';

const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function untuk membuat storage dinamis
const createCloudinaryStorage = (folderName = 'portfolio_uploads') => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folderName,
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'pdf'],
    },
  });
};

// Middleware dinamis dengan dukungan nama field kustom
const uploadToCloudinaryMiddleware = (folderName, fieldName = 'file') => {
  const storage = createCloudinaryStorage(folderName);
  const upload = multer({ storage });
  return upload.single(fieldName);
};

// Memory storage jika ingin memproses buffer file secara manual (misal dengan Sharp)
const uploadSingle = (fieldName = 'file') => multer({ storage: multer.memoryStorage() }).single(fieldName);

// Middleware khusus upload sertifikat dengan field 'image'
const uploadCertImage = multer({ storage: createCloudinaryStorage('portfolio/certificates') }).single('image');

module.exports = {
  uploadToCloudinaryMiddleware,
  uploadSingle,
  uploadCertImage,
};