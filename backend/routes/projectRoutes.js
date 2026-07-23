'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/projectController');
const { protect }           = require('../middleware/authMiddleware');
const { uploadProjectImage } = require('../middleware/uploadMiddleware');

// GET    /api/projects                 (public, supports ?featured=true&category=)
router.get('/',              ctrl.getAll);
// GET    /api/projects/:idOrSlug       (public)
router.get('/:idOrSlug',     ctrl.getOne);
// POST   /api/projects                 (admin + optional image upload)
router.post('/',             protect, uploadProjectImage, ctrl.create);
// PUT    /api/projects/:id             (admin + optional image upload)
router.put('/:id',           protect, uploadProjectImage, ctrl.update);
// DELETE /api/projects/:id             (admin)
router.delete('/:id',        protect, ctrl.remove);

module.exports = router;
