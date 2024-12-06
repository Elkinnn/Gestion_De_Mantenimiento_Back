const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Importar el controlador
const { authenticateToken, authorizeRole, authorizeRoles } = require('../middleware/authMiddleware'); // Middlewares de autenticación y autorización

// Ruta de login
router.post('/login', authController.login); // Ruta pública

// Ruta protegida para Admin
router.get('/dashboard', authenticateToken, authorizeRole('Admin'), (req, res) => {
  res.json({ message: 'Bienvenido al dashboard', user: req.user });
});

// Ruta protegida para el menú de activos (Acceso permitido a Admin y Técnico)
router.get('/menu', authenticateToken, authorizeRoles(['Admin', 'Tecnico']), (req, res) => {
  res.json({ message: 'Acceso al menú de activos', user: req.user });
});

// Ruta protegida de mantenimiento (Solo acceso para Técnicos)
router.get('/mantenimiento', authenticateToken, authorizeRole('Tecnico'), (req, res) => {
  res.json({ message: 'Acceso a mantenimiento', user: req.user });
});

module.exports = router;
