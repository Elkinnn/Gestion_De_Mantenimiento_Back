const db = require('../config/db'); // Conexión a la base de datos

const listarActivos = async (req, res) => {
    try {
        const query = `
            SELECT 
                activos.codigo, 
                activos.nombre AS serie, 
                tipos_activos.nombre AS tipo
            FROM 
                activos
            JOIN 
                tipos_activos 
                ON activos.tipo_activo_id = tipos_activos.id;
        `;
        const [results] = await db.query(query);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error al listar activos:', error);
        res.status(500).json({ message: 'Error al listar activos' });
    }
};

module.exports = { listarActivos };
