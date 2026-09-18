/**
 * config/configuracion.js
 * -----------------------------------------------------------------------------
 * Centraliza los parametros de configuracion del servicio web.
 *
 * Las variables se leen del archivo ".env" (no versionado) por medio del paquete
 * "dotenv". Si una variable no existe, se aplica un valor por defecto para que
 * el proyecto pueda ejecutarse sin configuracion adicional.
 *
 * Evidencia GA7-220501096-AA5-EV01 - Aldemar Garcia Rodriguez - SENA ADSO.
 */

// Carga las variables definidas en el archivo .env hacia process.env
require('dotenv').config();

module.exports = {
  // Puerto TCP por el que el servidor Express escucha las peticiones
  puerto: process.env.PORT || 3000,

  // Motor de persistencia: "mongo" usa MongoDB/Mongoose, "archivo" usa un JSON local.
  // Se selecciona automaticamente "mongo" cuando se define la cadena de conexion.
  motorDatos: process.env.MOTOR_DATOS || (process.env.MONGODB_URI ? 'mongo' : 'archivo'),

  // Cadena de conexion a la base de datos MongoDB (Atlas o instalacion local)
  mongodbUri: process.env.MONGODB_URI || '',

  // Llave secreta con la que se firma el token JWT que se entrega al iniciar sesion
  jwtSecreto: process.env.JWT_SECRETO || 'clave_secreta_solo_para_desarrollo_AA5',

  // Tiempo de vigencia del token emitido tras una autenticacion satisfactoria
  jwtExpiracion: process.env.JWT_EXPIRACION || '2h',

  // Numero de rondas de "salt" que usa bcrypt para cifrar la contrasena.
  // A mayor numero, mayor seguridad y mayor costo de procesamiento.
  rondasCifrado: Number(process.env.RONDAS_CIFRADO || 10)
};
