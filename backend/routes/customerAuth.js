const express = require('express');
const router = express.Router();
const {
    registerCustomer,
    verifyEmail,
    loginCustomer,
    resendVerification,
    getMe,
    updateMe
} = require('../controllers/customerAuthController');
const authMiddleware = require('../controllers/authMiddleware');

router.post('/register', registerCustomer);
router.get('/verify/:token', verifyEmail);
router.post('/login', loginCustomer);
router.post('/resend-verification', resendVerification);
router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, updateMe);

module.exports = router;
