const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const c = require('../controllers/dashboard.controller');

const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(c.getDashboard));

module.exports = router;
