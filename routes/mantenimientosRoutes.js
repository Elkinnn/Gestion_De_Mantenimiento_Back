const express = require('express');
const router = express.Router();
const {
  obtenerMantenimientos,
  obtenerFiltros,
  obtenerUltimoNumero,
  crearMantenimiento, // Crear mantenimiento con activos y especificaciones
} = require('../controllers/mantenimientoController');

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

// Ruta para obtener el último número de mantenimiento
router.get('/ultimo-numero', (req, res) => {
  console.log('GET /api/mantenimientos/ultimo-numero - Obteniendo último número');
  obtenerUltimoNumero(req, res); // Llamar al controlador
});

// Ruta para registrar un nuevo mantenimiento con sus activos y especificaciones
router.post('/', crearMantenimiento); // Cambiamos a '/registrar' para mayor claridad

module.exports = router;
