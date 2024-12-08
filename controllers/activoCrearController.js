const db = require('../config/db');

// Generar el siguiente código para "Proceso de Compra"
const getProcesoCompra = (req, res) => {
    generarProcesoCompra((error, codigo) => {
        if (error) {
            res.status(500).json({ message: 'Error al generar el proceso de compra', error: error.message });
        } else {
            res.status(200).json({ codigo });
        }
    });
};

// Generar el siguiente código para "Código"
const getCodigoActivo = (req, res) => {
    generarCodigoActivo((error, codigo) => {
        if (error) {
            res.status(500).json({ message: 'Error al generar el código de activo', error: error.message });
        } else {
            res.status(200).json({ codigo });
        }
    });
};

// Obtener nombres para los combos dinámicos (generalizado para todas las tablas)
const getDatosCombo = (req, res) => {
    const { tabla } = req.params;

    if (tabla === 'estados') {
        // Devuelve los valores fijos del ENUM para "estados"
        res.status(200).json([
            { nombre: 'Funcionando' },         
        ]);
        return;
    }

    if (tabla === 'procesos_compra') {
        // Devuelve los procesos de compra existentes más el siguiente generado
        db.query("SELECT DISTINCT proceso_compra AS nombre FROM activos", (err, result) => {
            if (err) {
                res.status(500).json({ message: 'Error al obtener procesos de compra', error: err.message });
            } else {
                generarProcesoCompra((error, siguienteProceso) => {
                    if (error) {
                        res.status(500).json({ message: 'Error al generar el siguiente proceso', error: error.message });
                    } else {
                        result.push({ nombre: siguienteProceso }); // Agrega el siguiente proceso generado
                        res.status(200).json(result);
                    }
                });
            }
        });
        return;
    }

    // Mapear consultas para otras tablas
    const queryMap = {
        proveedores: "SELECT id, nombre FROM proveedores",
        ubicaciones: "SELECT id, nombre FROM ubicaciones",
        tipos_activos: "SELECT id, nombre FROM tipos_activos",
    };

    const query = queryMap[tabla];
    if (!query) {
        res.status(400).json({ message: `Tabla '${tabla}' no soportada para datos del combo.` });
        return;
    }

    db.query(query, (err, result) => {
        if (err) {
            res.status(500).json({ message: `Error al obtener datos de la tabla '${tabla}'`, error: err.message });
        } else {
            res.status(200).json(result);
        }
    });
};

// Generar el siguiente código para "Proceso de Compra"
const generarProcesoCompra = (callback) => {
    db.query("SELECT proceso_compra FROM activos ORDER BY id DESC LIMIT 1", (err, result) => {
        if (err) {
            callback(err, null);
        } else {
            if (result.length === 0 || !result[0].proceso_compra) {
                callback(null, 'PRO-001'); // Primer registro si no hay datos
            } else {
                const ultimoCodigo = result[0].proceso_compra;
                const numero = parseInt(ultimoCodigo.split('-')[1]) + 1;
                callback(null, `PRO-${String(numero).padStart(3, '0')}`);
            }
        }
    });
};

// Generar el siguiente código para "Código"
const generarCodigoActivo = (callback) => {
    db.query("SELECT codigo FROM activos ORDER BY id DESC LIMIT 1", (err, result) => {
        if (err) {
            callback(err, null);
        } else {
            if (result.length === 0 || !result[0].codigo) {
                callback(null, 'COD-001'); // Primer registro si no hay datos
            } else {
                const ultimoCodigo = result[0].codigo;
                const numero = parseInt(ultimoCodigo.split('-')[1]) + 1;
                callback(null, `COD-${String(numero).padStart(3, '0')}`);
            }
        }
    });
};

// Insertar un nuevo activo
const insertarActivo = (req, res) => {
    const { proceso_compra, codigo, nombre, estado, ubicacion_id, proveedor_id, tipo_activo_id } = req.body;

    if (!proceso_compra || !codigo || !nombre || !estado || !ubicacion_id || !proveedor_id || !tipo_activo_id) {
        console.error('Error: Datos incompletos', req.body);
        res.status(400).json({ message: 'Todos los campos son obligatorios' });
        return;
    }

    const query = `
        INSERT INTO activos (proceso_compra, codigo, nombre, estado, ubicacion_id, proveedor_id, tipo_activo_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [proceso_compra, codigo, nombre, estado, ubicacion_id, proveedor_id, tipo_activo_id], (err) => {
        if (err) {
            console.error('Error al insertar el activo:', err);
            res.status(500).json({ message: 'Error al crear el activo', error: err.message });
        } else {
            console.log('Activo creado con éxito:'); // Registrar éxito
            res.status(201).json({ message: 'Activo creado correctamente' });
        }
    });
};

module.exports = {
    getProcesoCompra,
    getCodigoActivo,
    getDatosCombo,
    insertarActivo,
};
