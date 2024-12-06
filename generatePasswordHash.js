const bcrypt = require('bcryptjs');
const password = '123'; // La contraseña en texto plano
const hashedPassword = bcrypt.hashSync(password, 10); // Genera el hash
console.log(hashedPassword);