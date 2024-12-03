const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('./middleware/authMiddleware');  // Importar el middleware
require('dotenv').config();  // Cargar las variables de entorno

const app = express();

// Habilitar CORS
app.use(cors());  

// Middleware para procesar JSON SOLO en solicitudes POST, PUT, etc.
app.use(express.json());  // Solo procesar JSON en cuerpo de solicitudes POST, PUT, etc.

// Ruta de login (POST)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Lógica de autenticación (esto debería estar en una base de datos real)
  const user = { email: 'usuario@ejemplo.com', password: '12345' };

  if (email === user.email && password === user.password) {
    // Generar el token JWT
    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Devolver el token junto con el mensaje
    res.json({ message: 'Login exitoso', token: token });
  } else {
    res.status(401).json({ message: 'Credenciales inválidas' });
  }
});

// Ruta protegida (requiere autenticación)
app.get('/api/dashboard', authenticateToken, (req, res) => {
  res.json({ message: 'Bienvenido al dashboard', user: req.user });
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
