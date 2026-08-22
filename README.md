# Envío de WhatsApp, SMS y Correo — con login e historial

Backend en Node.js + Express con base de datos SQLite (un solo archivo,
`data.db`, que se crea solo). Login con usuarios reales y contraseñas
encriptadas, e historial de quién fue contactado, cuándo y por qué canal.

## 1. Requisitos

- Node.js 18 o superior instalado. Verifica con:
  ```
  node -v
  ```
  Si no lo tienes, descárgalo de https://nodejs.org (versión LTS).

## 2. Instalación local (para probarlo en tu computadora)

```bash
cd envio-mensajes
npm install
```

Copia el archivo de variables de entorno y genera tu clave secreta:

```bash
cp .env.example .env
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Copia el texto largo que te imprime y pégalo en `.env`, en la línea:
```
JWT_SECRET=pega_aqui_el_texto_largo
```

Crea tu primer usuario:

```bash
npm run seed
```
Te pedirá un nombre de usuario y una contraseña (mínimo 8 caracteres).
Puedes correr `npm run seed` las veces que quieras para dar de alta a más
personas.

Para ver qué usuarios están registrados (sin mostrar contraseñas):

```bash
npm run users
```

Para cambiar la contraseña de alguien (si la olvidó o quieres rotarla):

```bash
npm run reset-password
```

Para quitarle el acceso a alguien:

```bash
npm run delete-user
```
Su historial de envíos pasados no se borra, solo deja de poder iniciar
sesión.

Inicia el servidor:

```bash
npm start
```

Abre tu navegador en **http://localhost:3000** — te pedirá iniciar sesión
y luego verás la herramienta de envío normal, con un botón "Ver historial"
arriba.

## 3. Ponerlo en línea (para que no dependa de tu computadora)

Esto ya no es solo un archivo HTML — es un servidor, así que necesita un
lugar donde correr todo el tiempo. Opciones sencillas y con capa gratuita
para un uso pequeño como este:

- **Render** (render.com) — "New Web Service", conecta este proyecto,
  comando de build `npm install`, comando de arranque `npm start`. En la
  sección de variables de entorno, agrega `JWT_SECRET` y `NODE_ENV=production`.
- **Railway** (railway.app) — proceso muy similar a Render.

En ambos, después de desplegarlo una vez necesitas correr `npm run seed`
para crear tu primer usuario. Los dos servicios permiten abrir una
"consola" o "shell" del proyecto ya desplegado para ejecutar ese comando;
si no encuentras esa opción, dímelo y te explico la alternativa para ese
proveedor en particular.

**Importante:** activa `NODE_ENV=production` en el servidor donde lo
despliegues — así la cookie de sesión solo viaja por HTTPS, que es lo que
esos servicios ya te dan por defecto.

## 4. Gestionar usuarios sin usar el Shell de Render (plan gratuito)

El "Shell" de Render (una terminal conectada al servidor) es solo para
planes de pago. Como alternativa, el servidor tiene rutas protegidas por
una clave secreta aparte (`ADMIN_KEY`) que puedes llamar desde tu propia
computadora, con `curl` (ya viene incluido en Windows 10/11).

**Primero:** genera una clave y agrégala en Render, en Environment
Variables, como `ADMIN_KEY`:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
Usa una clave **distinta** a la de `JWT_SECRET`. Guárdala en algún lugar
seguro — cualquiera que la tenga puede crear/eliminar usuarios.

**Crear un usuario** (desde CMD o PowerShell, reemplaza la URL y los datos):
```bash
curl -X POST https://tu-app.onrender.com/api/admin/users ^
  -H "Content-Type: application/json" ^
  -H "X-Admin-Key: TU_ADMIN_KEY" ^
  -d "{\"username\":\"nuevo_usuario\",\"password\":\"contraseña_segura\"}"
```
(El `^` es para partir el comando en varias líneas en CMD de Windows; si
lo pegas todo en una sola línea, quítalos.)

**Ver todos los usuarios:**
```bash
curl https://tu-app.onrender.com/api/admin/users -H "X-Admin-Key: TU_ADMIN_KEY"
```

**Cambiar la contraseña de alguien:**
```bash
curl -X PUT https://tu-app.onrender.com/api/admin/users/nombre_usuario/password ^
  -H "Content-Type: application/json" ^
  -H "X-Admin-Key: TU_ADMIN_KEY" ^
  -d "{\"password\":\"nueva_contraseña\"}"
```

**Eliminar a alguien:**
```bash
curl -X DELETE https://tu-app.onrender.com/api/admin/users/nombre_usuario ^
  -H "X-Admin-Key: TU_ADMIN_KEY"
```

Si prefieres no usar la terminal, cualquier app tipo Postman o Insomnia
también sirve — solo arma la misma petición con el header `X-Admin-Key`.

## 5. Cómo funciona el historial

Cada vez que alguien usa un botón de envío (WhatsApp, SMS, Correo o
Gmail), el navegador manda al servidor: nombre del contacto, el número o
correo de destino, el canal usado, y la fecha/hora automática. Eso se
guarda en la tabla `history` de `data.db`. El contenido del mensaje y el
archivo Excel **no** se guardan en el servidor — solo se procesan en el
navegador de quien los sube.

## 6. Respaldo de la base de datos

Todo vive en el archivo `data.db`, junto al servidor. Cópialo de vez en
cuando a otro lugar si quieres tener respaldo del historial y los
usuarios.

## 7. Estructura del proyecto

```
envio-mensajes/
  server.js         -> servidor Express (login, historial, admin de usuarios)
  db.js              -> conexión y esquema de la base de datos
  seed.js            -> crear usuarios desde la terminal (local)
  list-users.js       -> ver usuarios desde la terminal (local)
  reset-password.js    -> cambiar contraseñas desde la terminal (local)
  delete-user.js         -> eliminar usuarios desde la terminal (local)
  package.json
  .env.example              -> plantilla de variables de entorno
  public/
    login.html       -> pantalla de inicio de sesión
    app.html          -> la herramienta de envío (requiere sesión activa)
    index.html         -> redirige a app.html
```
