/**
 * controllers/autenticacionControlador.js
 * -----------------------------------------------------------------------------
 * Contiene la logica de negocio del servicio web solicitado en la evidencia:
 *
 *   1. registrarUsuario  -> crea la cuenta (usuario + contrasena cifrada).
 *   2. iniciarSesion     -> recibe usuario y contrasena; si la autenticacion es
 *                           correcta devuelve un mensaje de autenticacion
 *                           satisfactoria, en caso contrario devuelve error en
 *                           la autenticacion.
 *   3. perfil            -> ruta protegida de ejemplo que exige el token.
 *   4. listarUsuarios    -> consulta de apoyo para verificar los registros.
 *
 * Nota de seguridad: la contrasena NUNCA se guarda ni se devuelve en texto
 * plano; se cifra con bcrypt antes de almacenarla y solo se compara el hash.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const repositorio = require('../repositorios/usuarioRepositorio');
const configuracion = require('../config/configuracion');

/**
 * POST /api/registro
 * Registra un nuevo usuario en la base de datos.
 */
async function registrarUsuario(req, res, next) {
  try {
    // 1. Se toman los datos ya validados por el middleware validarCredenciales
    const usuario = req.body.usuario.trim().toLowerCase();
    const contrasena = req.body.contrasena;
    const correo = (req.body.correo || '').trim().toLowerCase();

    // 2. Se verifica que el nombre de usuario no exista previamente
    const usuarioExistente = await repositorio.buscarPorUsuario(usuario);
    if (usuarioExistente) {
      // 409 = conflicto: el recurso ya existe
      return res.status(409).json({
        exito: false,
        mensaje: 'El usuario ya se encuentra registrado. Intente con otro nombre.'
      });
    }

    // 3. Se cifra la contrasena con bcrypt (hash + salt)
    const contrasenaCifrada = await bcrypt.hash(contrasena, configuracion.rondasCifrado);

    // 4. Se almacena el nuevo usuario
    const usuarioCreado = await repositorio.crearUsuario({
      usuario,
      contrasena: contrasenaCifrada,
      correo
    });

    // 5. Respuesta 201 = recurso creado. No se devuelve la contrasena.
    return res.status(201).json({
      exito: true,
      mensaje: 'Usuario registrado satisfactoriamente.',
      datos: {
        id: usuarioCreado._id,
        usuario: usuarioCreado.usuario,
        correo: usuarioCreado.correo,
        fechaRegistro: usuarioCreado.fechaRegistro
      }
    });
  } catch (error) {
    // Cualquier error inesperado pasa al middleware manejadorErrores
    return next(error);
  }
}

/**
 * POST /api/login
 * Recibe un usuario y una contrasena y valida la autenticacion.
 */
async function iniciarSesion(req, res, next) {
  try {
    // 1. Datos enviados por el cliente
    const usuario = req.body.usuario.trim().toLowerCase();
    const contrasena = req.body.contrasena;

    // 2. Se busca el usuario en el almacenamiento
    const usuarioEncontrado = await repositorio.buscarPorUsuario(usuario);

    // 3. Si el usuario no existe -> error en la autenticacion.
    //    Se responde con un mensaje generico para no revelar si lo que fallo
    //    fue el usuario o la contrasena (buena practica de seguridad).
    if (!usuarioEncontrado) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Error en la autenticacion: usuario o contrasena incorrectos.'
      });
    }

    // 4. Se compara la contrasena recibida contra el hash almacenado
    const contrasenaValida = await bcrypt.compare(contrasena, usuarioEncontrado.contrasena);

    // 5. Si la contrasena no coincide -> error en la autenticacion
    if (!contrasenaValida) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Error en la autenticacion: usuario o contrasena incorrectos.'
      });
    }

    // 6. Autenticacion correcta: se genera un token JWT firmado
    const token = jwt.sign(
      { id: usuarioEncontrado._id, usuario: usuarioEncontrado.usuario }, // carga util
      configuracion.jwtSecreto,                                          // llave secreta
      { expiresIn: configuracion.jwtExpiracion }                         // vigencia
    );

    // 7. Mensaje de autenticacion satisfactoria
    return res.status(200).json({
      exito: true,
      mensaje: 'Autenticacion satisfactoria. Bienvenido ' + usuarioEncontrado.usuario + '.',
      token,
      datos: {
        id: usuarioEncontrado._id,
        usuario: usuarioEncontrado.usuario
      }
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/perfil  (ruta protegida)
 * Solo responde si la peticion incluye un token valido.
 */
async function perfil(req, res) {
  res.status(200).json({
    exito: true,
    mensaje: 'Token valido. Acceso autorizado al recurso protegido.',
    datos: req.usuario // informacion contenida en el token
  });
}

/**
 * GET /api/usuarios  (ruta protegida)
 * Lista los usuarios registrados, sin mostrar las contrasenas.
 */
async function listarUsuarios(req, res, next) {
  try {
    const usuarios = await repositorio.listarUsuarios();
    return res.status(200).json({
      exito: true,
      total: usuarios.length,
      datos: usuarios
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { registrarUsuario, iniciarSesion, perfil, listarUsuarios };
