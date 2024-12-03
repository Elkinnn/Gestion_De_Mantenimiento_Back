const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  // Buscar por email
  findByEmail: (email, callback) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], callback);
  },

  // Crear un nuevo usuario
  create: (name, email, password, callback) => {
    const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(query, [name, email, password], callback);
  },

  // Comparar contraseñas
  comparePassword: (password, hashedPassword) => {
    return bcrypt.compareSync(password, hashedPassword);
  }
};

module.exports = User;
