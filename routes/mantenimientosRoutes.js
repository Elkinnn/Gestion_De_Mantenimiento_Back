const express = require('express');
const router = express.Router();
const { obtenerMantenimientos, obtenerFiltros } = require('../controllers/mantenimientoController');

// Ruta para obtener todos los mantenimientos
router.get('/', (req, res, next) => {
  console.log('GET /api/mantenimientos - Llamada recibida');
  next();
}, obtenerMantenimientos);

// Nueva ruta para obtener los filtros
router.get('/filtros', (req, res) => {
  console.log('GET /api/mantenimientos/filtros - Cargando filtros');
  obtenerFiltros(req, res);
});

module.exports = router;
