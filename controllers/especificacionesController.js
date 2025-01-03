const db = require('../config/db'); // Conexión a la base de datos

// Controlador para obtener actividades por tipo de activo
exports.obtenerActividadesPorTipo = (req, res) => {
  const { tipo_activo_id } = req.query;

  if (!tipo_activo_id) {
    return res.status(400).json({ message: 'Falta el parámetro tipo_activo_id' });
  }

  const query = 'SELECT * FROM actividades WHERE tipo_activo_id = ?';
  
  db.query(query, [tipo_activo_id], (error, results) => {
    if (error) {
      console.error('Error al obtener actividades:', error);
      return res.status(500).json({ message: 'Error al obtener actividades' });
    }
    res.status(200).json(results);
  });
};

// Controlador para obtener componentes por tipo de activo
exports.obtenerComponentesPorTipo = (req, res) => {
  const { tipo_activo_id } = req.query;

  if (!tipo_activo_id) {
    return res.status(400).json({ message: 'Falta el parámetro tipo_activo_id' });
  }

  const query = 'SELECT * FROM componentes WHERE tipo_activo_id = ?';

  db.query(query, [tipo_activo_id], (error, results) => {
    if (error) {
      console.error('Error al obtener componentes:', error);
      return res.status(500).json({ message: 'Error al obtener componentes' });
    }
    res.status(200).json(results);
  });
};
