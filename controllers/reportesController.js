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

const getMantenimientosPorPeriodo = async (req, res) => {
    try {
        const { fechaInicio, fechaFin, tipoMantenimiento } = req.query;

        let query = `
            SELECT DATE(m.fecha_inicio) AS fecha, COUNT(m.id) AS cantidad,
                   CASE 
                       WHEN m.proveedor_id IS NOT NULL THEN 'Externo'
                       ELSE 'Interno'
                   END AS tipo
            FROM mantenimientos m
            WHERE 1=1
        `;

        const params = [];

        if (fechaInicio) {
            query += ` AND m.fecha_inicio >= ?`;
            params.push(fechaInicio);
        }
        if (fechaFin) {
            query += ` AND m.fecha_inicio <= ?`;
            params.push(fechaFin);
        }
        if (tipoMantenimiento) {
            query += ` AND (CASE 
                                WHEN m.proveedor_id IS NOT NULL THEN 'Externo'
                                ELSE 'Interno'
                            END) = ?`;
            params.push(tipoMantenimiento);
        }

        query += ` GROUP BY fecha, tipo ORDER BY fecha ASC`;

        const [rows] = await db.promise().query(query, params);
        res.json(rows);
    } catch (error) {
        console.error("Error obteniendo mantenimientos por período:", error);
        res.status(500).json({ error: "Error obteniendo los datos." });
    }
};

module.exports = { getActivosPorTipo, getComponentesMasUtilizados, getActividadesMasUtilizadas, getMantenimientosPorPeriodo };
