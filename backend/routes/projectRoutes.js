'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { uploadProjectImage } = require('../middleware/uploadMiddleware');

// GET /api/projects
router.get('/', ctrl.getAll);

// GET /api/projects/:idOrSlug
router.get('/:idOrSlug', ctrl.getOne);

// POST /api/projects (upload field 'image')
router.post('/', protect, uploadProjectImage, ctrl.create);

// PUT /api/projects/:id (upload field 'image')
router.put('/:id', protect, uploadProjectImage, ctrl.update);

// DELETE /api/projects/:id/image — remove image_url only (no record delete)
router.delete('/:id/image', protect, ctrl.removeImage);

// DELETE /api/projects/:id
router.delete('/:id', protect, ctrl.remove);

module.exports = router;