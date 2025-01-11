const db = require("../config/db");

// Reporte de distribución de activos por tipo en mantenimientos
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

// Reporte de componentes más utilizados en mantenimientos
const getComponentesMasUtilizados = async (req, res) => {
    try {
        const query = `
            SELECT c.nombre AS componente, SUM(mc.cantidad) AS cantidad_usada
            FROM mantenimiento_componentes mc
            JOIN componentes c ON mc.componente_id = c.id
            GROUP BY c.nombre
            ORDER BY cantidad_usada DESC
        `;
        const [rows] = await db.promise().query(query);
        res.json(rows);
    } catch (error) {
        console.error("Error obteniendo componentes utilizados:", error);
        res.status(500).json({ error: "Error obteniendo los datos." });
    }
};

const getActividadesMasUtilizadas = async (req, res) => {
    try {
        const query = `
            SELECT a.nombre AS actividad, COUNT(ma.actividad_id) AS cantidad_usada
            FROM mantenimiento_actividades ma
            JOIN actividades a ON ma.actividad_id = a.id
            GROUP BY a.nombre
            ORDER BY cantidad_usada DESC
        `;
        const [rows] = await db.promise().query(query);
        res.json(rows);
    } catch (error) {
        console.error("Error obteniendo actividades utilizadas:", error);
        res.status(500).json({ error: "Error obteniendo los datos." });
    }
};

module.exports = { getActivosPorTipo, getComponentesMasUtilizados, getActividadesMasUtilizadas };
