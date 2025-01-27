const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const activoController = require('../controllers/activoController');
const { getProcesoCompra, getCodigoActivo, getDatosCombo, insertarActivo } = require('../controllers/activoCrearController');
const { updateActivo } = require('../controllers/activoActualizarController');
const { uploadLotes } = require('../controllers/activoLotesController');

// Ruta para obtener los activos
const multer = require('multer');
router.get('/menu', authenticateToken, activoController.getAllActivos);

// Ruta para obtener el siguiente proceso de compra
router.get('/proceso-compra', authenticateToken, getProcesoCompra);

// Ruta para obtener el siguiente código de activo
router.get('/codigo', authenticateToken, getCodigoActivo);

// Ruta para obtener datos para los combos
router.get('/combo/:tabla', authenticateToken, getDatosCombo);

router.get('/combo/:tabla/:contexto', authenticateToken, getDatosCombo);

router.get('/', authenticateToken, activoController.getAllActivos);
// Ruta para insertar un nuevo activo
router.post('/', authenticateToken, insertarActivo);

router.get('/:id', authenticateToken, activoController.getActivoById);

router.put('/:id', authenticateToken, updateActivo);
const upload = multer({ dest: 'upload/' });

// Ruta para cargar lotes de activos
router.post(
  '/upload-lotes',
  authenticateToken,

  upload.single('file'),
  uploadLotes
);

module.exports = router;