const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const activoController = require('../controllers/activoController');

// Ruta para obtener los activos
router.get('/menu', authenticateToken, activoController.getAllActivos); // Llamamos a getAllActivos para obtener todos los activos

module.exports = router;
