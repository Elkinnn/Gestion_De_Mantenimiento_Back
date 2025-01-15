const express = require('express');
const router = express.Router();
const { getUsuarios } = require('../controllers/usuarioController'); // Importar el controlador correspondiente

router.get('/', getUsuarios); // Asegúrate de que "getUsuarios" está definido y exportado correctamente.

module.exports = router;
