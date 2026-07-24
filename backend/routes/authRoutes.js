'use strict';

const router = require('express').Router();
const auth   = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/login
router.post('/login', auth.login);

// GET  /api/auth/me  (protected)
router.get('/me', protect, auth.getMe);

// PUT  /api/auth/change-password  (protected)
router.put('/change-password', protect, auth.changePassword);

module.exports = router;