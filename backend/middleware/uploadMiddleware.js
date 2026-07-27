'use strict';

const multer = require('multer');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const uploadToCloudinaryMiddleware = (folderName = 'projects') => {
  return async (req, res, next) => {
    try {
      if (!req.file) return next();

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
      
      req.file.filename = result.secure_url;
      req.file.path = result.secure_url;

      next();
    } catch (err) {
      console.error('[Cloudinary Upload Error]:', err);
      return res.status(500).json({ success: false, message: 'Failed to upload image to cloud storage.' });
    }
  };
};

// Middleware kombinasi untuk rute project (Upload Single Image + Kirim ke Cloudinary)
const uploadProjectImage = [
  upload.single('image'),
  uploadToCloudinaryMiddleware('projects')
];

module.exports = {
  uploadSingle: upload.single('image'),
  uploadToCloudinaryMiddleware,
  uploadProjectImage
};