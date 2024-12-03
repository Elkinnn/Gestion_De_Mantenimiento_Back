const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Ruta para el registro de usuario
router.post('/register', authController.register);

// Ruta para el login de usuario
router.post('/login', authController.login);

// Ruta para obtener los datos del usuario autenticado
router.get('/user', authenticateToken, authController.getUser);

module.exports = router;
