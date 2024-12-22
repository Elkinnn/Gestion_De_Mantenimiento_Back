const express = require('express');
const router = express.Router();
const { obtenerMantenimientos } = require('../controllers/mantenimientoController'); // Importar el controlador

// Ruta para obtener todos los mantenimientos
router.get('/', (req, res, next) => {
  console.log('GET /api/mantenimientos - Llamada recibida');
  next();
}, obtenerMantenimientos);

module.exports = router;
