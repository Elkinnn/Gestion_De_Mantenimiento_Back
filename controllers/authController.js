const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

// Función para registrar un nuevo usuario
exports.register = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  User.findByEmail(email, (err, results) => {
    if (results.length > 0) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    User.create(name, email, hashedPassword, (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Error al registrar el usuario' });
      }

      const token = jwt.sign({ id: results.insertId, email }, process.env.JWT_SECRET, { expiresIn: '1h' });

      return res.status(201).json({ message: 'Usuario registrado exitosamente', token });
    });
  });
};

// Función para hacer login
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
  }

  User.findByEmail(email, (err, results) => {
    if (results.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = results[0];

    if (!User.comparePassword(password, user.password)) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.status(200).json({ message: 'Login exitoso', token });
  });
};

// Función para obtener los datos del usuario autenticado
exports.getUser = (req, res) => {
  const user = req.user;
  res.json(user);
};
