# Envío de WhatsApp, SMS y Correo

Herramienta para enviar mensajes personalizados por WhatsApp, SMS (celular
y computadora), Correo y Gmail, cargando contactos desde Excel o pegándolos
manualmente. Por ahora corre como servidor simple, sin login.

## 1. Requisitos

- Node.js 18 o superior. Verifica con:
  ```
  node -v
  ```

## 2. Instalación local

```bash
npm install
npm start
```

Abre **http://localhost:3000** en tu navegador.

## 3. Cómo funciona el SMS en computadora

Google no ofrece una forma oficial de prellenar número y mensaje en
messages.google.com/web (a diferencia de WhatsApp). El botón "SMS" en
computadora copia el mensaje al portapapeles y abre Google Messages for
Web — solo falta abrir la conversación de esa persona y pegar (Ctrl+V).
En celular, sigue funcionando con todo prellenado automáticamente.

## 5. Estructura del proyecto
```
envio-mensajes/
  server.js       -> servidor Express (solo sirve los archivos)
  package.json
  public/
    app.html        -> la herramienta completa
    index.html        -> redirige a app.html
```
