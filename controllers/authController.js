const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Asegúrate de que esta importación sea correcta

exports.login = (req, res) => {
  const { username, password } = req.body;

  console.log('Datos recibidos en login:', { username, password });

  User.findByUsername(username, (err, results) => {
    if (err) {
      console.error('Error al buscar usuario:', err);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }

    console.log('Resultados de la consulta SQL:', results);

    if (results.length === 0) {
      console.log('Usuario no encontrado');
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Error al comparar contraseñas:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
      }

      console.log('Contraseña ingresada:', password);
      console.log('Contraseña almacenada:', user.password);
      console.log('¿Contraseña válida?:', isMatch);

      if (!isMatch) {
        console.log('Contraseña incorrecta');
        return res.status(401).json({ message: 'Contraseña incorrecta' });
      }

      // Aquí creas el token
      const token = jwt.sign(
        { id: user.id, role: user.role, username: user.username }, // Agrega `username`
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      
      // Responde con el token, rol y nombre de usuario
      return res.status(200).json({
        message: 'Login exitoso',
        token,
        role: user.role,
        userName: user.username // Aquí estás enviando el userName
      });
    });
  });
};


exports.getUserInfo = (req, res) => {
  console.log('Información del usuario en getUserInfo:', req.user); // Verificar datos disponibles
  if (req.user) {
    res.json({
      username: req.user.username, // Confirmar que este valor existe
      role: req.user.role,
    });
  } else {
    res.status(401).json({ message: 'Usuario no autenticado' });
  }
};

