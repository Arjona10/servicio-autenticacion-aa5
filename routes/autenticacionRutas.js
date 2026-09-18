/**
 * routes/autenticacionRutas.js
 * -----------------------------------------------------------------------------
 * Define el direccionamiento (rutas) del servicio web.
 *
 * Se utiliza express.Router(), que permite crear manejadores de rutas modulares
 * y montarlos posteriormente en app.js bajo el prefijo /api.
 *
 * Estructura de una ruta:  router.METODO(RUTA, [middlewares], MANEJADOR)
 */

const express = require('express');
const router = express.Router();

const controlador = require('../controllers/autenticacionControlador');
const { validarCredenciales } = require('../middlewares/validarDatos');
const { verificarToken } = require('../middlewares/verificarToken');

/**
 * POST /api/registro
 * Registro de un nuevo usuario.
 * Cuerpo esperado: { "usuario": "...", "contrasena": "...", "correo": "..." }
 */
router.post('/registro', validarCredenciales, controlador.registrarUsuario);

/**
 * POST /api/login
 * Inicio de sesion. Devuelve mensaje de autenticacion satisfactoria o error.
 * Cuerpo esperado: { "usuario": "...", "contrasena": "..." }
 */
router.post('/login', validarCredenciales, controlador.iniciarSesion);

/**
 * GET /api/perfil
 * Ruta protegida: requiere el encabezado Authorization con el token JWT.
 */
router.get('/perfil', verificarToken, controlador.perfil);

/**
 * GET /api/usuarios
 * Ruta protegida: lista los usuarios registrados.
 */
router.get('/usuarios', verificarToken, controlador.listarUsuarios);

// Se exporta el router para que app.js lo monte en el servidor
module.exports = router;
