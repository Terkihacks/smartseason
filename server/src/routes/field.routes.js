const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth, requireRole } = require('../middleware/auth');
const c = require('../controllers/field.controller');

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(c.listFields));
router.post('/', requireRole('ADMIN'), asyncHandler(c.createField));
router.get('/:id', asyncHandler(c.getField));
router.patch('/:id/stage', asyncHandler(c.updateStage));
router.post('/:id/notes', asyncHandler(c.addNote));
router.post('/:id/assign', requireRole('ADMIN'), asyncHandler(c.assignField));
router.delete('/:id', requireRole('ADMIN'), asyncHandler(c.deleteField));

module.exports = router;
