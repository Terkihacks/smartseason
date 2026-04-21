const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth, requireRole } = require('../middleware/auth');
const c = require('../controllers/user.controller');

const router = Router();

router.use(requireAuth, requireRole('ADMIN'));
router.get('/', asyncHandler(c.listUsers));

module.exports = router;
