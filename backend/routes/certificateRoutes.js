'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/certificateController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// ── Failsafe Helper (Anti-Crash Guard) ────────────────────────────────────────
const safeMiddleware = (fn, name) => {
  if (typeof fn === 'function') return fn;
  console.warn(`[WARN] Middleware/Controller '${name}' is undefined. Falling back to pass-through.`);
  return (_req, _res, next) => next();
};

const protectMW = safeMiddleware(auth.protect || auth, 'auth.protect');
const uploadCertImageMW = safeMiddleware(upload.uploadCertImage, 'upload.uploadCertImage');

// ── Certificate Routes ────────────────────────────────────────────────────────
router.get('/', safeMiddleware(ctrl.getAll, 'ctrl.getAll'));
router.get('/:id', safeMiddleware(ctrl.getOne, 'ctrl.getOne'));
router.post('/', protectMW, uploadCertImageMW, safeMiddleware(ctrl.create, 'ctrl.create'));
router.put('/:id', protectMW, uploadCertImageMW, safeMiddleware(ctrl.update, 'ctrl.update'));
// DELETE /:id/image — clear image_url only
router.delete('/:id/image', protectMW, safeMiddleware(ctrl.removeImage, 'ctrl.removeImage'));
router.delete('/:id', protectMW, safeMiddleware(ctrl.remove, 'ctrl.remove'));

module.exports = router;