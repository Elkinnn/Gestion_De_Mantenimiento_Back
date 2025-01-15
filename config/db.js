const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost', // Cambia si usas otro host
  user: 'root', // Usuario de tu base de datos
  password: '', // Contraseña de tu usuario (déjalo vacío si no tienes)
  database: 'gestion_activos', // Nombre de tu base de datos
});

connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.message);
    process.exit(1); // Detiene el servidor si no puede conectar
  } else {
    console.log('Conexión a la base de datos establecida');
  }
});

module.exports = connection;
