/**
 * config/baseDatos.js
 * -----------------------------------------------------------------------------
 * Establece la conexion con la base de datos MongoDB usando Mongoose, tal como
 * se explica en el componente formativo "Construccion API".
 *
 * Si el proyecto se ejecuta en modo "archivo" (sin cadena de conexion), esta
 * funcion no intenta conectarse y el servicio continua operando con el
 * repositorio de archivo JSON.
 */

const mongoose = require('mongoose');
const configuracion = require('./configuracion');

/**
 * Realiza la conexion a MongoDB.
 * @returns {Promise<boolean>} true si la conexion fue exitosa, false en caso contrario.
 */
async function conectarBaseDatos() {
  // Cuando el motor configurado no es MongoDB, se omite la conexion
  if (configuracion.motorDatos !== 'mongo') {
    console.log('[BD] Modo de almacenamiento: archivo JSON local (datos/usuarios.json)');
    return false;
  }

  try {
    // mongoose.connect abre la conexion con el cluster indicado en la cadena URI
    await mongoose.connect(configuracion.mongodbUri);
    console.log('[BD] Conexion establecida con MongoDB');
    return true;
  } catch (error) {
    // Si la conexion falla se informa el motivo, pero no se detiene el servidor
    console.error('[BD] No fue posible conectar con MongoDB:', error.message);
    return false;
  }
}

module.exports = { conectarBaseDatos };
