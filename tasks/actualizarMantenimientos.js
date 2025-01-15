const cron = require('node-cron');
const db = require('../config/db'); // Conexión a la base de datos

// Función para actualizar los mantenimientos vencidos
const actualizarMantenimientos = () => {
    console.log('Verificando mantenimientos con fecha vencida...');
    const query = `
        UPDATE mantenimientos
        SET estado = 'Terminado'
        WHERE estado != 'Terminado' AND fecha_fin < CURDATE();
    `;
    db.query(query, (error, results) => {
        if (error) {
            console.error('Error al actualizar mantenimientos vencidos:', error);
        } else {
            console.log(`Mantenimientos actualizados: ${results.affectedRows}`);
        }
    });
};

// Configurar una tarea diaria a las 00:00
cron.schedule('* * * * *', () => {
    console.log('Ejecutando tarea programada: Actualizar mantenimientos...');
    actualizarMantenimientos();
});


module.exports = { actualizarMantenimientos };
