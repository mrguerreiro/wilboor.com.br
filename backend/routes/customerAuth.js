const express = require('express');
const router = express.Router();
const {
    registerCustomer,
    verifyEmail,
    loginCustomer,
    refreshCustomerToken,
    logoutCustomer,
    resendVerification,
    getMe,
    updateMe
} = require('../controllers/customerAuthController');
const authMiddleware = require('../controllers/authMiddleware');
const { loginLimiter, registerLimiter, resendLimiter } = require('../middleware/rateLimiter');
const { registerRules, loginRules, resendRules } = require('../middleware/validators');

router.post('/register', registerLimiter, registerRules, registerCustomer);
router.get('/verify/:token', verifyEmail);
router.post('/login', loginLimiter, loginRules, loginCustomer);
router.post('/refresh', refreshCustomerToken);
router.post('/logout', authMiddleware, logoutCustomer);
router.post('/resend-verification', resendLimiter, resendRules, resendVerification);
router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, updateMe);

module.exports = router;
