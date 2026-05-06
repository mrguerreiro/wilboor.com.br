const express = require('express');
const router = express.Router();
const { createUser, loginUser, getUsers } = require('../controllers/userController');
const authMiddleware = require('../controllers/authMiddleware');

// Rota para criar um novo usuário
router.post('/', createUser);

// Rota para login do usuário
router.post('/login', loginUser);

// Rota para obter todos os usuários (opcional, para admin), protegida por autenticação
router.get('/', authMiddleware, getUsers);

module.exports = router;
