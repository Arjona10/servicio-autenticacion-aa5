# MI-BICI — Módulo de acceso y servicio web de autenticación

Aplicación para la movilidad segura en bicicleta en Bogotá. Este módulo resuelve el acceso de los usuarios: expone la API REST de registro e inicio de sesión, protege la interfaz principal con token JWT e incluye un panel web para probar los endpoints desde el navegador.

| Dato | Detalle |
|---|---|
| Proyecto | MI-BICI |
| Aprendiz | Aldemar García Rodríguez |
| Programa | Tecnología en Análisis y Desarrollo de Software (ADSO) — SENA |
| Evidencias | GA7-220501096-AA5-EV01 (construcción de la API) · AA5-EV02 (testing con Postman) · AA5-EV03 (Crear servicios web, de acuerdo con el diseño) |
| Tecnologías | Node.js, Express, MongoDB/Mongoose, JWT, bcrypt |

---

## 1. Rutas del sitio

| Ruta | Página | Requiere sesión |
|---|---|---|
| `/` | Interfaz principal de MI-BICI con los módulos del proyecto | Sí |
| `/login` | Inicio de sesión y creación de cuenta | No |
| `/pruebas` | Panel de pruebas de la API | No |

Al abrir `/` sin sesión activa, la página se mantiene oculta mientras verifica el token y redirige a `/login`. Cuando el token expira (dos horas por defecto), la siguiente petición protegida devuelve 401 y el usuario vuelve al acceso con el aviso correspondiente.

```mermaid
flowchart LR
    A["Usuario abre /"] --> B{"¿Hay token<br/>en el navegador?"}
    B -- No --> L["/login"]
    B -- Sí --> C["GET /api/perfil"]
    C -- "401" --> L
    C -- "200" --> D["Interfaz MI-BICI"]
    L -- "POST /api/login" --> E["Token guardado"]
    E --> D
```

---

## 2. Endpoints de la API

Todas las rutas responden en formato JSON bajo el prefijo `/api`. Las protegidas exigen el encabezado `Authorization: Bearer <token>`.

| Método | Ruta | Descripción | Token |
|---|---|---|---|
| GET | `/api` | Estado del servicio y listado de rutas | No |
| POST | `/api/registro` | Registro de un nuevo usuario | No |
| POST | `/api/login` | Inicio de sesión (autenticación) | No |
| GET | `/api/perfil` | Datos del usuario autenticado | Sí |
| GET | `/api/usuarios` | Listado de usuarios registrados | Sí |

### POST `/api/registro`

```json
{ "usuario": "ciclista", "correo": "ciclista@ejemplo.com", "contrasena": "Bogota2026*" }
```

Validaciones: usuario mínimo 4 caracteres, contraseña mínimo 6. El correo es opcional. La contraseña se cifra con bcrypt antes de almacenarse.

| Código | Situación |
|---|---|
| 201 | Usuario registrado satisfactoriamente |
| 400 | Los datos enviados no son válidos |
| 409 | El usuario ya se encuentra registrado |

### POST `/api/login`

```json
{ "usuario": "ciclista", "contrasena": "Bogota2026*" }
```

Respuesta correcta (`200 OK`):

```json
{
  "exito": true,
  "mensaje": "Autenticacion satisfactoria. Bienvenido ciclista.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "datos": { "id": "6ab3e903ee4f7a1693c2a62c", "usuario": "ciclista" }
}
```

Respuesta fallida (`401 Unauthorized`):

```json
{ "exito": false, "mensaje": "Error en la autenticacion: usuario o contrasena incorrectos." }
```

El mensaje es idéntico para usuario inexistente y para contraseña incorrecta, de modo que no se revela cuál de los dos falló.

### Rutas protegidas

`GET /api/perfil` y `GET /api/usuarios` no llevan cuerpo. Sin el encabezado `Authorization` responden `401` con *"Acceso denegado: no se envio el token de autenticacion"*; con un token vencido o alterado, *"Token invalido o expirado"*.

### Códigos de estado

| Código | Significado en el servicio |
|---|---|
| 200 | Operación correcta o autenticación satisfactoria |
| 201 | Usuario creado |
| 400 | Datos de entrada inválidos |
| 401 | Error en la autenticación, o token ausente, inválido o expirado |
| 404 | La ruta solicitada no existe |
| 409 | El nombre de usuario ya está registrado |
| 500 | Error no controlado en el servidor |

---

## 3. Herramienta de pruebas

### Panel web — `http://localhost:3000/pruebas`

Cliente incluido en el proyecto para ejecutar el registro y el inicio de sesión desde el navegador, sin instalar nada. Muestra el código de estado y el JSON devuelto por el servicio en pantalla. Es la forma más rápida de comprobar que la API responde.

### Postman

1. **Import** → seleccionar `postman/AA5-EV01_Servicio_Autenticacion.postman_collection.json`.
2. Verificar que la variable `url_base` de la colección sea `http://localhost:3000`.
3. Ejecutar las peticiones en orden. La petición *2. Login correcto* guarda el token en la variable `{{token}}`, que usan las rutas protegidas.

Escenarios incluidos en la colección:

| # | Escenario | Resultado esperado |
|---|---|---|
| A | Registro exitoso | 201 Created |
| B | Autenticación satisfactoria | 200 OK + token |
| C | Error en la autenticación | 401 Unauthorized |
| D | Usuario duplicado | 409 Conflict |
| E | Datos inválidos | 400 Bad Request |
| F | Ruta protegida con y sin token | 200 OK / 401 Unauthorized |

### Pruebas automatizadas

```bash
npm test
```

Levanta el servidor en un puerto de pruebas y ejecuta los ocho casos sin librerías externas. Resultado esperado: **8 pruebas superadas, 0 fallidas**.

---

## 4. Estructura del proyecto

```
servicio-autenticacion/
├── app.js                          # Servidor Express, middlewares y rutas de las páginas
├── package.json                    # Dependencias y scripts
├── .env.ejemplo                    # Plantilla de variables de entorno
├── config/
│   ├── configuracion.js            # Parámetros centralizados (puerto, JWT, motor de datos)
│   └── baseDatos.js                # Conexión a MongoDB y ajuste del resolutor DNS
├── models/
│   └── Usuario.js                  # Esquema del usuario
├── repositorios/
│   ├── usuarioRepositorio.js       # Selector del motor de almacenamiento
│   ├── repositorioMongo.js         # Acceso a datos con MongoDB
│   └── repositorioArchivo.js       # Acceso a datos con archivo JSON local
├── controllers/
│   └── autenticacionControlador.js # Registro, login y rutas protegidas
├── routes/
│   └── autenticacionRutas.js       # Direccionamiento de la API
├── middlewares/
│   ├── validarDatos.js             # Validación de usuario y contraseña
│   ├── verificarToken.js           # Verificación del token JWT
│   └── manejadorErrores.js         # Rutas inexistentes (404) y errores (500)
├── public/
│   ├── index.html                  # Interfaz principal de MI-BICI (protegida)
│   ├── login.html                  # Inicio de sesión y registro
│   ├── pruebas.html                # Panel de pruebas de la API
│   ├── css/mibici.css              # Estilos comunes por variables de tema
│   └── js/
│       ├── sesion.js               # Token, guardia de sesión y peticiones autenticadas
│       ├── login.js                # Lógica de acceso y registro
│       └── inicio.js               # Lógica de la interfaz principal
├── postman/                        # Colección de pruebas
└── pruebas/pruebas.js              # Pruebas automatizadas
```

---

## 5. Instalación y ejecución

**Requisitos:** Node.js 18 o superior y npm.

```bash
npm install                 # instalar dependencias
cp .env.ejemplo .env        # Linux/macOS   (Windows: copy .env.ejemplo .env)
npm start                   # iniciar el servidor
npm run dev                 # modo desarrollo con nodemon
```

El sitio queda en **http://localhost:3000**.

### Motor de almacenamiento

| `MOTOR_DATOS` | Comportamiento |
|---|---|
| `archivo` (por defecto) | Guarda los usuarios en `datos/usuarios.json`. No requiere instalar MongoDB. |
| `mongo` | Usa MongoDB/Mongoose con la cadena definida en `MONGODB_URI`. |

```dotenv
MOTOR_DATOS=mongo
MONGODB_URI=mongodb+srv://usuario:clave@cluster0.xxxxx.mongodb.net/autenticacion?retryWrites=true&w=majority
```

Si se configura MongoDB y la conexión falla, el servicio continúa con el archivo JSON para no interrumpir las pruebas.

### Solución de problemas de conexión

| Mensaje en consola | Causa | Solución |
|---|---|---|
| `querySrv ECONNREFUSED` | El cliente DNS interno de Node (c-ares) tomó un servidor DNS inalcanzable. Ocurre aunque `nslookup` resuelva bien, porque usa el resolutor de Windows y Node no. | Definir `DNS_SERVIDORES=8.8.8.8,1.1.1.1` en el `.env`, o usar la cadena sin `+srv` de **Atlas → Connect → Drivers → versión 2.2.12 or later**. |
| `Could not connect to any servers... IP whitelist` | La IP del equipo no está autorizada en el cluster. | Atlas → **Network Access → Add IP Address**. |
| Los datos no aparecen en la base esperada | La cadena de conexión no incluye el nombre de la base. | Agregarlo antes del `?`: `...mongodb.net/autenticacion?...`. |

---

## 6. Seguridad aplicada

- Contraseñas cifradas con **bcrypt** (hash + salt); nunca se almacenan ni se devuelven en texto plano.
- Autenticación por **token JWT** firmado, con expiración configurable.
- Mensaje de error genérico en el login, sin revelar si falló el usuario o la contraseña.
- Validación de los datos de entrada antes del controlador.
- Credenciales fuera del repositorio mediante `.env` y `.gitignore`.

El token se guarda en `localStorage` del navegador, suficiente para el alcance del proyecto formativo. Para un despliegue en producción, lo recomendable es emitirlo en una cookie `httpOnly`, de modo que el JavaScript de la página no pueda leerlo.

---

## 7. Control de versiones

```bash
git init
git add .
git commit -m "Estructura inicial del proyecto"
git branch -M main
git remote add origin https://github.com/USUARIO/mibici-autenticacion.git
git push -u origin main
```

Para consultar el historial del proyecto: `git log --oneline --graph`.

---

## 8. Próximos pasos

Los seis módulos de la interfaz principal (rutas seguras, reporte de incidentes, recorridos, puntos de parqueo, comunidad y perfil) están publicados como tarjetas marcadas *En desarrollo*. Cada uno se implementará como una página propia dentro de `public/`, consumiendo sus endpoints bajo el mismo esquema de token ya establecido.
