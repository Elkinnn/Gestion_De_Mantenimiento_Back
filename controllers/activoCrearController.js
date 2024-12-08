const db = require('../config/db');

// Generar el siguiente código para "Proceso de Compra"
const getProcesoCompra = async (req, res) => {
    try {
        const codigo = await generarProcesoCompra();
        res.status(200).json({ codigo });
    } catch (error) {
        res.status(500).json({ message: 'Error al generar el proceso de compra', error: error.message });
    }
};

// Generar el siguiente código para "Código"
const getCodigoActivo = async (req, res) => {
    try {
        const codigo = await generarCodigoActivo();
        res.status(200).json({ codigo });
    } catch (error) {
        res.status(500).json({ message: 'Error al generar el código de activo', error: error.message });
    }
};

// Obtener nombres para los combos dinámicos (generalizado para todas las tablas)
const getDatosCombo = async (req, res) => {
    const { tabla } = req.params;
    try {
        const datos = await obtenerDatosCombo(tabla);
        res.status(200).json(datos);
    } catch (error) {
        res.status(400).json({ message: `Error al obtener datos de la tabla '${tabla}'`, error: error.message });
    }
};

// Lógica de generación
const generarProcesoCompra = async () => {
    const [result] = await db.query(
        "SELECT proceso_compra FROM activos ORDER BY id DESC LIMIT 1"
    );
    if (result.length === 0 || !result[0].proceso_compra) {
        return 'PRO-001'; // Primer registro si no hay datos
    }
    const ultimoCodigo = result[0].proceso_compra;
    const numero = parseInt(ultimoCodigo.split('-')[1]) + 1;
    return `PRO-${String(numero).padStart(3, '0')}`;
};

const generarCodigoActivo = async () => {
    const [result] = await db.query(
        "SELECT codigo FROM activos ORDER BY id DESC LIMIT 1"
    );
    if (result.length === 0 || !result[0].codigo) {
        return 'COD-001'; // Primer registro si no hay datos
    }
    const ultimoCodigo = result[0].codigo;
    const numero = parseInt(ultimoCodigo.split('-')[1]) + 1;
    return `COD-${String(numero).padStart(3, '0')}`;
};

const obtenerDatosCombo = async (tabla) => {
    const queryMap = {
        proveedores: "SELECT id, nombre FROM proveedores",
        ubicaciones: "SELECT id, nombre FROM ubicaciones",
        tipos_activos: "SELECT id, nombre FROM tipos_activos",
        estados: "SELECT DISTINCT estado AS nombre FROM activos" // Estados únicos desde la tabla activos
    };

    if (!queryMap[tabla]) {
        throw new Error(`Tabla '${tabla}' no soportada para datos del combo.`);
    }

    const [result] = await db.query(queryMap[tabla]);
    return result;
};

module.exports = {
    getProcesoCompra,
    getCodigoActivo,
    getDatosCombo,
};
