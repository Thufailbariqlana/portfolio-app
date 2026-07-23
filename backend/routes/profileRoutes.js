'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/profileController');
const { protect }    = require('../middleware/authMiddleware');
const { uploadPhoto, uploadCV } = require('../middleware/uploadMiddleware');

// GET  /api/profile  (public)
router.get('/', ctrl.getProfile);

// PUT  /api/profile  (admin — text fields only)
router.put('/', protect, ctrl.updateProfile);

// POST /api/profile/photo  (admin — uploads photo)
router.post('/photo', protect, uploadPhoto, ctrl.uploadPhoto);

// POST /api/profile/cv  (admin — uploads PDF/CV)
router.post('/cv', protect, uploadCV, ctrl.uploadCV);

module.exports = router;
