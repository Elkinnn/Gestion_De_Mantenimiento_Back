const db = require('../config/db');

const activoController = {
  // Obtener todos los activos con los nombres de las relaciones
  getAllActivos: (req, res) => {
    const query = `
        SELECT 
            a.id,
            a.proceso_compra,
            a.codigo,
            a.nombre,
            a.estado,
            u.nombre AS ubicacion,
            t.nombre AS tipo,
            p.nombre AS proveedor
        FROM activos a
        LEFT JOIN ubicaciones u ON a.ubicacion_id = u.id
        LEFT JOIN tipos_activos t ON a.tipo_activo_id = t.id
        LEFT JOIN proveedores p ON a.proveedor_id = p.id
        ORDER BY a.id ASC
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error('Error al obtener los activos:', err);
        return res.status(500).json({ message: 'Error al obtener los activos' });
      }

      if (results.length === 0) {
        return res.status(200).json({ message: 'No hay activos disponibles', data: [] });
      }

      res.status(200).json(results); // Enviar los activos obtenidos como respuesta
    });
  },

  // Obtener un activo por ID
  getActivoById: (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT 
            a.id,
            a.proceso_compra,
            a.codigo,
            a.nombre,
            a.estado,
            a.ubicacion_id,
            u.nombre AS ubicacion,
            a.tipo_activo_id,
            t.nombre AS tipo,
            a.proveedor_id,
            p.nombre AS proveedor
        FROM activos a
        LEFT JOIN ubicaciones u ON a.ubicacion_id = u.id
        LEFT JOIN tipos_activos t ON a.tipo_activo_id = t.id
        LEFT JOIN proveedores p ON a.proveedor_id = p.id
        WHERE a.id = ?
    `;

    db.query(query, [id], (err, results) => {
      if (err) {
        console.error(`Error al obtener el activo con ID ${id}:`, err);
        return res.status(500).json({ message: 'Error al obtener el activo' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Activo no encontrado' });
      }

      res.status(200).json(results[0]); // Enviar el activo encontrado
    });
  },
};

module.exports = activoController;
