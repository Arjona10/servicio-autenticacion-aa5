/**
 * app.js
 * =============================================================================
 * Evidencia GA7-220501096-AA5-EV01
 * Diseno y desarrollo de servicios web - caso: registro e inicio de sesion.
 *
 * Aprendiz : Aldemar Garcia Rodriguez
 * Programa : Tecnologia en Analisis y Desarrollo de Software (ADSO) - SENA
 *
 * Archivo principal del servicio web. Aqui se inicia el modulo Express, se
 * configuran los middlewares, se montan las rutas y se pone el servidor a
 * escuchar las peticiones de los clientes.
 * =============================================================================
 */

// --- 1. Importacion de modulos -------------------------------------------------
const express = require('express');        // framework web para Node.js
const bodyParser = require('body-parser'); // convierte a JSON el cuerpo de la peticion
const path = require('path');              // utilidades para rutas de archivos

const configuracion = require('./config/configuracion');       // parametros del proyecto
const { conectarBaseDatos } = require('./config/baseDatos');    // conexion a MongoDB
const repositorio = require('./repositorios/usuarioRepositorio');
const rutasAutenticacion = require('./routes/autenticacionRutas');
const { rutaNoEncontrada, manejadorErrores } = require('./middlewares/manejadorErrores');

// --- 2. Creacion de la aplicacion ----------------------------------------------
const app = express();

// --- 3. Middlewares globales ---------------------------------------------------
// Permite recibir y procesar peticiones con cuerpo en formato JSON
app.use(bodyParser.json());
// Permite recibir datos enviados desde formularios HTML (x-www-form-urlencoded)
app.use(bodyParser.urlencoded({ extended: true }));
// Publica el cliente de prueba (public/index.html) para probar el servicio desde el navegador
app.use(express.static(path.join(__dirname, 'public')));

// Middleware propio: registra en consola cada peticion recibida
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next(); // continua con el siguiente middleware o ruta
});

// --- 4. Rutas de las paginas del sitio -----------------------------------------
// La raiz "/" la entrega express.static con public/index.html, que es la
// interfaz principal de MI-BICI. Las dos rutas siguientes dan una direccion
// limpia (sin la extension .html) a las demas paginas.

/** Pantalla de inicio de sesion y registro. */
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

/** Panel de pruebas de la API (cliente web de la evidencia AA5-EV01). */
app.get('/pruebas', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pruebas.html'));
});

// --- 5. Rutas del servicio -----------------------------------------------------
/**
 * Ruta de verificacion: confirma que el servicio se encuentra activo.
 */
app.get('/api', (req, res) => {
  res.json({
    exito: true,
    mensaje: 'Servicio web de autenticacion en funcionamiento.',
    motorDatos: repositorio.motorActual(),
    rutas: {
      registro: 'POST /api/registro',
      login: 'POST /api/login',
      perfil: 'GET /api/perfil (requiere token)',
      usuarios: 'GET /api/usuarios (requiere token)'
    }
  });
});

// Se montan las rutas de registro e inicio de sesion bajo el prefijo /api
app.use('/api', rutasAutenticacion);

// --- 6. Manejo de errores (siempre al final) -----------------------------------
app.use(rutaNoEncontrada);  // 404 para rutas inexistentes
app.use(manejadorErrores);  // 500 para errores no controlados

// --- 7. Arranque del servidor --------------------------------------------------
/**
 * Conecta la base de datos y luego pone el servidor a escuchar.
 * Si se configuro MongoDB pero la conexion falla, se cambia automaticamente al
 * repositorio de archivo JSON para que el servicio siga operando.
 */
async function iniciarServidor() {
  const conectado = await conectarBaseDatos();

  if (configuracion.motorDatos === 'mongo' && !conectado) {
    repositorio.usarRepositorioArchivo();
    console.log('[BD] Se continua con almacenamiento en archivo JSON local.');
  }

  app.listen(configuracion.puerto, () => {
    console.log('-------------------------------------------------------------');
    console.log(` Servicio web activo en: http://localhost:${configuracion.puerto}`);
    console.log(` Motor de datos       : ${repositorio.motorActual()}`);
    console.log(' Cliente de prueba    : abrir la URL anterior en el navegador');
    console.log('-------------------------------------------------------------');
  });
}

// Se ejecuta el arranque solo cuando el archivo se invoca directamente
// (permite importar "app" desde las pruebas automatizadas sin abrir el puerto).
if (require.main === module) {
  iniciarServidor();
}

module.exports = app;
