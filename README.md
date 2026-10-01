# Servicio web de registro e inicio de sesión

**Evidencia GA7-220501096-AA5-EV01 — Diseño y desarrollo de servicios web (caso)**

| Dato | Detalle |
|---|---|
| Aprendiz | Aldemar García Rodríguez |
| Programa | Tecnología en Análisis y Desarrollo de Software (ADSO) — SENA |
| Componente | Construcción API |
| Tecnologías | Node.js, Express, MongoDB/Mongoose, JWT, bcrypt |

---

## 1. Descripción del caso

Se desarrolla un servicio web (API REST) que expone dos operaciones principales:

- **Registro**: crea una cuenta con un nombre de usuario y una contraseña. La contraseña se almacena cifrada con `bcrypt`, nunca en texto plano.
- **Inicio de sesión**: recibe un usuario y una contraseña. Si la autenticación es correcta devuelve el mensaje **"Autenticación satisfactoria"** junto con un token JWT; en caso contrario devuelve **"Error en la autenticación"**.

Adicionalmente se incluyen dos rutas protegidas (`/api/perfil` y `/api/usuarios`) que demuestran el uso del token emitido en el inicio de sesión.

---

## 2. Estructura del proyecto

```
servicio-autenticacion/
├── app.js                          # Archivo principal: servidor Express y middlewares
├── package.json                    # Dependencias y scripts del proyecto
├── .env.ejemplo                    # Plantilla de variables de entorno
├── .gitignore                      # Archivos excluidos del versionamiento
├── config/
│   ├── configuracion.js            # Parámetros centralizados (puerto, JWT, motor de datos)
│   └── baseDatos.js                # Conexión a MongoDB con Mongoose
├── models/
│   └── Usuario.js                  # Esquema/modelo del usuario
├── repositorios/
│   ├── usuarioRepositorio.js       # Selector del motor de almacenamiento
│   ├── repositorioMongo.js         # Acceso a datos con MongoDB
│   └── repositorioArchivo.js       # Acceso a datos con archivo JSON local
├── controllers/
│   └── autenticacionControlador.js # Lógica de registro, login y rutas protegidas
├── routes/
│   └── autenticacionRutas.js       # Direccionamiento (rutas) del servicio
├── middlewares/
│   ├── validarDatos.js             # Validación de usuario y contraseña
│   ├── verificarToken.js           # Verificación del token JWT
│   └── manejadorErrores.js         # Rutas inexistentes (404) y errores (500)
├── public/
│   └── index.html                  # Cliente web de prueba
├── postman/
│   └── AA5-EV01_Servicio_Autenticacion.postman_collection.json
└── pruebas/
    └── pruebas.js                  # Pruebas automatizadas de los 8 casos
```

---

## 3. Instalación y ejecución

**Requisitos:** Node.js 18 o superior y npm.

```bash
# 1. Instalar las dependencias
npm install

# 2. Crear el archivo de configuración a partir de la plantilla
copy .env.ejemplo .env      # Windows
cp .env.ejemplo .env        # Linux / macOS

# 3. Iniciar el servidor
npm start                   # modo normal
npm run dev                 # modo desarrollo con nodemon
```

El servicio queda disponible en **http://localhost:3000**. Al abrir esa dirección en el navegador se carga el cliente de prueba con los formularios de registro e inicio de sesión.

### Motor de almacenamiento

El proyecto funciona con dos motores, seleccionables desde el archivo `.env`:

| `MOTOR_DATOS` | Comportamiento |
|---|---|
| `archivo` (por defecto) | Guarda los usuarios en `datos/usuarios.json`. No requiere instalar MongoDB. |
| `mongo` | Usa MongoDB/Mongoose con la cadena definida en `MONGODB_URI` (MongoDB Atlas o instalación local). |

Para usar MongoDB Atlas, en `.env`:

```
MOTOR_DATOS=mongo
MONGODB_URI=mongodb+srv://aldemargaro_db_user:f9G2NNzN9Q3fSDfg@cluster0.wwcrzaw.mongodb.net/?appName=Cluster0
```

Si se configura MongoDB y la conexión falla, el servicio continúa operando con el archivo JSON para no interrumpir las pruebas.

---

## 4. Rutas del servicio web

| Método | Ruta | Descripción | Token |
|---|---|---|---|
| GET | `/api` | Estado del servicio y listado de rutas | No |
| POST | `/api/registro` | Registro de un nuevo usuario | No |
| POST | `/api/login` | Inicio de sesión | No |
| GET | `/api/perfil` | Recurso protegido de ejemplo | Sí |
| GET | `/api/usuarios` | Lista de usuarios registrados | Sí |

### POST `/api/registro`

Petición:

```json
{ "usuario": "aldemar", "correo": "aldemar@ejemplo.com", "contrasena": "Sena2026*" }
```

Respuesta `201 Created`:

```json
{
  "exito": true,
  "mensaje": "Usuario registrado satisfactoriamente.",
  "datos": { "id": "...", "usuario": "aldemar", "correo": "aldemar@ejemplo.com" }
}
```

### POST `/api/login`

Petición:

```json
{ "usuario": "aldemar", "contrasena": "Sena2026*" }
```

Autenticación correcta — `200 OK`:

```json
{
  "exito": true,
  "mensaje": "Autenticacion satisfactoria. Bienvenido aldemar.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Autenticación incorrecta — `401 Unauthorized`:

```json
{
  "exito": false,
  "mensaje": "Error en la autenticacion: usuario o contrasena incorrectos."
}
```

### Códigos de respuesta utilizados

| Código | Significado en el servicio |
|---|---|
| 200 | Operación correcta / autenticación satisfactoria |
| 201 | Usuario creado |
| 400 | Datos enviados inválidos |
| 401 | Error en la autenticación o token ausente/inválido |
| 404 | Ruta inexistente |
| 409 | El usuario ya está registrado |
| 500 | Error interno del servidor |

---

## 5. Pruebas

### Pruebas automatizadas

```bash
npm test
```

Resultado esperado: **8 pruebas superadas, 0 fallidas** (registro, registro duplicado, validación de datos, login correcto, login con contraseña incorrecta, login de usuario inexistente, ruta protegida sin token y con token).

### Pruebas con Postman

1. Abrir Postman → **Import** → seleccionar `postman/AA5-EV01_Servicio_Autenticacion.postman_collection.json`.
2. Ejecutar las peticiones en orden. La petición *2. Login correcto* guarda automáticamente el token en la variable `{{token}}` que usan las rutas protegidas.

### Prueba desde el navegador

Abrir `http://localhost:3000`, registrar un usuario y luego iniciar sesión; la respuesta JSON del servicio se muestra en pantalla.

---

## 6. Seguridad aplicada

- Contraseñas cifradas con **bcrypt** (hash + salt); no se almacenan ni se devuelven en texto plano.
- Autenticación por **token JWT** firmado, con tiempo de expiración configurable.
- Mensaje de error genérico en el login, sin revelar si falló el usuario o la contraseña.
- Validación de los datos de entrada antes de llegar al controlador.
- Datos sensibles fuera del repositorio mediante `.env` y `.gitignore`.

---

## 7. Control de versiones

El proyecto se administra con **Git**. Comandos utilizados para publicarlo:

```bash
git init
git add .
git commit -m "Estructura inicial del proyecto"
git branch -M main
git remote add origin https://github.com/Arjona10/servicio-autenticacion-aa5.git
git push -u origin main
```

El enlace del repositorio se encuentra en el archivo `Enlace_repositorio.txt` de la carpeta de entrega.
