const db = require('../config/db');

const getUsuarios = (req, res) => {
  db.query('SELECT id, username FROM usuarios', (err, results) => {
    if (err) {
      console.error('Error al obtener usuarios:', err);
      res.status(500).json({ error: 'Error al obtener usuarios' });
    } else {
      res.status(200).json(results);
    }
  });
};

module.exports = { getUsuarios };
