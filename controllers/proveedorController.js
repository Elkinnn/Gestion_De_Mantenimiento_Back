const db = require('../config/db');

exports.getProveedores = (req, res) => {
  console.log('Iniciando consulta de proveedores...');
  db.query('SELECT id, nombre FROM proveedores', (err, results) => {
    if (err) {
      console.error('Error al consultar proveedores:', err);
      return res.status(500).json({ message: 'Error al obtener proveedores' });
    }
    console.log('Proveedores obtenidos:', results);
    res.status(200).json(results);
  });
};
