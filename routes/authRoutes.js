const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Importar el controlador
const { authenticateToken } = require('../middleware/authMiddleware'); // Middleware de autenticación

// Ruta de login
router.post('/login', authController.login); // Vincula la lógica del login con el controlador

// Ruta protegida del dashboard
router.get('/dashboard', authenticateToken, (req, res) => {
  res.json({ message: 'Bienvenido al dashboard', user: req.user });
});

module.exports = router;
