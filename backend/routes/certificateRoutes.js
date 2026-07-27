'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/certificateController');
const { protect }        = require('../middleware/authMiddleware');
const { uploadCertImage } = require('../middleware/uploadMiddleware');

router.get('/',      ctrl.getAll);
router.get('/:id',   ctrl.getOne);
router.post('/',     protect, uploadCertImage, ctrl.create);
router.put('/:id',   protect, uploadCertImage, ctrl.update);
router.delete('/:id', protect, ctrl.remove);

module.exports = router;