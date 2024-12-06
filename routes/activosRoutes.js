const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Ruta para listar los activos (disponible para técnicos y administradores)
router.get('/menu', authenticateToken, (req, res) => {
  res.json({ message: 'Lista de activos registrados' });
});

// Ruta para realizar mantenimiento (solo disponible para técnicos)
router.post('/mantenimiento', authenticateToken, authorizeRole('Tecnico'), (req, res) => {
  res.json({ message: 'Formulario de mantenimiento enviado' });
});

// Ruta para funcionalidades administrativas (solo disponible para administradores)
router.post('/admin', authenticateToken, authorizeRole('Admin'), (req, res) => {
  res.json({ message: 'Acceso a funcionalidades administrativas' });
});

module.exports = router;
