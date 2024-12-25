const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Cargar variables de entorno

const authRoutes = require('./routes/authRoutes'); // Importar las rutas de autenticación
const activosRoutes = require('./routes/activosRoutes'); // Importar las rutas de activos
const mantenimientosRoutes = require('./routes/mantenimientosRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const proveedoresRoutes = require('./routes/proveedoresRoutes');const { authenticateToken } = require('./middleware/authMiddleware'); // Middleware de autenticación
const { authorizeRoles } = require('./middleware/authMiddleware'); // Middleware de autorización

const app = express(); // Inicializar Express

// Middleware para registrar solicitudes (log global)
app.use((req, res, next) => {
  console.log(`Solicitud recibida: ${req.method} ${req.url}`);
  next();
});

// Habilitar CORS
app.use(cors());

// Middleware para procesar JSON
app.use(express.json());

// Usar las rutas de autenticación
app.use('/api/auth', (req, res, next) => {
  console.log('Entrando a /api/auth');
  next();
}, authRoutes);

// Usar las rutas de activos (con autenticación, pero autorización solo si es necesario)
app.use('/api/activos', authenticateToken, (req, res, next) => {
  console.log('Entrando a /api/activos');
  next();
}, activosRoutes);

// Usar las rutas de mantenimientos (con autenticación)
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

app.use(express.json()); // Middleware para parsear JSON

// Registra las rutas
app.use('/api/activos', activosRoutes);

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
