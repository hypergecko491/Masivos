// delete-user.js
// Elimina un usuario por su nombre de usuario. Su historial de envíos
// pasados NO se borra (queda con ese nombre de usuario como registro),
// solo deja de poder iniciar sesión.
//
// Uso:
//   npm run delete-user

const readline = require("readline");
const db = require("./db");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function ask(pregunta) {
  return new Promise((resolve) => rl.question(pregunta, resolve));
}

(async () => {
  const username = (await ask("Usuario a eliminar: ")).trim();
  const user = db.prepare("SELECT id FROM users WHERE username = ?").get(username);

  if (!user) {
    console.log(`No existe un usuario "${username}".`);
    rl.close();
    process.exit(1);
  }

  const confirmacion = (await ask(`¿Seguro que quieres eliminar a "${username}"? Escribe "si" para confirmar: `)).trim().toLowerCase();
  if (confirmacion !== "si") {
    console.log("Cancelado, no se eliminó nada.");
    rl.close();
    process.exit(0);
  }

  db.prepare("DELETE FROM users WHERE id = ?").run(user.id);
  console.log(`Usuario "${username}" eliminado. Ya no podrá iniciar sesión.`);
  rl.close();
  process.exit(0);
})();
