const db = require('../config/db');

const updateActivo = (req, res) => {
    const { id } = req.params;
    const { nombre, estado, ubicacion_id, tipo_activo_id } = req.body;

    // Validación de campos obligatorios
    if (!id || !nombre || !estado || !ubicacion_id || !tipo_activo_id) {
        res.status(400).json({ message: 'Todos los campos son obligatorios para la actualización' });
        return;
    }

    const query = `
        UPDATE activos 
        SET nombre = ?, estado = ?, ubicacion_id = ?, tipo_activo_id = ?
        WHERE id = ?
    `;

    // Ejecución de la consulta para actualizar el registro
    db.query(query, [nombre, estado, ubicacion_id, tipo_activo_id, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar el activo:', err);
            res.status(500).json({ message: 'Error al actualizar el activo', error: err.message });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Activo no encontrado' });
        } else {
            res.status(200).json({ message: 'Activo actualizado correctamente' });
        }
    });
};

module.exports = {
    updateActivo,
};
