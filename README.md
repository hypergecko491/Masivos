# Envío de WhatsApp, SMS y Correo

Herramienta de preparación y gestión manual de mensajes personalizados para WhatsApp, SMS, Outlook y Gmail, cargando contactos desde Excel/CSV o pegándolos manualmente.

## Cambios principales

- Estados reales por contacto: **Pendiente → Abierto → Enviado**, además de **Error**.
- La aplicación ya no marca un contacto como enviado solamente por abrir WhatsApp, SMS, Outlook o Gmail.
- Búsqueda y filtros por estado.
- Guardado de progreso opcional en el navegador.
- Exportación de reporte Excel con estado, canal y fechas.
- Detección de encabezados comunes en Excel/CSV.
- Validación visible de teléfonos y correos.
- Variantes de mensaje distribuidas de forma equilibrada.
- Servidor Express con headers básicos de seguridad y endpoint `/health`.

## Instalación local

```bash
npm install
npm start
```

Abre `http://localhost:3000/app.html`.

## Nota de privacidad

Los contactos se procesan en el navegador y no se envían al servidor de esta aplicación. La opción de guardar progreso es voluntaria y utiliza `localStorage` del navegador.

La librería SheetJS utilizada para leer/escribir Excel se carga desde CDN.
