const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const c = require('../controllers/auth.controller');

const router = Router();

router.post('/register', asyncHandler(c.register));
router.post('/login', asyncHandler(c.login));
router.post('/logout', asyncHandler(c.logout));
router.get('/me', requireAuth, asyncHandler(c.me));

module.exports = router;
