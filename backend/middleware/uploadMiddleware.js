'use strict';

const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Konfigurasi Cloudinary menggunakan environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function untuk membuat storage dinamis berdasarkan folder
const createCloudinaryStorage = (folderName = 'portfolio_uploads') => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folderName,
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'pdf'],
    },
  });
};

// Middleware dinamis (untuk profileRoutes yang memanggil dengan argumen folder)
const uploadToCloudinaryMiddleware = (folderName) => {
  const storage = createCloudinaryStorage(folderName);
  const upload = multer({ storage: storage });
  return upload.single('file'); // Default field name 'file' atau 'image'
};

// Middleware khusus multer memory / temporary upload
const uploadSingle = multer({ storage: multer.memoryStorage() }).single('file');

// Middleware khusus upload sertifikat dengan field 'image'
const uploadCertImage = multer({ storage: createCloudinaryStorage('portfolio/certificates') }).single('image');

module.exports = {
  uploadToCloudinaryMiddleware,
  uploadSingle,
  uploadCertImage,
};