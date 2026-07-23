'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/skills/categories  — must come BEFORE /:id to avoid route clash
router.get('/categories', ctrl.getCategories);

router.get('/',      ctrl.getAll);
router.get('/:id',   ctrl.getOne);
router.post('/',     protect, ctrl.create);
router.put('/:id',   protect, ctrl.update);
router.delete('/:id', protect, ctrl.remove);

module.exports = router;
