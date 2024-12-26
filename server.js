const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Cargar variables de entorno

const authRoutes = require('./routes/authRoutes'); // Importar las rutas de autenticación
const activosRoutes = require('./routes/activosRoutes'); // Importar las rutas de activos
const mantenimientosRoutes = require('./routes/mantenimientosRoutes'); // Rutas de mantenimientos
const usuariosRoutes = require('./routes/usuariosRoutes'); // Rutas de usuarios
const proveedoresRoutes = require('./routes/proveedoresRoutes'); // Rutas de proveedores
const especificacionesRoutes = require('./routes/especificacionesRoutes'); // Rutas de especificaciones
const { authenticateToken } = require('./middleware/authMiddleware'); // Middleware de autenticación

const app = express(); // Inicializar Express

// Middleware global para registrar solicitudes
app.use((req, res, next) => {
  console.log(`Solicitud recibida: ${req.method} ${req.url}`);
  next();
});

// Habilitar CORS
app.use(cors());

// Middleware para procesar JSON
app.use(express.json());

// Usar las rutas
app.use('/api/auth', (req, res, next) => {
  console.log('Entrando a /api/auth');
  next();
}, authRoutes);

app.use('/api/activos', authenticateToken, (req, res, next) => {
  console.log('Entrando a /api/activos');
  next();
}, activosRoutes);

app.use('/api/mantenimientos', authenticateToken, (req, res, next) => {
  console.log('Entrando a /api/mantenimientos');
  next();
}, mantenimientosRoutes);

app.use('/api/usuarios', authenticateToken, (req, res, next) => {
  console.log('Entrando a /api/usuarios');
  next();
}, usuariosRoutes);

app.use('/api/proveedores', authenticateToken, (req, res, next) => {
  console.log('Entrando a /api/proveedores');
  next();
}, proveedoresRoutes);

app.use('/api/especificaciones', authenticateToken, (req, res, next) => {
  console.log('Entrando a /api/especificaciones');
  next();
}, especificacionesRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  console.log(`Ruta no encontrada: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(`Error en el servidor: ${err.message}`);
  res.status(500).json({ message: 'Error interno del servidor' });
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
