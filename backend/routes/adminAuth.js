const express = require('express');
const router = express.Router();
const { loginAdmin, validateAdmin } = require('../controllers/adminAuthController');
const authMiddleware = require('../controllers/authMiddleware');
const { adminLoginLimiter } = require('../middleware/rateLimiter');
const { adminLoginRules } = require('../middleware/validators');

router.post('/login', adminLoginLimiter, adminLoginRules, loginAdmin);
router.get('/validate', authMiddleware, validateAdmin);

module.exports = router;
