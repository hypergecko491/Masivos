// server.js
// Servidor simple: solo sirve la herramienta como archivos estáticos.
// Sin login ni base de datos por ahora.

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
