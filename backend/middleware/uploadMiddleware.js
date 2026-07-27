'use strict';

const multer = require('multer');

// Gunakan MemoryStorage agar ramah Serverless (Vercel filesystem bersifat read-only)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit 5MB
  fileFilter: fileFilter
});

// Middleware helper khusus single image upload
const uploadCertImage = (req, res, next) => {
  const singleUpload = upload.single('image');
  singleUpload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

module.exports = {
  upload,
  uploadCertImage
};