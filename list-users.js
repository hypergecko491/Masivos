// list-users.js
// Muestra los usuarios registrados (sin la contraseña, solo el hash no sirve
// de nada mostrarlo). Úsalo desde la terminal local o desde el "Shell" de Render.
//
// Uso:
//   npm run users

const db = require("./db");

const usuarios = db.prepare("SELECT id, username, created_at FROM users ORDER BY created_at ASC").all();

if (usuarios.length === 0) {
  console.log("No hay usuarios registrados todavía. Usa: npm run seed");
} else {
  console.log(`\n${usuarios.length} usuario(s) registrado(s):\n`);
  usuarios.forEach(u => {
    console.log(`  #${u.id}  ${u.username}  (creado: ${u.created_at})`);
  });
  console.log("");
}
