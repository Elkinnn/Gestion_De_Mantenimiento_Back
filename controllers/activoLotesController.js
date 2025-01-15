const XLSX = require('xlsx');
const db = require('../config/db'); // Asegúrate de tener configurada la conexión a la base de datos
const fs = require('fs');

const uploadLotes = async (req, res) => {
  try {
    // Verificar si se subió un archivo
    if (!req.file) {
      return res.status(400).json({ message: 'Por favor, suba un archivo.', errors: ['missing_file'] });
    }

    // Verificar que el archivo sea un Excel
    if (!req.file.originalname.endsWith('.xlsx') && !req.file.originalname.endsWith('.xls')) {
      fs.unlinkSync(req.file.path); // Eliminar archivo temporal
      return res.status(400).json({ message: 'Error al cargar: El formato es incorrecto.', errors: ['invalid_format'] });
    }

    // Verificar el tamaño del archivo (máximo 2MB)
    if (req.file.size > 2 * 1024 * 1024) {
      fs.unlinkSync(req.file.path); // Eliminar archivo temporal
      return res.status(400).json({ message: 'Error al cargar: El archivo pesa más de 2mb.', errors: ['file_too_large'] });
    }

    // Leer el archivo Excel
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    // Verificar si el archivo tiene datos
    if (!data.length) {
      fs.unlinkSync(req.file.path); // Eliminar archivo temporal
      return res.status(400).json({ message: 'El archivo está vacío o no tiene datos válidos.', errors: ['empty_file'] });
    }

    // Validar número máximo de registros
    if (data.length > 100) {
      fs.unlinkSync(req.file.path); // Eliminar archivo temporal
      return res.status(400).json({ message: 'Error al cargar: El archivo contiene más de 100 activos.', errors: ['exceeds_limit'] });
    }

    // Validar y procesar los datos
    const series = new Set();
    for (const row of data) {
      const { proceso_compra, nombre, estado, ubicacion_id, tipo_activo_id, proveedor_id } = row;

      // Verificar campos obligatorios
      if (!proceso_compra || !nombre || !estado || !ubicacion_id || !tipo_activo_id || !proveedor_id) {
        fs.unlinkSync(req.file.path); // Eliminar archivo temporal
        return res.status(400).json({ message: 'Debe completar todos los campos.', errors: ['missing_fields'] });
      }

      // Validar series duplicadas
      if (series.has(nombre)) {
        fs.unlinkSync(req.file.path); // Eliminar archivo temporal
        return res.status(400).json({ message: 'Error al cargar: Existen activos con nombres duplicados.', errors: ['duplicate_names'] });
      }
      series.add(nombre);

      /*// Verificar si el nombre ya existe en la base de datos
      const [existingName] = await db.promise().query('SELECT nombre FROM activos WHERE nombre = ?', [nombre]);
      if (existingName.length > 0) {
        fs.unlinkSync(req.file.path); // Eliminar archivo temporal
        return res.status(400).json({ message: `Error al cargar: El activo con nombre "${nombre}" ya existe en la base de datos.`, errors: ['name_already_exists'] });
      }*/
     // Verificar si el nombre ya existe en la base de datos
const [existingName] = await db.promise().query('SELECT nombre FROM activos WHERE nombre = ?', [nombre]);
if (existingName.length > 0) {
  fs.unlinkSync(req.file.path); // Eliminar archivo temporal
  return res.status(400).json({
    message: 'Error al cargar: Existen serie de activos repetitivos.',
    errors: ['duplicate_names'],
  });
}


      // Generar código incremental (simulación, deberías obtener el último código desde la base de datos)
      const [lastCodeRow] = await db.promise().query('SELECT MAX(id) as last_id FROM activos');
      const lastCode = lastCodeRow[0].last_id ? parseInt(lastCodeRow[0].last_id) + 1 : 1;
      const codigo = `COD-${String(lastCode).padStart(3, '0')}`;

      // Insertar en la base de datos con fecha de adquisición como SYSDATE
      const query = `
        INSERT INTO activos (proceso_compra, codigo, nombre, estado, ubicacion_id, tipo_activo_id, proveedor_id, fecha_adquisicion)
        VALUES (?, ?, ?, ?, ?, ?, ?, SYSDATE())
      `;
      await db.promise().query(query, [proceso_compra, codigo, nombre, estado, ubicacion_id, tipo_activo_id, proveedor_id]);
    }

    fs.unlinkSync(req.file.path); // Eliminar archivo temporal
    return res.status(200).json({ message: 'Activos cargados con éxito.' });
  } catch (error) {
    console.error(error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path); // Eliminar archivo temporal en caso de error
    }
    return res.status(500).json({ message: 'Error al procesar el archivo.', error });
  }
};

module.exports = {
  uploadLotes,
};
