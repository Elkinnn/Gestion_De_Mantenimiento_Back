const db = require('../config/db');

const User = {
  findByUsername: (username, callback) => {
    const query = 'SELECT * FROM usuarios WHERE username = ?';
    console.log('Ejecutando consulta SQL:', query, username);
    db.query(query, [username], (err, results) => {
      if (err) {
        console.error('Error en la consulta SQL:', err);
      } else {
        console.log('Resultados de la consulta:', results);
      }
      callback(err, results);
    });
  },
};

module.exports = User;
