/**
 * middlewares/manejadorErrores.js
 * -----------------------------------------------------------------------------
 * Middlewares para el manejo de rutas inexistentes y de errores no controlados.
 *
 * Se registran al final de app.js, despues de todas las rutas del servicio.
 */

/**
 * Responde 404 cuando la URL solicitada no corresponde a ninguna ruta definida.
 */
function rutaNoEncontrada(req, res) {
  res.status(404).json({
    exito: false,
    mensaje: `La ruta ${req.method} ${req.originalUrl} no existe en este servicio.`
  });
}

/**
 * Captura cualquier error que se haya producido en la cadena de middlewares o
 * en los controladores y devuelve una respuesta uniforme con codigo 500.
 * Express identifica este middleware porque recibe cuatro parametros.
 */
function manejadorErrores(error, req, res, next) { // eslint-disable-line no-unused-vars
  console.error('[ERROR]', error.message);
  res.status(500).json({
    exito: false,
    mensaje: 'Ocurrio un error interno en el servidor.',
    detalle: error.message
  });
}

module.exports = { rutaNoEncontrada, manejadorErrores };
