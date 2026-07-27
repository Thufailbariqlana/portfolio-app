'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle, uploadToCloudinaryMiddleware } = require('../middleware/uploadMiddleware');

// GET  /api/profile  (public)
router.get('/', ctrl.getProfile);

// PUT  /api/profile  (admin — text fields only)
router.put('/', protect, ctrl.updateProfile);

// POST /api/profile/photo  (admin — uploads photo to Cloudinary)
router.post('/photo', protect, uploadSingle, uploadToCloudinaryMiddleware('portfolio/photos'), ctrl.uploadPhoto);

// POST /api/profile/cv  (admin — uploads PDF/CV to Cloudinary)
router.post('/cv', protect, uploadSingle, uploadToCloudinaryMiddleware('portfolio/cv'), ctrl.uploadCV);

module.exports = router;