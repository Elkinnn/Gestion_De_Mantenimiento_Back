const db = require('../config/db'); // Conexión a la base de datos

// Controlador para obtener todos los mantenimientos
const obtenerMantenimientos = (req, res) => {
  const { year, month, status, provider, date, technician } = req.query;

  let query = `
    SELECT 
      m.id AS mantenimiento_id,
      m.numero_mantenimiento,
      p.nombre AS proveedor,
      u.username AS tecnico,
      a.username AS admin,
      m.fecha_inicio,
      m.fecha_fin,
      m.estado,
      COUNT(ma.activo_id) AS numero_activos
    FROM mantenimientos m
    LEFT JOIN proveedores p ON m.proveedor_id = p.id
    LEFT JOIN usuarios u ON m.tecnico_id = u.id
    LEFT JOIN usuarios a ON m.admin_id = a.id
    LEFT JOIN mantenimientos_activos ma ON m.id = ma.mantenimiento_id
    WHERE 1=1
  `;

  if (year) query += ` AND YEAR(m.fecha_inicio) = ${db.escape(year)}`;
  if (month) query += ` AND MONTH(m.fecha_inicio) = ${db.escape(month)}`;
  if (status) query += ` AND m.estado = ${db.escape(status)}`;
  if (provider) query += ` AND m.proveedor_id = ${db.escape(provider)}`;
  if (date) query += ` AND DATE(m.fecha_inicio) = ${db.escape(date)}`; // Filtro de fecha
  if (technician) query += ` AND m.tecnico_id = ${db.escape(technician)}`; // Filtro de técnico

  query += ` GROUP BY m.id ORDER BY m.fecha_inicio DESC;`;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener los mantenimientos:', error);
      res.status(500).json({ error: 'Error al obtener los mantenimientos' });
    } else {
      res.status(200).json(results);
    }
  });
};

const obtenerFiltros = (req, res) => {
  const queryYears = `SELECT DISTINCT YEAR(fecha_inicio) AS year FROM mantenimientos ORDER BY year DESC;`;
  const queryMonths = `SELECT DISTINCT MONTH(fecha_inicio) AS month FROM mantenimientos ORDER BY month ASC;`;
  const queryStates = `SELECT DISTINCT estado FROM mantenimientos;`;
  const queryProviders = `SELECT id, nombre AS name FROM proveedores;`;
  const queryTechnicians = `SELECT id, username AS name FROM usuarios;`;
  // Ejecutar todas las consultas de forma paralela
  Promise.all([
    new Promise((resolve, reject) => db.query(queryYears, (err, results) => (err ? reject(err) : resolve(results)))),
    new Promise((resolve, reject) => db.query(queryMonths, (err, results) => (err ? reject(err) : resolve(results)))),
    new Promise((resolve, reject) => db.query(queryStates, (err, results) => (err ? reject(err) : resolve(results)))),
    new Promise((resolve, reject) => db.query(queryProviders, (err, results) => (err ? reject(err) : resolve(results)))),
    new Promise((resolve, reject) => db.query(queryTechnicians, (err, results) => (err ? reject(err) : resolve(results)))), // Consulta para todos los usuarios
  ])
    .then(([years, months, states, providers, technicians]) => {
      res.status(200).json({ years, months, states, providers, technicians });
    })
    .catch((error) => {
      console.error('Error al obtener filtros:', error);
      res.status(500).json({ error: 'Error al obtener filtros' });
    });
};

// Controlador para obtener todos los usuarios
const obtenerUsuarios = (req, res) => {
  const query = 'SELECT id, username FROM usuarios';

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ error: 'Error al obtener usuarios' });
    } else {
      res.status(200).json(results);
    }
  });
};

const obtenerUltimoNumero = (req, res) => {
  const query = 'SELECT MAX(id) AS ultimo FROM mantenimientos';
  console.log('Ejecutando consulta:', query);

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta:', err);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
    console.log('Resultados de la consulta:', results);
    const ultimo = results[0]?.ultimo || 0;
    const siguienteNumero = `MNT_${String(ultimo + 1).padStart(3, '0')}`;
    console.log('Siguiente número generado:', siguienteNumero);
    res.status(200).json({ siguienteNumero });
  });
};

const crearMantenimiento = (req, res) => {
  console.log('Datos recibidos:', req.body);
  const {
    numero_mantenimiento,
    proveedor_id,
    tecnico_id,
    fecha_inicio,
    fecha_fin,
    estado,
    activos,
  } = req.body;

  // Validar campos obligatorios
  if (!numero_mantenimiento) {
    return res.status(400).json({ message: 'El número de mantenimiento es obligatorio.' });
  }

  if (proveedor_id && tecnico_id) {
    return res.status(400).json({ message: 'Solo uno de proveedor_id o tecnico_id debe tener valor.' });
  }

  // Consulta para insertar mantenimiento
  const query = `
    INSERT INTO mantenimientos (numero_mantenimiento, proveedor_id, tecnico_id, admin_id, fecha_inicio, fecha_fin, estado)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    numero_mantenimiento,
    proveedor_id || null,
    tecnico_id || null,
    null, // admin_id siempre es null
    fecha_inicio,
    fecha_fin,
    estado,
  ];

  db.query(query, values, (error, results) => {
    if (error) {
      console.error('Error al crear mantenimiento:', error);
      return res.status(500).json({ message: 'Error al crear el mantenimiento.' });
    }

    const mantenimientoId = results.insertId;

    if (activos && activos.length > 0) {
      const activosQuery = `
        INSERT INTO mantenimientos_activos (mantenimiento_id, activo_id) VALUES ?
      `;
      const activosValues = activos.map((activo) => [mantenimientoId, activo.id]);

      db.query(activosQuery, [activosValues], (activosError, activosResults) => {
        if (activosError) {
            console.error('Error al registrar activos del mantenimiento:', activosError);
            return res.status(500).json({ message: 'Error al registrar los activos del mantenimiento.' });
        }
    
        const especificacionesPromises = [];
        
        // Mapear los IDs generados por `mantenimientos_activos`
        const mantenimientoActivosIds = activosResults.insertId; // Primer ID generado
        activos.forEach((activo, index) => {
            activo.mantenimiento_activo_id = mantenimientoActivosIds + index; // Asociar ID generado al activo
        });
    
        // Registrar especificaciones para cada activo
        activos.forEach((activo) => {
            // Registrar actividades
            if (activo.especificaciones?.actividades?.length > 0) {
                const actividadesQuery = `
                  INSERT INTO mantenimiento_actividades (mantenimiento_activo_id, actividad_id, descripcion)
                  VALUES ?
                `;
                const actividadesValues = activo.especificaciones.actividades.map((actividad) => [
                    activo.mantenimiento_activo_id, // Usar el ID generado de `mantenimientos_activos`
                    actividad.id,
                    actividad.descripcion,
                ]);
                especificacionesPromises.push(
                    new Promise((resolve, reject) => {
                        db.query(actividadesQuery, [actividadesValues], (error) => {
                            if (error) reject(error);
                            else resolve();
                        });
                    })
                );
            }
    
            // Registrar componentes
            if (activo.especificaciones?.componentes?.length > 0) {
                const componentesQuery = `
                  INSERT INTO mantenimiento_componentes (mantenimiento_activo_id, componente_id, cantidad)
                  VALUES ?
                `;
                const componentesValues = activo.especificaciones.componentes.map((componente) => [
                    activo.mantenimiento_activo_id, // Usar el ID generado de `mantenimientos_activos`
                    componente.id,
                    componente.cantidad || 1,
                ]);
                especificacionesPromises.push(
                    new Promise((resolve, reject) => {
                        db.query(componentesQuery, [componentesValues], (error) => {
                            if (error) reject(error);
                            else resolve();
                        });
                    })
                );
            }
    
            // Registrar observaciones
            if (activo.especificaciones?.observaciones) {
                const observacionesQuery = `
                  INSERT INTO mantenimiento_observaciones (mantenimiento_activo_id, observacion)
                  VALUES (?, ?)
                `;
                especificacionesPromises.push(
                    new Promise((resolve, reject) => {
                        db.query(
                            observacionesQuery,
                            [activo.mantenimiento_activo_id, activo.especificaciones.observaciones],
                            (error) => {
                                if (error) reject(error);
                                else resolve();
                            }
                        );
                    })
                );
            }
        });
    
        // Ejecutar todas las promesas de especificaciones
        Promise.all(especificacionesPromises)
            .then(() => {
                res.status(201).json({
                    message: 'Mantenimiento creado exitosamente con activos y especificaciones.',
                    mantenimientoId,
                });
            })
            .catch((error) => {
                console.error('Error al registrar especificaciones:', error);
                res.status(500).json({ message: 'Error al registrar las especificaciones.' });
            });
    });
    
    } else {
      res.status(201).json({ message: 'Mantenimiento creado exitosamente.', mantenimientoId });
    }
  });
};



module.exports = {
  obtenerMantenimientos,
  obtenerFiltros,
  obtenerUsuarios,
  obtenerUltimoNumero,
  crearMantenimiento, // Agregamos esto
};
