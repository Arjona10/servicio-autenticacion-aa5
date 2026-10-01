/**
 * public/js/inicio.js
 * -----------------------------------------------------------------------------
 * Logica de la interfaz principal de MI-BICI.
 *
 * Lo primero que hace es proteger la pagina: si no hay token valido, Sesion
 * redirige al inicio de sesion y el contenido nunca llega a mostrarse.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Verificacion de la sesion contra el endpoint protegido /api/perfil
  const datos = await Sesion.proteger();

  // Si no hay sesion, proteger() ya redirigio y no hay nada mas que hacer
  if (!datos) {
    return;
  }

  // Se personaliza la interfaz con el usuario autenticado
  const usuario = datos.usuario || Sesion.usuario();
  document.getElementById('nombreUsuario').textContent = usuario;
  document.getElementById('saludoUsuario').textContent = usuario;

  // Se muestra la respuesta del endpoint protegido como evidencia del token
  document.getElementById('datosSesion').textContent = JSON.stringify(datos, null, 2);

  // Cierre de sesion
  document.getElementById('btnSalir').addEventListener('click', () => Sesion.salir());
});
