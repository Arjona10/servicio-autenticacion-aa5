/**
 * config/baseDatos.js
 * -----------------------------------------------------------------------------
 * Establece la conexion con la base de datos MongoDB usando Mongoose, tal como
 * se explica en el componente formativo "Construccion API".
 *
 * Si el proyecto se ejecuta en modo "archivo" (sin cadena de conexion), esta
 * funcion no intenta conectarse y el servicio continua operando con el
 * repositorio de archivo JSON.
 */

const dns = require('dns');
const mongoose = require('mongoose');
const configuracion = require('./configuracion');

/**
 * Fija los servidores DNS que utiliza Node para resolver la cadena de conexion.
 *
 * Las cadenas "mongodb+srv://" obligan a Node a consultar un registro SRV, y esa
 * consulta la resuelve su cliente DNS interno (c-ares), no el resolutor del
 * sistema operativo. Cuando c-ares toma un servidor DNS inalcanzable (adaptadores
 * virtuales de VPN, Docker o Hyper-V, o un DNS IPv6 que no responde), la conexion
 * falla con el error "querySrv ECONNREFUSED" aunque la red funcione con normalidad.
 *
 * Definiendo DNS_SERVIDORES en el archivo .env se fuerza el uso de servidores
 * publicos y se resuelve el problema sin modificar la configuracion del equipo.
 */
function configurarResolutorDns() {
  if (!configuracion.dnsServidores.length) {
    return;
  }
  try {
    dns.setServers(configuracion.dnsServidores);
    console.log('[DNS] Resolutor fijado en:', dns.getServers().join(', '));
  } catch (error) {
    // Una direccion mal escrita no debe impedir el arranque del servicio
    console.error('[DNS] No fue posible fijar los servidores DNS:', error.message);
  }
}

/**
 * Realiza la conexion a MongoDB.
 * @returns {Promise<boolean>} true si la conexion fue exitosa, false en caso contrario.
 */
async function conectarBaseDatos() {
  // Cuando el motor configurado no es MongoDB, se omite la conexion
  if (configuracion.motorDatos !== 'mongo') {
    console.log('[BD] Modo de almacenamiento: archivo JSON local (datos/usuarios.json)');
    return false;
  }

  // Se ajusta el resolutor DNS antes de intentar la conexion
  configurarResolutorDns();

  try {
    // mongoose.connect abre la conexion con el cluster indicado en la cadena URI
    await mongoose.connect(configuracion.mongodbUri);
    console.log('[BD] Conexion establecida con MongoDB');
    return true;
  } catch (error) {
    // Si la conexion falla se informa el motivo, pero no se detiene el servidor
    console.error('[BD] No fue posible conectar con MongoDB:', error.message);

    // Ayuda al diagnostico de los dos errores mas frecuentes
    if (error.message.includes('querySrv')) {
      console.error('[BD] La consulta DNS del cluster fallo. Defina DNS_SERVIDORES=8.8.8.8,1.1.1.1');
      console.error('[BD] en el archivo .env, o use la cadena de conexion sin "+srv" que entrega Atlas.');
    } else if (error.message.includes('IP') || error.message.includes('timed out')) {
      console.error('[BD] Verifique en Atlas que su direccion IP este autorizada en Network Access.');
    }
    return false;
  }
}

module.exports = { conectarBaseDatos };
