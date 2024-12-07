const db = require('../config/db');

const activoController = {
  // Obtener todos los activos
  getAllActivos: (req, res) => {
    const query = 'SELECT * FROM activos'; // Consulta SQL para obtener todos los activos
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error al obtener los activos:', err);
        return res.status(500).json({ message: 'Error al obtener los activos' });
      }

      res.status(200).json(results); // Enviar los activos obtenidos como respuesta
    });
  },
};

module.exports = activoController;
