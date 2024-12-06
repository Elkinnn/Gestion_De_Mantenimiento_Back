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

      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
      console.log('Token generado:', token);

      return res.status(200).json({ message: 'Login exitoso', token });
    });
  });
};
