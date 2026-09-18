/**
 * middlewares/verificarToken.js
 * -----------------------------------------------------------------------------
 * Middleware que protege las rutas privadas del servicio web.
 *
 * Verifica que la peticion incluya el encabezado:
 *      Authorization: Bearer <token>
 * y que el token JWT sea valido y no haya expirado. Si es correcto, agrega los
 * datos del usuario a req.usuario y permite continuar.
 */

const jwt = require('jsonwebtoken');
const configuracion = require('../config/configuracion');

function verificarToken(req, res, next) {
  // Se lee el encabezado de autorizacion enviado por el cliente
  const encabezado = req.headers.authorization || '';

  // El formato esperado es "Bearer <token>"
  const token = encabezado.startsWith('Bearer ') ? encabezado.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      exito: false,
      mensaje: 'Acceso denegado: no se envio el token de autenticacion.'
    });
  }

  try {
    // jwt.verify valida la firma y la vigencia del token
    const datos = jwt.verify(token, configuracion.jwtSecreto);
    req.usuario = datos; // los datos quedan disponibles para el controlador
    return next();
  } catch (error) {
    // El token es invalido, fue alterado o ya expiro
    return res.status(401).json({
      exito: false,
      mensaje: 'Token invalido o expirado. Debe iniciar sesion nuevamente.'
    });
  }
}

module.exports = { verificarToken };
