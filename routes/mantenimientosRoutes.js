const express = require('express');
const router = express.Router();
const {
  obtenerMantenimientos,
  obtenerFiltros,
  obtenerUltimoNumero,
  crearMantenimiento,
  obtenerMantenimientoPorId,
  obtenerActividadesPorTipo,
  obtenerActividadesDelActivo,
  actualizarMantenimiento,
  asociarActivoAMantenimiento,
  verificarActivoEnMantenimiento,
  obtenerMantenimientosPorActivo,
  obtenerDetallesMantenimientoActivo,// Crear mantenimiento con activos y especificaciones
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

// Ruta para obtener un mantenimiento por su ID


router.get('/actividades', (req, res) => {
  console.log('GET /api/mantenimientos/actividades - Obteniendo actividades por tipo de activo');
  obtenerActividadesPorTipo(req, res);
});


router.get('/actividades-del-activo', (req, res) => {
  console.log('GET /api/mantenimientos/actividades-del-activo - Obteniendo actividades registradas y disponibles');
  obtenerActividadesDelActivo(req, res);
});

router.get('/:id', (req, res) => {
  console.log(`GET /api/mantenimientos/${req.params.id} - Obteniendo mantenimiento por ID`);
  obtenerMantenimientoPorId(req, res);
});

router.put('/:id', (req, res) => {
  console.log(`PUT /api/mantenimientos/${req.params.id} - Actualizando mantenimiento`);
  actualizarMantenimiento(req, res);
});




// Nueva ruta para asociar un activo existente a un mantenimiento
// Ruta para asociar un activo existente a un mantenimiento
router.post('/activos', (req, res) => {
  console.log('POST /api/mantenimientos/activos - Asociando activo a mantenimiento');
  asociarActivoAMantenimiento(req, res);
});

router.get('/activos/:activo_id/verificar', (req, res) => {
  console.log(`GET /api/mantenimientos/activos/${req.params.activo_id}/verificar - Verificando activo`);
  verificarActivoEnMantenimiento(req, res);
});


router.get('/detalles/:mantenimientoId/:activoId', (req, res) => {
  console.log(`GET /api/mantenimientos/detalles/${req.params.mantenimientoId}/${req.params.activoId} - Obteniendo detalles específicos del activo`);
  obtenerDetallesMantenimientoActivo(req, res);
});



// Nueva ruta para obtener todos los mantenimientos "Terminados" de un activo específico
router.get('/activo/:id', (req, res) => {
  console.log(`GET /api/mantenimientos/activo/${req.params.id} - Obteniendo mantenimientos terminados del activo`);
  obtenerMantenimientosPorActivo(req, res);
});



module.exports = router;
