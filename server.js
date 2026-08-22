// server.js
require("dotenv").config();

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = "sesion";
const ES_PRODUCCION = process.env.NODE_ENV === "production";

if (!JWT_SECRET) {
  console.error(
    "Falta JWT_SECRET en el archivo .env. Genera uno con:\n" +
    '  node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"\n' +
    "y ponlo en .env como JWT_SECRET=... antes de iniciar el servidor."
  );
  process.exit(1);
}

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ---------- Middleware de autenticación ----------
function requireAuth(req, res, next) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "No autenticado" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, username }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Sesión inválida o expirada" });
  }
}

// Límite simple de intentos de login por IP, para dificultar fuerza bruta
const intentosLogin = new Map(); // ip -> { count, resetAt }
function limitarIntentos(req, res, next) {
  const ip = req.ip;
  const ahora = Date.now();
  const registro = intentosLogin.get(ip);
  if (registro && ahora < registro.resetAt && registro.count >= 8) {
    return res.status(429).json({ error: "Demasiados intentos. Espera unos minutos." });
  }
  next();
}
function registrarIntentoFallido(ip) {
  const ahora = Date.now();
  const registro = intentosLogin.get(ip);
  if (!registro || ahora > registro.resetAt) {
    intentosLogin.set(ip, { count: 1, resetAt: ahora + 10 * 60 * 1000 });
  } else {
    registro.count++;
  }
}
function limpiarIntentos(ip) {
  intentosLogin.delete(ip);
}

// ---------- Login / logout / sesión ----------
app.post("/api/login", limitarIntentos, (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Usuario y contraseña requeridos" });
  }

  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    registrarIntentoFallido(req.ip);
    return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
  }

  limpiarIntentos(req.ip);

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "12h" });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: ES_PRODUCCION, // en producción con HTTPS, la cookie solo viaja cifrada
    sameSite: "lax",
    maxAge: 12 * 60 * 60 * 1000
  });
  res.json({ ok: true, username: user.username });
});

app.post("/api/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true });
});

app.get("/api/session", requireAuth, (req, res) => {
  res.json({ username: req.user.username });
});

// ---------- Historial ----------
// Registrar un envío (lo llama el frontend cada vez que se usa un botón de envío)
app.post("/api/history", requireAuth, (req, res) => {
  const { contact_name, contact_destino, canal } = req.body || {};
  const canalesValidos = ["whatsapp", "sms", "correo", "gmail"];

  if (!contact_name || !contact_destino || !canalesValidos.includes(canal)) {
    return res.status(400).json({ error: "Datos incompletos o canal inválido" });
  }

  db.prepare(
    "INSERT INTO history (user_id, username, contact_name, contact_destino, canal) VALUES (?, ?, ?, ?, ?)"
  ).run(req.user.id, req.user.username, contact_name, contact_destino, canal);

  res.json({ ok: true });
});

// Consultar historial, con filtros opcionales
app.get("/api/history", requireAuth, (req, res) => {
  const { canal, desde, hasta, q } = req.query;

  let sql = "SELECT id, username, contact_name, contact_destino, canal, enviado_at FROM history WHERE 1=1";
  const params = [];

  if (canal) {
    sql += " AND canal = ?";
    params.push(canal);
  }
  if (desde) {
    sql += " AND enviado_at >= ?";
    params.push(desde);
  }
  if (hasta) {
    sql += " AND enviado_at <= ?";
    params.push(hasta);
  }
  if (q) {
    sql += " AND (contact_name LIKE ? OR contact_destino LIKE ?)";
    params.push(`%${q}%`, `%${q}%`);
  }

  sql += " ORDER BY enviado_at DESC LIMIT 500";

  const filas = db.prepare(sql).all(...params);
  res.json({ historial: filas });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
