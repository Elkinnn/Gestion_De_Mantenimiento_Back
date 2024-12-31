


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


const obtenerMantenimientoPorId = (req, res) => {
  const mantenimientoId = req.params.id;

  // Consulta para obtener los datos del mantenimiento
  const queryMantenimiento = `
    SELECT 
      m.id AS mantenimiento_id,
      m.numero_mantenimiento,
      m.fecha_inicio,
      m.fecha_fin,
      m.estado,
      p.nombre AS proveedor,
      u.username AS tecnico,
      a.username AS admin
    FROM mantenimientos m
    LEFT JOIN proveedores p ON m.proveedor_id = p.id
    LEFT JOIN usuarios u ON m.tecnico_id = u.id
    LEFT JOIN usuarios a ON m.admin_id = a.id
    WHERE m.id = ?
  `;

  // Consulta para obtener los activos relacionados con el mantenimiento
  const queryActivos = `
    SELECT 
      a.id AS activo_id,
      a.codigo,
      a.nombre,
      a.estado,
      u.nombre AS ubicacion, -- Obtener el nombre de la ubicación
      t.nombre AS tipo,
      p.nombre AS proveedor,
      a.proceso_compra
    FROM activos a
    INNER JOIN mantenimientos_activos ma ON a.id = ma.activo_id
    LEFT JOIN ubicaciones u ON a.ubicacion_id = u.id -- JOIN con ubicaciones
    LEFT JOIN tipos_activos t ON a.tipo_activo_id = t.id -- JOIN con tipos_activos
    LEFT JOIN proveedores p ON a.proveedor_id = p.id -- JOIN con proveedores
    WHERE ma.mantenimiento_id = ?
  `;

  // Ejecutar ambas consultas
  db.query(queryMantenimiento, [mantenimientoId], (error, mantenimientoResults) => {
    if (error) {
      console.error('Error al obtener el mantenimiento:', error);
      return res.status(500).json({ error: 'Error al obtener el mantenimiento' });
    }

    if (mantenimientoResults.length === 0) {
      return res.status(404).json({ error: 'Mantenimiento no encontrado' });
    }

    const mantenimiento = mantenimientoResults[0];

    db.query(queryActivos, [mantenimientoId], (error, activosResults) => {
      if (error) {
        console.error('Error al obtener los activos del mantenimiento:', error);
        return res.status(500).json({ error: 'Error al obtener los activos del mantenimiento' });
      }

      mantenimiento.activos = activosResults;

      res.status(200).json(mantenimiento);
    });
  });
};




const obtenerActividadesPorTipo = (req, res) => {
  const { tipo_activo_id } = req.query;

  if (!tipo_activo_id) {
    return res.status(400).json({ error: 'Se requiere el ID del tipo de activo.' });
  }

  const query = `
    SELECT 
      id AS actividad_id,
      nombre,
      descripcion
    FROM actividades
    WHERE tipo_activo_id = ?
  `;

  db.query(query, [tipo_activo_id], (error, results) => {
    if (error) {
      console.error('Error al obtener actividades disponibles:', error);
      return res.status(500).json({ error: 'Error al obtener actividades disponibles.' });
    }

    res.status(200).json(results);
  });
};




const obtenerActividadesDelActivo = (req, res) => {
  const { mantenimiento_id, activo_id } = req.query;

  if (!mantenimiento_id || !activo_id) {
    return res.status(400).json({ error: 'Se requieren los parámetros mantenimiento_id y activo_id.' });
  }

  // Consulta para obtener el mantenimiento_activo_id
  const queryMantenimientoActivo = `
    SELECT ma.id AS mantenimiento_activo_id, a.tipo_activo_id
    FROM mantenimientos_activos ma
    INNER JOIN activos a ON ma.activo_id = a.id
    WHERE ma.mantenimiento_id = ? AND ma.activo_id = ?
  `;

  db.query(queryMantenimientoActivo, [mantenimiento_id, activo_id], (error, results) => {
    if (error) {
      console.error('Error al obtener el mantenimiento activo:', error);
      return res.status(500).json({ error: 'Error al obtener el mantenimiento activo.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'El mantenimiento o el activo no están relacionados.' });
    }

    const { mantenimiento_activo_id, tipo_activo_id } = results[0];

    // Consultas adicionales
    const queryObservacion = `
      SELECT observacion
      FROM mantenimiento_observaciones
      WHERE mantenimiento_activo_id = ?
    `;

    // Consultar actividades y componentes
    const queryActividadesRealizadas = `
      SELECT ma.id AS actividad_id, a.nombre AS nombre_actividad
      FROM mantenimiento_actividades ma
      INNER JOIN actividades a ON ma.actividad_id = a.id
      WHERE ma.mantenimiento_activo_id = ?
    `;

    const queryActividadesDisponibles = `
      SELECT a.id AS actividad_id, a.nombre AS actividad_disponible
      FROM actividades a
      WHERE a.tipo_activo_id = ?
    `;

    const queryComponentesUtilizados = `
      SELECT mc.id AS componente_id, c.nombre AS componente_utilizado
      FROM mantenimiento_componentes mc
      INNER JOIN componentes c ON mc.componente_id = c.id
      WHERE mc.mantenimiento_activo_id = ?
    `;

    const queryComponentesDisponibles = `
      SELECT c.id AS componente_id, c.nombre AS componente_disponible
      FROM componentes c
      WHERE c.tipo_activo_id = ?
    `;

    // Ejecutar todas las consultas
    Promise.all([
      new Promise((resolve, reject) => {
        db.query(queryActividadesRealizadas, [mantenimiento_activo_id], (error, resultadosRealizadas) => {
          if (error) reject(error);
          else resolve(resultadosRealizadas);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(queryActividadesDisponibles, [tipo_activo_id], (error, resultadosDisponibles) => {
          if (error) reject(error);
          else resolve(resultadosDisponibles);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(queryComponentesUtilizados, [mantenimiento_activo_id], (error, resultadosUtilizados) => {
          if (error) reject(error);
          else resolve(resultadosUtilizados);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(queryComponentesDisponibles, [tipo_activo_id], (error, resultadosDisponibles) => {
          if (error) reject(error);
          else resolve(resultadosDisponibles);
        });
      }),
      new Promise((resolve, reject) => {
        const query = `
          SELECT observacion
          FROM mantenimiento_observaciones
          WHERE mantenimiento_activo_id = ?
          ORDER BY id DESC LIMIT 1;
        `;
        db.query(query, [mantenimiento_activo_id], (error, resultadosObservacion) => {
          if (error) reject(error);
          else resolve(resultadosObservacion[0]?.observacion || '');
        });
      }),
      
    ])
      .then(([actividadesRealizadas, actividadesDisponibles, componentesUtilizados, componentesDisponibles, observacion]) => {
        res.status(200).json({
          actividades_realizadas: actividadesRealizadas.map((actividad) => ({
            actividad_id: actividad.actividad_id,
            nombre_actividad: actividad.nombre_actividad,
          })),
          actividades_disponibles: actividadesDisponibles,
          componentes_utilizados: componentesUtilizados.map((componente) => ({
            componente_id: componente.componente_id,
            componente_utilizado: componente.componente_utilizado,
          })),
          componentes_disponibles: componentesDisponibles,
          observacion, // Agregamos la observación al resultado
        });
      })
      .catch((error) => {
        console.error('Error al obtener las actividades y componentes:', error);
        res.status(500).json({ error: 'Error al obtener las actividades y componentes.' });
      });
  });
};









const actualizarMantenimiento = (req, res) => {
  console.log('Payload recibido en el backend:', req.body);
  const mantenimientoId = req.params.id;
  const { estado, fecha_fin, activos } = req.body;

  // Validar activos antes de proceder
  const validarActivos = (activos) => {
    if (!Array.isArray(activos) || activos.some((activo) => !activo.activo_id)) {
      throw new Error('Todos los activos deben tener un ID válido.');
    }
  };

  try {
    // Validar activos
    validarActivos(activos);

    const queryActualizarMantenimiento = `
      UPDATE mantenimientos
      SET estado = ?, fecha_fin = ?
      WHERE id = ?;
    `;

    db.query(queryActualizarMantenimiento, [estado, fecha_fin, mantenimientoId], (error) => {
      if (error) {
        console.error('Error al actualizar el mantenimiento:', error);
        return res.status(500).json({ error: 'Error al actualizar el mantenimiento' });
      }

      const activosPromises = activos.map((activo) => procesarActivo(activo, mantenimientoId));

      // Si el mantenimiento se marca como "Terminado", actualizar activos a "Funcionando"
      if (estado === 'Terminado') {
        const queryActualizarActivos = `
          UPDATE activos a
          JOIN mantenimientos_activos ma ON a.id = ma.activo_id
          SET a.estado = 'Funcionando'
          WHERE ma.mantenimiento_id = ?
            AND a.estado = 'No Funcionando';
        `;

        const actualizarActivos = new Promise((resolve, reject) => {
          db.query(queryActualizarActivos, [mantenimientoId], (err, results) => {
            if (err) {
              console.error('Error al actualizar estado de activos a Funcionando:', err);
              return reject(err);
            }
            console.log(`Activos actualizados a "Funcionando" para mantenimientoId=${mantenimientoId}`);
            resolve();
          });
        });

        // Combina ambas promesas: procesamiento de activos + actualización de activos
        Promise.all([Promise.all(activosPromises), actualizarActivos])
          .then(() =>
            res.status(200).json({ message: 'Mantenimiento actualizado exitosamente.' })
          )
          .catch((error) => {
            console.error('Error al procesar los activos:', error);
            res.status(500).json({ error: 'Error al procesar los activos del mantenimiento' });
          });
      } else {
        // Si no está terminado, solo procesa los activos
        Promise.all(activosPromises)
          .then(() =>
            res.status(200).json({ message: 'Mantenimiento actualizado exitosamente.' })
          )
          .catch((error) => {
            console.error('Error al procesar los activos:', error);
            res.status(500).json({ error: 'Error al procesar los activos del mantenimiento' });
          });
      }
    });
  } catch (error) {
    console.error('Error en la validación de activos:', error.message);
    res.status(400).json({ error: error.message });
  }
};




const procesarActivo = (activo, mantenimientoId) => {
  return new Promise((resolve, reject) => {
    if (!activo || (!activo.activo_id && (!activo.codigo || !activo.nombre))) {
      console.error("Activo no tiene suficiente información para ser procesado.");
      return reject(new Error("Activo no tiene suficiente información para ser procesado."));
    }

    if (activo.activo_id) {
      // Validar si el activo existente pertenece al mantenimiento
      const queryValidarActivo = `
        SELECT id FROM mantenimientos_activos
        WHERE mantenimiento_id = ? AND activo_id = ?;
      `;

      db.query(queryValidarActivo, [mantenimientoId, activo.activo_id], (error, results) => {
        if (error) {
          console.error("Error al validar el activo existente:", error);
          return reject(new Error("Error al validar el activo existente."));
        }

        if (results.length === 0) {
          console.warn(`El activo con ID ${activo.activo_id} no pertenece a este mantenimiento.`);
          return reject(new Error(`El activo con ID ${activo.activo_id} no pertenece a este mantenimiento.`));
        }

        // Actualizar las especificaciones del activo en el mantenimiento
        const mantenimientoActivoId = results[0].id;
        actualizarEspecificaciones(mantenimientoActivoId, activo.especificaciones)
          .then(() => {
            console.log(`Especificaciones actualizadas para activo existente con ID: ${activo.activo_id}`);
            resolve({
              ...activo,
              mantenimiento_activo_id: mantenimientoActivoId,
            });
          })
          .catch((err) => {
            console.error("Error al actualizar las especificaciones del activo existente:", err);
            reject(err);
          });
      });
    } else {
      // Insertar un nuevo activo y asociarlo al mantenimiento
      const queryCrearActivo = `
        INSERT INTO activos (codigo, nombre, estado, tipo_activo_id, ubicacion_id, proveedor_id)
        VALUES (?, ?, ?, ?, ?, ?);
      `;
      const activoValues = [
        activo.codigo,
        activo.nombre,
        activo.estado || "Pendiente",
        activo.tipo_activo_id || null,
        activo.ubicacion_id || null,
        activo.proveedor_id || null,
      ];

      db.query(queryCrearActivo, activoValues, (error, results) => {
        if (error) {
          console.error("Error al crear un nuevo activo:", error);
          return reject(new Error("Error al crear un nuevo activo."));
        }

        const nuevoActivoId = results.insertId;
        console.log(`Activo nuevo creado con ID: ${nuevoActivoId}`);

        // Asociar el nuevo activo al mantenimiento
        const queryAsociarActivo = `
          INSERT INTO mantenimientos_activos (mantenimiento_id, activo_id)
          VALUES (?, ?);
        `;

        db.query(queryAsociarActivo, [mantenimientoId, nuevoActivoId], (error, results) => {
          if (error) {
            console.error("Error al asociar el activo al mantenimiento:", error);
            return reject(new Error("Error al asociar el activo al mantenimiento."));
          }

          const mantenimientoActivoId = results.insertId;
          console.log(`Asociación creada con ID: ${mantenimientoActivoId}`);

          // Actualizar las especificaciones del nuevo activo
          actualizarEspecificaciones(mantenimientoActivoId, activo.especificaciones)
            .then(() => {
              console.log(`Especificaciones actualizadas para nuevo activo con ID: ${nuevoActivoId}`);
              resolve({
                ...activo,
                activo_id: nuevoActivoId,
                mantenimiento_activo_id: mantenimientoActivoId,
              });
            })
            .catch((err) => {
              console.error("Error al actualizar las especificaciones del nuevo activo:", err);
              reject(err);
            });
        });
      });
    }
  });
};








const asociarActivoMantenimiento = (activoId, mantenimientoId, especificaciones) => {
  return new Promise((resolve, reject) => {
    // Validar que activoId no sea null o undefined
    if (!activoId) {
      console.error(`Error: activo_id no puede ser null o undefined. activoId recibido: ${activoId}`);
      return reject(new Error('Error: activo_id no puede ser null o undefined.'));
    }

    // Comprobar si ya existe una relación entre el activo y el mantenimiento
    const queryComprobarRelacion = `
      SELECT id FROM mantenimientos_activos
      WHERE mantenimiento_id = ? AND activo_id = ?
    `;

    db.query(queryComprobarRelacion, [mantenimientoId, activoId], (error, results) => {
      if (error) {
        console.error('Error al comprobar la relación entre mantenimiento y activo:', error);
        return reject(new Error('Error al comprobar la relación entre mantenimiento y activo.'));
      }

      let mantenimientoActivoId;

      if (results.length > 0) {
        // Relación ya existe
        mantenimientoActivoId = results[0].id;
        console.log(`Relación ya existe. ID: ${mantenimientoActivoId}`);
        actualizarEspecificaciones(mantenimientoActivoId, especificaciones)
          .then(() => {
            console.log(`Especificaciones actualizadas correctamente para la relación existente con ID: ${mantenimientoActivoId}`);
            resolve();
          })
          .catch((error) => {
            console.error('Error al actualizar especificaciones para la relación existente:', error);
            reject(new Error('Error al actualizar especificaciones para la relación existente.'));
          });
      } else {
        // Crear nueva relación
        const queryAsociarActivo = `
          INSERT INTO mantenimientos_activos (mantenimiento_id, activo_id)
          VALUES (?, ?)
        `;

        db.query(queryAsociarActivo, [mantenimientoId, activoId], (error, results) => {
          if (error) {
            console.error('Error al asociar activo con mantenimiento:', error);
            return reject(new Error('Error al asociar el activo con el mantenimiento.'));
          }

          mantenimientoActivoId = results.insertId;

          if (!mantenimientoActivoId) {
            console.error('Error: No se pudo obtener el ID de la nueva relación.');
            return reject(new Error('Error: No se pudo obtener el ID de la nueva relación.'));
          }

          console.log(`Nueva relación creada. ID: ${mantenimientoActivoId}`);

          actualizarEspecificaciones(mantenimientoActivoId, especificaciones)
            .then(() => {
              console.log(`Especificaciones actualizadas correctamente para la nueva relación con ID: ${mantenimientoActivoId}`);
              resolve();
            })
            .catch((error) => {
              console.error('Error al actualizar especificaciones después de crear la relación:', error);
              reject(new Error('Error al actualizar especificaciones después de crear la relación.'));
            });
        });
      }
    });
  });
};






const obtenerMantenimientoActivoId = (mantenimientoId, activoId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT id FROM mantenimientos_activos
      WHERE mantenimiento_id = ? AND activo_id = ?
    `;
    db.query(query, [mantenimientoId, activoId], (error, results) => {
      if (error) return reject(error);
      if (results.length === 0) return reject(new Error('Asociación no encontrada'));
      resolve(results[0].id);
    });
  });
};

// Actualizar especificaciones (actividades, componentes, observaciones)
// Aquí está el código ajustado para corregir el problema de actualización de actividades y componentes.
const actualizarEspecificaciones = (mantenimientoActivoId, especificaciones) => {
  return new Promise((resolve, reject) => {
    const { actividades, componentes, observaciones } = especificaciones;
    const promises = [];

    // Actualizar actividades
    if (actividades) {
      promises.push(
        new Promise((resolve, reject) => {
          const queryExistentes = `
            SELECT actividad_id FROM mantenimiento_actividades
            WHERE mantenimiento_activo_id = ?;
          `;
          db.query(queryExistentes, [mantenimientoActivoId], (error, existentes) => {
            if (error) return reject(error);

            const existentesSet = new Set(existentes.map((row) => row.actividad_id));

            // Nuevas actividades a insertar
            const nuevasActividades = actividades.filter(
              (actividad) => !existentesSet.has(actividad.actividad_id)
            );

            const promisesActividades = [];

            // Validar e insertar nuevas actividades
            if (nuevasActividades.length > 0) {
              const idsAValidar = nuevasActividades.map((a) => a.actividad_id);
              const queryValidarActividades = `
                SELECT id FROM actividades WHERE id IN (?);
              `;
              db.query(queryValidarActividades, [idsAValidar], (error, resultadosValidos) => {
                if (error) return reject(error);

                const idsValidos = resultadosValidos.map((row) => row.id);
                const actividadesValidas = nuevasActividades.filter((a) =>
                  idsValidos.includes(a.actividad_id)
                );

                if (actividadesValidas.length > 0) {
                  const queryInsert = `
                    INSERT INTO mantenimiento_actividades (mantenimiento_activo_id, actividad_id, descripcion)
                    VALUES ?;
                  `;
                  const actividadesValues = actividadesValidas.map((actividad) => [
                    mantenimientoActivoId,
                    actividad.actividad_id,
                    actividad.descripcion || "",
                  ]);

                  promisesActividades.push(
                    new Promise((resolve, reject) => {
                      db.query(queryInsert, [actividadesValues], (error) => {
                        if (error) return reject(error);
                        resolve();
                      });
                    })
                  );
                }

                Promise.all(promisesActividades).then(resolve).catch(reject);
              });
            } else {
              resolve(); // No hay nuevas actividades que insertar
            }
          });
        })
      );
    }

    // Actualizar componentes
    if (componentes) {
      promises.push(
        new Promise((resolve, reject) => {
          const queryExistentes = `
            SELECT componente_id FROM mantenimiento_componentes
            WHERE mantenimiento_activo_id = ?;
          `;
          db.query(queryExistentes, [mantenimientoActivoId], (error, existentes) => {
            if (error) return reject(error);

            const existentesSet = new Set(existentes.map((row) => row.componente_id));

            // Nuevos componentes a insertar
            const nuevosComponentes = componentes.filter(
              (componente) => !existentesSet.has(componente.componente_id)
            );

            const promisesComponentes = [];

            // Validar e insertar nuevos componentes
            if (nuevosComponentes.length > 0) {
              const idsAValidar = nuevosComponentes.map((c) => c.componente_id);
              const queryValidarComponentes = `
                SELECT id FROM componentes WHERE id IN (?);
              `;
              db.query(queryValidarComponentes, [idsAValidar], (error, resultadosValidos) => {
                if (error) return reject(error);

                const idsValidos = resultadosValidos.map((row) => row.id);
                const componentesValidos = nuevosComponentes.filter((c) =>
                  idsValidos.includes(c.componente_id)
                );

                if (componentesValidos.length > 0) {
                  const queryInsert = `
                    INSERT INTO mantenimiento_componentes (mantenimiento_activo_id, componente_id, cantidad)
                    VALUES ?;
                  `;
                  const componentesValues = componentesValidos.map((componente) => [
                    mantenimientoActivoId,
                    componente.componente_id,
                    componente.cantidad || 1,
                  ]);

                  promisesComponentes.push(
                    new Promise((resolve, reject) => {
                      db.query(queryInsert, [componentesValues], (error) => {
                        if (error) return reject(error);
                        resolve();
                      });
                    })
                  );
                }

                Promise.all(promisesComponentes).then(resolve).catch(reject);
              });
            } else {
              resolve(); // No hay nuevos componentes que insertar
            }
          });
        })
      );
    }

    // Actualizar observaciones
    if (observaciones !== undefined) {
      promises.push(
        new Promise((resolve, reject) => {
          const queryInsertarObservacion = `
            INSERT INTO mantenimiento_observaciones (mantenimiento_activo_id, observacion)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE observacion = VALUES(observacion);
          `;
          db.query(queryInsertarObservacion, [mantenimientoActivoId, observaciones], (error) => {
            if (error) return reject(error);
            resolve();
          });
        })
      );
    }
    

    // Ejecutar todas las promesas
    Promise.all(promises)
      .then(() => resolve())
      .catch((error) => {
        console.error("Error al actualizar especificaciones:", error);
        reject(error);
      });
  });
};





const asociarActivoAMantenimiento = (req, res) => {
  console.log('Datos recibidos en el backend:', req.body);
  const { mantenimiento_id, activo_id } = req.body;

  // Validar que los datos requeridos están presentes
  if (!mantenimiento_id || !activo_id) {
    console.error('Faltan datos obligatorios:', { mantenimiento_id, activo_id });
    return res.status(400).json({ message: 'mantenimiento_id y activo_id son obligatorios.' });
  }

  // Verificar si el activo ya está asociado al mantenimiento
  const queryVerificar = `
    SELECT id FROM mantenimientos_activos
    WHERE mantenimiento_id = ? AND activo_id = ?
  `;

  db.query(queryVerificar, [mantenimiento_id, activo_id], (error, results) => {
    if (error) {
      console.error('Error al verificar la relación activo-mantenimiento:', error);
      return res.status(500).json({ message: 'Error interno del servidor al verificar la relación.' });
    }

    if (results.length > 0) {
      // Si ya está asociado, informar al cliente
      return res.status(400).json({ message: 'El activo ya está asociado a este mantenimiento.' });
    }

    // Insertar la relación en la tabla mantenimientos_activos
    const queryInsertar = `
      INSERT INTO mantenimientos_activos (mantenimiento_id, activo_id)
      VALUES (?, ?)
    `;

    db.query(queryInsertar, [mantenimiento_id, activo_id], (error, results) => {
      if (error) {
        console.error('Error al asociar el activo al mantenimiento:', error);
        return res.status(500).json({ message: 'Error interno del servidor al asociar el activo.' });
      }

      // Relación creada exitosamente
      res.status(201).json({
        message: 'Activo asociado correctamente al mantenimiento.',
        mantenimiento_activo_id: results.insertId,
        activo_id,// ID generado
      });
    });
  });
};








module.exports = {
  obtenerMantenimientos,
  obtenerFiltros,
  obtenerUsuarios,
  obtenerUltimoNumero,
  crearMantenimiento, // Agregamos esto
  obtenerMantenimientoPorId,
  obtenerActividadesPorTipo,
  obtenerActividadesDelActivo,
  actualizarMantenimiento,
  asociarActivoAMantenimiento,
};
