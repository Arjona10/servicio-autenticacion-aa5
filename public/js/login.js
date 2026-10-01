/**
 * public/js/login.js
 * -----------------------------------------------------------------------------
 * Logica de la pantalla de acceso: iniciar sesion y crear cuenta.
 *
 * Consume los endpoints POST /api/login y POST /api/registro. Cuando la
 * autenticacion es satisfactoria guarda el token y lleva al usuario al inicio.
 */

const formLogin = document.getElementById('formLogin');
const formRegistro = document.getElementById('formRegistro');
const btnTabLogin = document.getElementById('btnTabLogin');
const btnTabRegistro = document.getElementById('btnTabRegistro');
const mensaje = document.getElementById('mensaje');

/** Muestra un mensaje de exito o de error bajo el formulario. */
function mostrar(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = 'mensaje visible ' + tipo;
}

/** Cambia entre el formulario de inicio de sesion y el de registro. */
function cambiarPestana(esLogin) {
  formLogin.hidden = !esLogin;
  formRegistro.hidden = esLogin;
  btnTabLogin.classList.toggle('activa', esLogin);
  btnTabRegistro.classList.toggle('activa', !esLogin);
  mensaje.className = 'mensaje';
}

btnTabLogin.addEventListener('click', () => cambiarPestana(true));
btnTabRegistro.addEventListener('click', () => cambiarPestana(false));

// Si el usuario llega porque su token expiro, se le informa el motivo
if (new URLSearchParams(window.location.search).has('expirada')) {
  mostrar('La sesión expiró. Ingrese nuevamente.', 'error');
}

// Si ya hay una sesion abierta, no tiene sentido mostrar el login
if (Sesion.token()) {
  window.location.replace('/');
}

/* --------------------------------------------------------------- Iniciar sesion */
formLogin.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  mostrar('Verificando credenciales...', 'ok');

  try {
    const respuesta = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario: logUsuario.value.trim(),
        contrasena: logContrasena.value
      })
    });
    const cuerpo = await respuesta.json();

    if (!cuerpo.exito) {
      // 401: error en la autenticacion; 400: datos invalidos
      mostrar(cuerpo.mensaje, 'error');
      return;
    }

    // Autenticacion satisfactoria: se guarda el token y se entra al sistema
    Sesion.guardar(cuerpo.token, cuerpo.datos.usuario);
    window.location.replace('/');
  } catch (error) {
    mostrar('No fue posible contactar el servicio: ' + error.message, 'error');
  }
});

/* -------------------------------------------------------------- Crear cuenta */
formRegistro.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  mostrar('Creando la cuenta...', 'ok');

  try {
    const respuesta = await fetch('/api/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario: regUsuario.value.trim(),
        correo: regCorreo.value.trim(),
        contrasena: regContrasena.value
      })
    });
    const cuerpo = await respuesta.json();

    if (!cuerpo.exito) {
      // 409: el usuario ya existe; 400: no cumple las validaciones
      mostrar(cuerpo.mensaje + (cuerpo.errores ? ' ' + cuerpo.errores.join(' ') : ''), 'error');
      return;
    }

    // Registro correcto: se pasa a la pestana de inicio de sesion con el usuario listo
    cambiarPestana(true);
    logUsuario.value = regUsuario.value.trim();
    logContrasena.focus();
    mostrar('Cuenta creada. Ahora inicie sesión.', 'ok');
    formRegistro.reset();
  } catch (error) {
    mostrar('No fue posible contactar el servicio: ' + error.message, 'error');
  }
});
