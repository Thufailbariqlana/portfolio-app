'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/experienceController');
const { protect } = require('../middleware/authMiddleware');

// GET    /api/experiences        (public)
router.get('/',     ctrl.getAll);
// GET    /api/experiences/:id    (public)
router.get('/:id',  ctrl.getOne);
// POST   /api/experiences        (admin)
router.post('/',    protect, ctrl.create);
// PUT    /api/experiences/:id    (admin)
router.put('/:id',  protect, ctrl.update);
// DELETE /api/experiences/:id    (admin)
router.delete('/:id', protect, ctrl.remove);

module.exports = router;
