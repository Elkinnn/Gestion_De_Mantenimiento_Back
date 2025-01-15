const express = require('express');
const router = express.Router();
const { getProveedores } = require('../controllers/proveedorController');

// Ruta para obtener todos los proveedores
router.get('/', getProveedores);

module.exports = router;
