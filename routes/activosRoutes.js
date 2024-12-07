const express = require('express');
const multer = require('multer');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');  // Importar el middleware
const { uploadLotes } = require('../controllers/activosController');  // Controlador para manejar la carga de lotes

const router = express.Router();

// Configurar Multer para manejar la subida de archivos
const upload = multer({ dest: 'uploads/' });

// Ruta para listar los activos (disponible para técnicos y administradores)
router.get('/menu', authenticateToken, (req, res) => {
  res.json({ message: 'Lista de activos registrados' });
});

// Ruta para realizar mantenimiento (solo disponible para técnicos)
router.post('/mantenimiento', authenticateToken, authorizeRoles(['Tecnico', 'Admin']), (req, res) => {
  res.json({ message: 'Formulario de mantenimiento enviado' });
});

// Ruta para funcionalidades administrativas (solo disponible para administradores)
router.post('/admin', authenticateToken, authorizeRoles(['Admin']), (req, res) => {
  res.json({ message: 'Acceso a funcionalidades administrativas' });
});

// Nueva ruta: cargar activos por lotes desde un archivo Excel (solo administradores)
router.post('/upload-lotes', authenticateToken, authorizeRoles(['Admin']), upload.single('file'), uploadLotes);

module.exports = router;
