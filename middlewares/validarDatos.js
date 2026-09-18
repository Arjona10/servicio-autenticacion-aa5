/**
 * middlewares/validarDatos.js
 * -----------------------------------------------------------------------------
 * Middleware de validacion de los datos que llegan en el cuerpo de la peticion.
 *
 * Un middleware es una funcion que se ejecuta ANTES del controlador; si los
 * datos no cumplen las reglas, responde con codigo 400 y no deja continuar la
 * peticion. Si todo esta correcto, invoca next() para pasar al controlador.
 */

// Reglas minimas exigidas para las credenciales
const LONGITUD_MINIMA_USUARIO = 4;
const LONGITUD_MINIMA_CONTRASENA = 6;

/**
 * Valida que la peticion traiga usuario y contrasena con el formato esperado.
 * @param {Object} req peticion HTTP
 * @param {Object} res respuesta HTTP
 * @param {Function} next funcion que continua la cadena de middlewares
 */
function validarCredenciales(req, res, next) {
  const { usuario, contrasena } = req.body || {};
  const errores = [];

  // Validacion del nombre de usuario
  if (!usuario || typeof usuario !== 'string' || usuario.trim() === '') {
    errores.push('El campo "usuario" es obligatorio.');
  } else if (usuario.trim().length < LONGITUD_MINIMA_USUARIO) {
    errores.push(`El usuario debe tener minimo ${LONGITUD_MINIMA_USUARIO} caracteres.`);
  }

  // Validacion de la contrasena
  if (!contrasena || typeof contrasena !== 'string' || contrasena.trim() === '') {
    errores.push('El campo "contrasena" es obligatorio.');
  } else if (contrasena.length < LONGITUD_MINIMA_CONTRASENA) {
    errores.push(`La contrasena debe tener minimo ${LONGITUD_MINIMA_CONTRASENA} caracteres.`);
  }

  // Si se encontraron errores se responde con 400 (peticion incorrecta)
  if (errores.length > 0) {
    return res.status(400).json({
      exito: false,
      mensaje: 'Los datos enviados no son validos.',
      errores
    });
  }

  // Datos correctos: continua hacia el controlador
  return next();
}

module.exports = { validarCredenciales };
