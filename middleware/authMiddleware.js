const jwt = require('jsonwebtoken');

// Middleware para autenticar tokens
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Obtener el token del encabezado

  if (!token) {
    return res.status(401).json({ message: 'No se proporcionó un token' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token no válido' });
    }
    req.user = user; // user tendrá { id, role, username }
    console.log('Datos decodificados del token:', req.user); // Debugging opcional
    next();
  });
  
};

// Middleware para autorizar por un rol específico
exports.authorizeRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Acceso denegado: No tienes permisos suficientes' });
    }
    next();
  };
};

// Middleware para autorizar por múltiples roles (opcional)
exports.authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acceso denegado: No tienes permisos suficientes' });
    }
    next();
  };
};
