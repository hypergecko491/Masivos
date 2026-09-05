// Servidor estático de la herramienta.
// Los contactos, mensajes y archivos Excel/CSV se procesan en el navegador.
const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "public");
app.disable("x-powered-by");
// Headers básicos de seguridad.
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});
// Archivos públicos.
app.use(
  express.static(publicDir, {
    extensions: ["html"],
    maxAge: process.env.NODE_ENV === "production" ? "1h" : 0,
  })
);
// Endpoint para comprobar que Render/servidor está funcionando.
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "mensajeria",
    timestamp: new Date().toISOString(),
  });
});
// Manejo básico de errores.
app.use((err, _req, res, _next) => {
  console.error("Error del servidor:", err);
  res.status(500).json({
    ok: false,
    error: "Error interno del servidor",
  });
});
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
