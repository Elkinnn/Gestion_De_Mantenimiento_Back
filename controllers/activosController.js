const XLSX = require('xlsx');
const db = require('../config/db'); // Asegúrate de tener configurada la conexión a la base de datos

const uploadLotes = async (req, res) => {
  try {
    // Verificar si se subió un archivo
    if (!req.file) {
      return res.status(400).json({ message: 'Por favor, suba un archivo.' });
    }

    // Verificar que el archivo sea un Excel
    if (!req.file.originalname.endsWith('.xlsx') && !req.file.originalname.endsWith('.xls')) {
      return res.status(400).json({ message: 'Solo se permiten archivos Excel.' });
    }

    // Leer el archivo Excel
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    // Verificar si el archivo tiene datos
    if (!data.length) {
      return res.status(400).json({ message: 'El archivo está vacío o no tiene datos válidos.' });
    }

    // Insertar cada fila en la base de datos
    for (const row of data) {
      const { proceso_compra, codigo, nombre, estado, ubicacion, tipo, proveedor } = row;

      // Verificar que todos los campos sean válidos
      if (!proceso_compra || !codigo || !nombre || !estado || !ubicacion || !tipo || !proveedor) {
        return res.status(400).json({ message: 'Uno o más registros tienen campos faltantes.' });
      }

      // Consulta SQL para insertar el registro en la base de datos
      const query = `
        INSERT INTO activos (proceso_compra, codigo, nombre, estado, ubicacion, tipo, proveedor)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      // Insertar el registro en la base de datos
      await db.promise().query(query, [
        proceso_compra,
        codigo,
        nombre,
        estado,
        ubicacion,
        tipo,
        proveedor,
      ]);
    }

    // Respuesta exitosa
    return res.status(200).json({ message: 'Activos cargados exitosamente.' });
  } catch (error) {
    // Manejo de errores
    console.error(error);
    return res.status(500).json({ message: 'Error al procesar el archivo.', error });
  }
};

module.exports = {
  uploadLotes,
};
