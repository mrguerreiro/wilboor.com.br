const express = require('express');
const router = express.Router();
const { getAdminProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const authMiddleware = require('../controllers/authMiddleware');

router.get('/', authMiddleware, getAdminProducts);
router.post('/', authMiddleware, createProduct);
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

module.exports = router;
