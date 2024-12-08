const db = require('../config/db');

// Generar el siguiente código para "Proceso de Compra"
const generarProcesoCompra = async () => {
    const [result] = await db.query(
        "SELECT proceso_compra FROM activos ORDER BY id DESC LIMIT 1"
    );
    if (result.length === 0) {
        return 'PRO-001'; // Primer registro
    }
    const ultimoCodigo = result[0].proceso_compra;
    const numero = parseInt(ultimoCodigo.split('-')[1]) + 1;
    return `PRO-${String(numero).padStart(3, '0')}`;
};

// Generar el siguiente código para "Código"
const generarCodigoActivo = async () => {
    const [result] = await db.query(
        "SELECT codigo FROM activos ORDER BY id DESC LIMIT 1"
    );
    if (result.length === 0) {
        return 'COD-001'; // Primer registro
    }
    const ultimoCodigo = result[0].codigo;
    const numero = parseInt(ultimoCodigo.split('-')[1]) + 1;
    return `COD-${String(numero).padStart(3, '0')}`;
};

// Obtener nombres para los combos dinámicos (generalizado para todas las tablas)
const obtenerDatosCombo = async (tabla) => {
    const queryMap = {
        proveedores: "SELECT nombre FROM proveedores",
        ubicaciones: "SELECT nombre FROM ubicaciones",
        tipos_activos: "SELECT nombre FROM tipos_activos",
        estados: "SELECT DISTINCT estado AS nombre FROM activos" // Estados únicos desde la tabla activos
    };

    if (!queryMap[tabla]) {
        throw new Error(`Tabla '${tabla}' no soportada para datos del combo.`);
    }

    const [result] = await db.query(queryMap[tabla]);
    return result;
};

module.exports = {
    generarProcesoCompra,
    generarCodigoActivo,
    obtenerDatosCombo,
};
