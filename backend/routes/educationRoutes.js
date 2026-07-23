'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/educationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/',      ctrl.getAll);
router.get('/:id',   ctrl.getOne);
router.post('/',     protect, ctrl.create);
router.put('/:id',   protect, ctrl.update);
router.delete('/:id', protect, ctrl.remove);

module.exports = router;
