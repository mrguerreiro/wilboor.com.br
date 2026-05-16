const express = require('express');
const router = express.Router();
const { loginAdmin, validateAdmin } = require('../controllers/adminAuthController');
const authMiddleware = require('../controllers/authMiddleware');

router.post('/login', loginAdmin);
router.get('/validate', authMiddleware, validateAdmin);

module.exports = router;
