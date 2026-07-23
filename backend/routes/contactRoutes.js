'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/contacts               (public — visitor submits form)
router.post('/',               ctrl.submit);

// GET  /api/contacts               (admin — list all messages, ?unread=true)
router.get('/',                protect, ctrl.getAll);

// GET  /api/contacts/:id           (admin — view single message, auto-marks read)
router.get('/:id',             protect, ctrl.getOne);

// PATCH /api/contacts/:id/read     (admin — toggle read status)
router.patch('/:id/read',      protect, ctrl.markRead);

// DELETE /api/contacts/:id         (admin — delete message)
router.delete('/:id',          protect, ctrl.remove);

module.exports = router;
