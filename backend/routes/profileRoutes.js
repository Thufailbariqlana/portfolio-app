'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const { uploadToCloudinaryMiddleware } = require('../middleware/uploadMiddleware');

// GET /api/profile (public)
router.get('/', ctrl.getProfile);

// PUT /api/profile (admin — text fields only)
router.put('/', protect, ctrl.updateProfile);

// POST /api/profile/photo (admin — langsung upload ke Cloudinary)
router.post('/photo', protect, uploadToCloudinaryMiddleware('portfolio/photos', 'file'), ctrl.uploadPhoto);

// POST /api/profile/cv (admin — langsung upload ke Cloudinary)
router.post('/cv', protect, uploadToCloudinaryMiddleware('portfolio/cv', 'file'), ctrl.uploadCV);

module.exports = router;