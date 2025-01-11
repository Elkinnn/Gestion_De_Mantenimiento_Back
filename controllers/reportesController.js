const db = require("../config/db");

const getActivosPorTipo = async (req, res) => {
    try {
        const query = `
            SELECT ta.nombre AS tipo_activo, COUNT(ma.activo_id) AS cantidad
            FROM mantenimientos_activos ma
            JOIN activos a ON ma.activo_id = a.id
            JOIN tipos_activos ta ON a.tipo_activo_id = ta.id
            GROUP BY ta.nombre
        `;
        const [rows] = await db.promise().query(query);
        res.json(rows);
    } catch (error) {
        console.error("Error obteniendo activos por tipo:", error);
        res.status(500).json({ error: "Error obteniendo los datos." });
    }
};

module.exports = { getActivosPorTipo };
