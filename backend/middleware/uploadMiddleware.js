'use strict';

const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Konfigurasi Cloudinary menggunakan environment variables yang sudah diset di Vercel
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Gunakan memoryStorage agar file ditampung sementara di RAM (mendukung Serverless Vercel)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Batas maksimal ukuran file 5MB
});

// Middleware helper untuk melakukan upload ke Cloudinary setelah file diterima multer
const uploadToCloudinaryMiddleware = (folderName = 'portfolio') => {
  return async (req, res, next) => {
    try {
      if (!req.file) return next();

      // Buat stream upload ke Cloudinary dari buffer memori
      const streamUpload = (reqFile) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: folderName },
            (error, result) => {
              if (result) {
                resolve(result);
              } else {
                reject(error);
              }
            }
          );
          stream.end(reqFile.buffer);
        });
      };

      const result = await streamUpload(req.file);
      
      // Simpan URL publik Cloudinary ke req.file.filename atau path kustom agar bisa dibaca controller
      req.file.filename = result.secure_url;
      req.file.path = result.secure_url;

      next();
    } catch (err) {
      console.error('[Cloudinary Upload Error]:', err);
      return res.status(500).json({ success: false, message: 'Failed to upload image to cloud storage.' });
    }
  };
};

module.exports = {
  uploadSingle: upload.single('image'), // Sesuaikan nama field form (misal 'image' atau 'attachment')
  uploadToCloudinaryMiddleware
};