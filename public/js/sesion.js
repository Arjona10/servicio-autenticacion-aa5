/**
 * public/js/sesion.js
 * -----------------------------------------------------------------------------
 * Utilidades de sesion compartidas por todas las paginas de MI-BICI.
 *
 * El token JWT que entrega el servicio se guarda en localStorage del navegador.
 * Desde ahi se envia en el encabezado Authorization de cada peticion protegida.
 */

const Sesion = {
  // Claves con las que se guardan los datos en el navegador
  CLAVE_TOKEN: 'mibici_token',
  CLAVE_USUARIO: 'mibici_usuario',

  /** Guarda el token y el nombre de usuario tras un inicio de sesion correcto. */
  guardar(token, usuario) {
    localStorage.setItem(this.CLAVE_TOKEN, token);
    localStorage.setItem(this.CLAVE_USUARIO, usuario || '');
  },

  /** Devuelve el token almacenado, o null si no hay sesion. */
  token() {
    return localStorage.getItem(this.CLAVE_TOKEN);
  },

  /** Devuelve el nombre del usuario en sesion. */
  usuario() {
    return localStorage.getItem(this.CLAVE_USUARIO) || '';
  },

  /** Borra los datos de la sesion. */
  cerrar() {
    localStorage.removeItem(this.CLAVE_TOKEN);
    localStorage.removeItem(this.CLAVE_USUARIO);
  },

  /**
   * Realiza una peticion al API agregando el encabezado Authorization.
   * @param {string} ruta ruta del servicio (por ejemplo /api/perfil)
   * @param {Object} opciones opciones adicionales de fetch
   */
  async peticion(ruta, opciones = {}) {
    const encabezados = Object.assign({}, opciones.headers);
    if (this.token()) {
      encabezados.Authorization = 'Bearer ' + this.token();
    }
    if (opciones.body) {
      encabezados['Content-Type'] = 'application/json';
    }
    return fetch(ruta, Object.assign({}, opciones, { headers: encabezados }));
  },

  /**
   * Protege una pagina: si no hay token, o el token ya no es valido, envia al
   * usuario a la pantalla de inicio de sesion.
   *
   * La pagina debe cargar con la clase "verificando" en el body para que su
   * contenido no alcance a verse antes de la redireccion.
   *
   * @returns {Promise<Object|null>} datos del usuario autenticado, o null.
   */
  async proteger() {
    if (!this.token()) {
      window.location.replace('/login');
      return null;
    }

    try {
      const respuesta = await this.peticion('/api/perfil');

      // 401: el token expiro o es invalido. Se limpia y se pide iniciar sesion.
      if (respuesta.status === 401) {
        this.cerrar();
        window.location.replace('/login?expirada=1');
        return null;
      }

      const cuerpo = await respuesta.json();
      document.body.classList.remove('verificando');
      return cuerpo.datos || null;
    } catch (error) {
      // Si el servidor no responde, se muestra la pagina para no dejarla en blanco
      console.error('No fue posible verificar la sesion:', error.message);
      document.body.classList.remove('verificando');
      return null;
    }
  },

  /** Cierra la sesion y vuelve al inicio de sesion. */
  salir() {
    this.cerrar();
    window.location.replace('/login');
  }
};
