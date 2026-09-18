/**
 * repositorios/repositorioMongo.js
 * -----------------------------------------------------------------------------
 * Implementacion del repositorio de usuarios sobre MongoDB (Mongoose).
 *
 * El repositorio aisla el acceso a datos: el controlador nunca consulta la base
 * de datos de manera directa, sino que solicita las operaciones a este modulo.
 */

const Usuario = require('../models/Usuario');

/**
 * Busca un usuario por su nombre de usuario.
 * @param {string} usuario nombre de usuario a consultar
 * @returns {Promise<Object|null>} documento encontrado o null
 */
async function buscarPorUsuario(usuario) {
  return Usuario.findOne({ usuario: usuario.toLowerCase() });
}

/**
 * Crea y guarda un nuevo usuario en la coleccion.
 * @param {Object} datos objeto con usuario, contrasena (ya cifrada) y correo
 * @returns {Promise<Object>} documento guardado
 */
async function crearUsuario(datos) {
  const nuevoUsuario = new Usuario(datos);
  return nuevoUsuario.save(); // save() persiste el documento en MongoDB
}

/**
 * Lista los usuarios registrados sin exponer la contrasena.
 * @returns {Promise<Array>} arreglo de usuarios
 */
async function listarUsuarios() {
  return Usuario.find({}, { contrasena: 0 }).sort({ fechaRegistro: -1 });
}

module.exports = { buscarPorUsuario, crearUsuario, listarUsuarios };
