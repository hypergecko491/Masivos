// db.js
// Crea (si no existe) el archivo data.db con las tablas de usuarios e historial.
// SQLite guarda todo en un solo archivo junto al servidor: no necesitas contratar
// una base de datos aparte para empezar.

const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "data.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_destino TEXT NOT NULL,
    canal TEXT NOT NULL,
    enviado_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_history_fecha ON history(enviado_at);
  CREATE INDEX IF NOT EXISTS idx_history_usuario ON history(username);
`);

module.exports = db;
