const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Tu usuario de MySQL
  password: '', // Tu contraseña de MySQL
  database: 'gestión_activos' // Nombre de tu base de datos
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar con la base de datos: ', err);
    return;
  }
  console.log('Conexión exitosa con la base de datos MySQL');
});

module.exports = db;
