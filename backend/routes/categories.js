const express = require('express');
const router = express.Router();
const { createCategory, getCategories } = require('../controllers/categoryController');

// Rota para criar uma nova categoria
router.post('/', createCategory);

// Rota para obter todas as categorias
router.get('/', getCategories);

module.exports = router;