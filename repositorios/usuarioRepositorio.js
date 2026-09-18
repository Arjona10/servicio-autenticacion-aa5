/**
 * repositorios/usuarioRepositorio.js
 * -----------------------------------------------------------------------------
 * Selector del repositorio de usuarios.
 *
 * Segun el valor de "motorDatos" definido en la configuracion, entrega al
 * controlador el repositorio de MongoDB o el repositorio de archivo JSON. De
 * esta forma la logica de negocio queda desacoplada del motor de datos.
 *
 * Si se configuro MongoDB pero la conexion no se pudo establecer, app.js llama
 * a "usarRepositorioArchivo()" para que el servicio siga respondiendo.
 */

const configuracion = require('../config/configuracion');
const repositorioMongo = require('./repositorioMongo');
const repositorioArchivo = require('./repositorioArchivo');

// Implementacion activa en el momento (se define al iniciar la aplicacion)
let repositorioActivo = configuracion.motorDatos === 'mongo' ? repositorioMongo : repositorioArchivo;

module.exports = {
  /** Cambia la implementacion activa al repositorio de archivo JSON. */
  usarRepositorioArchivo() {
    repositorioActivo = repositorioArchivo;
  },

  /** Indica que motor de datos se esta utilizando ("mongo" o "archivo"). */
  motorActual() {
    return repositorioActivo === repositorioMongo ? 'mongo' : 'archivo';
  },

  // Operaciones delegadas al repositorio activo
  buscarPorUsuario: (usuario) => repositorioActivo.buscarPorUsuario(usuario),
  crearUsuario: (datos) => repositorioActivo.crearUsuario(datos),
  listarUsuarios: () => repositorioActivo.listarUsuarios()
};
