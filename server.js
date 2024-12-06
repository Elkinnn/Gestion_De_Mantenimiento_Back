const express = require('express');
const cors = require('cors');

require('dotenv').config(); // Cargar variables de entorno

const authRoutes = require('./routes/authRoutes'); // Importar las rutas de autenticación

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
app.use('/api/auth', authRoutes);

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
