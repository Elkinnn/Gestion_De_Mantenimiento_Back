const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const activoController = require('../controllers/activoController');
const { getProcesoCompra, getCodigoActivo, getDatosCombo, insertarActivo } = require('../controllers/activoCrearController');

// Ruta para obtener los activos
router.get('/menu', authenticateToken, activoController.getAllActivos);

// Ruta para obtener el siguiente proceso de compra
router.get('/proceso-compra', authenticateToken, getProcesoCompra);

// Ruta para obtener el siguiente código de activo
router.get('/codigo', authenticateToken, getCodigoActivo);

// Ruta para obtener datos para los combos
router.get('/combo/:tabla', authenticateToken, getDatosCombo);

// Ruta para insertar un nuevo activo
router.post('/', authenticateToken, insertarActivo);

module.exports = router;
