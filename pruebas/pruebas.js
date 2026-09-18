/**
 * pruebas/pruebas.js
 * -----------------------------------------------------------------------------
 * Pruebas automatizadas del servicio web (no requieren librerias externas).
 *
 * Levanta el servidor en un puerto de pruebas y ejecuta los casos principales:
 *   1. Registro de un usuario nuevo            -> 201
 *   2. Registro repetido del mismo usuario     -> 409
 *   3. Registro con datos invalidos            -> 400
 *   4. Inicio de sesion con credenciales validas   -> 200 (autenticacion satisfactoria)
 *   5. Inicio de sesion con contrasena incorrecta  -> 401 (error en la autenticacion)
 *   6. Inicio de sesion de un usuario inexistente  -> 401
 *   7. Ruta protegida sin token                -> 401
 *   8. Ruta protegida con token valido         -> 200
 *
 * Ejecucion:  npm test
 */

process.env.MOTOR_DATOS = 'archivo'; // las pruebas no dependen de MongoDB

const http = require('http');
const app = require('../app');

const PUERTO = 3100;
const BASE = `http://localhost:${PUERTO}`;

// Usuario distinto en cada ejecucion para no chocar con datos anteriores
const USUARIO = 'prueba' + Date.now().toString().slice(-6);
const CONTRASENA = 'Sena2026*';

let superadas = 0;
let fallidas = 0;
let token = '';

/**
 * Realiza una peticion HTTP al servicio y devuelve estado y cuerpo.
 */
function peticion(metodo, ruta, cuerpo, autorizacion) {
  return new Promise((resolve, reject) => {
    const datos = cuerpo ? JSON.stringify(cuerpo) : null;
    const opciones = {
      hostname: 'localhost',
      port: PUERTO,
      path: ruta,
      method: metodo,
      headers: Object.assign(
        datos ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(datos) } : {},
        autorizacion ? { Authorization: 'Bearer ' + autorizacion } : {}
      )
    };

    const solicitud = http.request(opciones, (respuesta) => {
      let texto = '';
      respuesta.on('data', (parte) => (texto += parte));
      respuesta.on('end', () => {
        let json = {};
        try { json = JSON.parse(texto); } catch (e) { json = { crudo: texto }; }
        resolve({ estado: respuesta.statusCode, cuerpo: json });
      });
    });

    solicitud.on('error', reject);
    if (datos) solicitud.write(datos);
    solicitud.end();
  });
}

/**
 * Compara el resultado obtenido contra el esperado e imprime el resultado.
 */
function verificar(descripcion, esperado, obtenido, mensaje) {
  if (esperado === obtenido) {
    superadas++;
    console.log(`  OK   | ${descripcion} -> HTTP ${obtenido} | ${mensaje || ''}`);
  } else {
    fallidas++;
    console.log(`  FALLA| ${descripcion} -> se esperaba HTTP ${esperado} y se obtuvo ${obtenido}`);
  }
}

async function ejecutarPruebas() {
  console.log('\n=== Pruebas del servicio web de autenticacion ===');
  console.log(`Servidor de pruebas: ${BASE}  |  Usuario: ${USUARIO}\n`);

  let r;

  r = await peticion('POST', '/api/registro', { usuario: USUARIO, contrasena: CONTRASENA, correo: 'prueba@sena.edu.co' });
  verificar('1. Registro de usuario nuevo', 201, r.estado, r.cuerpo.mensaje);

  r = await peticion('POST', '/api/registro', { usuario: USUARIO, contrasena: CONTRASENA });
  verificar('2. Registro duplicado', 409, r.estado, r.cuerpo.mensaje);

  r = await peticion('POST', '/api/registro', { usuario: 'ab', contrasena: '123' });
  verificar('3. Registro con datos invalidos', 400, r.estado, r.cuerpo.mensaje);

  r = await peticion('POST', '/api/login', { usuario: USUARIO, contrasena: CONTRASENA });
  token = r.cuerpo.token || '';
  verificar('4. Login con credenciales validas', 200, r.estado, r.cuerpo.mensaje);

  r = await peticion('POST', '/api/login', { usuario: USUARIO, contrasena: 'claveErrada123' });
  verificar('5. Login con contrasena incorrecta', 401, r.estado, r.cuerpo.mensaje);

  r = await peticion('POST', '/api/login', { usuario: 'usuarionoexiste', contrasena: CONTRASENA });
  verificar('6. Login de usuario inexistente', 401, r.estado, r.cuerpo.mensaje);

  r = await peticion('GET', '/api/perfil');
  verificar('7. Ruta protegida sin token', 401, r.estado, r.cuerpo.mensaje);

  r = await peticion('GET', '/api/perfil', null, token);
  verificar('8. Ruta protegida con token valido', 200, r.estado, r.cuerpo.mensaje);

  console.log(`\nResultado: ${superadas} pruebas superadas, ${fallidas} fallidas.\n`);
  return fallidas;
}

// Se levanta el servidor, se ejecutan las pruebas y se cierra
const servidor = app.listen(PUERTO, async () => {
  try {
    const fallos = await ejecutarPruebas();
    servidor.close(() => process.exit(fallos === 0 ? 0 : 1));
  } catch (error) {
    console.error('Error ejecutando las pruebas:', error.message);
    servidor.close(() => process.exit(1));
  }
});
