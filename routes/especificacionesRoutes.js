const express = require('express');
const router = express.Router();
const {
  obtenerActividadesPorTipo,
  obtenerComponentesPorTipo,
} = require('../controllers/especificacionesController'); // Asegúrate de que la ruta sea correcta

// Ruta para obtener actividades por tipo de activo
router.get('/actividades', (req, res, next) => {
  console.log('GET /api/especificaciones/actividades - Cargando actividades');
  next();
}, obtenerActividadesPorTipo);

// Ruta para obtener componentes por tipo de activo
router.get('/componentes', (req, res, next) => {
  console.log('GET /api/especificaciones/componentes - Cargando componentes');
  next();
}, obtenerComponentesPorTipo);

module.exports = router;
