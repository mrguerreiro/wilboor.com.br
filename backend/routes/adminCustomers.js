const express = require('express');
const router = express.Router();
const authMiddleware = require('../controllers/authMiddleware');
const { getCustomers, getCustomerById, deleteCustomer } = require('../controllers/adminCustomerController');

router.get('/', authMiddleware, getCustomers);
router.get('/:id', authMiddleware, getCustomerById);
router.delete('/:id', authMiddleware, deleteCustomer);

module.exports = router;
