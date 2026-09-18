/**
 * repositorios/repositorioArchivo.js
 * -----------------------------------------------------------------------------
 * Implementacion alterna del repositorio de usuarios usando un archivo JSON
 * local (datos/usuarios.json).
 *
 * Su proposito es permitir que el servicio web se pueda probar y calificar sin
 * necesidad de instalar MongoDB ni crear un cluster en Atlas. Expone exactamente
 * los mismos metodos que el repositorio de MongoDB, por lo que el controlador
 * funciona igual con cualquiera de los dos.
 */

const fs = require('fs');
const path = require('path');

// Ruta del archivo que hace las veces de base de datos
const CARPETA_DATOS = path.join(__dirname, '..', 'datos');
const ARCHIVO_DATOS = path.join(CARPETA_DATOS, 'usuarios.json');

/**
 * Lee el archivo de usuarios. Si no existe, lo crea vacio.
 * @returns {Array} arreglo de usuarios almacenados
 */
function leerArchivo() {
  if (!fs.existsSync(CARPETA_DATOS)) {
    fs.mkdirSync(CARPETA_DATOS, { recursive: true });
  }
  if (!fs.existsSync(ARCHIVO_DATOS)) {
    fs.writeFileSync(ARCHIVO_DATOS, '[]', 'utf8');
  }
  try {
    return JSON.parse(fs.readFileSync(ARCHIVO_DATOS, 'utf8'));
  } catch (error) {
    // Si el archivo se corrompe se reinicia para no detener el servicio
    console.error('[BD] El archivo de usuarios no es valido, se reinicia:', error.message);
    return [];
  }
}

/**
 * Escribe el arreglo completo de usuarios en el archivo JSON.
 * @param {Array} usuarios listado a persistir
 */
function escribirArchivo(usuarios) {
  fs.writeFileSync(ARCHIVO_DATOS, JSON.stringify(usuarios, null, 2), 'utf8');
}

/**
 * Busca un usuario por su nombre de usuario.
 * @param {string} usuario nombre de usuario a consultar
 * @returns {Promise<Object|null>} registro encontrado o null
 */
async function buscarPorUsuario(usuario) {
  const usuarios = leerArchivo();
  return usuarios.find((u) => u.usuario === usuario.toLowerCase()) || null;
}

/**
 * Agrega un nuevo usuario al archivo JSON.
 * @param {Object} datos objeto con usuario, contrasena (ya cifrada) y correo
 * @returns {Promise<Object>} registro creado
 */
async function crearUsuario(datos) {
  const usuarios = leerArchivo();
  const nuevoUsuario = {
    _id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8), // identificador simple
    usuario: datos.usuario.toLowerCase(),
    contrasena: datos.contrasena,
    correo: datos.correo || '',
    fechaRegistro: new Date().toISOString()
  };
  usuarios.push(nuevoUsuario);
  escribirArchivo(usuarios);
  return nuevoUsuario;
}

/**
 * Lista los usuarios registrados ocultando la contrasena cifrada.
 * @returns {Promise<Array>} arreglo de usuarios
 */
async function listarUsuarios() {
  return leerArchivo().map(({ contrasena, ...resto }) => resto);
}

module.exports = { buscarPorUsuario, crearUsuario, listarUsuarios };
