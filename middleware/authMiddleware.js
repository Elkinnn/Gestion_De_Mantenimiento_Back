const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // Obtener el token de la cabecera Authorization
  const token = req.headers['authorization']?.split(' ')[1];  // Bearer <token>

  if (!token) {
    return res.status(403).json({ message: 'Token requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }

    req.user = user;  // Añadir el usuario a la solicitud
    next();  // Pasar al siguiente middleware o ruta
  });
};

module.exports = { authenticateToken };
