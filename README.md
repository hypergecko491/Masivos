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

## 4. Cómo funciona el historial

Cada vez que alguien usa un botón de envío (WhatsApp, SMS, Correo o
Gmail), el navegador manda al servidor: nombre del contacto, el número o
correo de destino, el canal usado, y la fecha/hora automática. Eso se
guarda en la tabla `history` de `data.db`. El contenido del mensaje y el
archivo Excel **no** se guardan en el servidor — solo se procesan en el
navegador de quien los sube.

## 5. Respaldo de la base de datos

Todo vive en el archivo `data.db`, junto al servidor. Cópialo de vez en
cuando a otro lugar si quieres tener respaldo del historial y los
usuarios.

## 6. Estructura del proyecto

```
envio-mensajes/
  server.js        -> servidor Express (login, historial)
  db.js             -> conexión y esquema de la base de datos
  seed.js           -> script para crear usuarios desde la terminal
  package.json
  .env.example       -> plantilla de variables de entorno
  public/
    login.html       -> pantalla de inicio de sesión
    app.html          -> la herramienta de envío (requiere sesión activa)
    index.html         -> redirige a app.html
```
