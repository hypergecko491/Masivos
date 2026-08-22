// reset-password.js
// Cambia la contraseña de un usuario existente (por si la olvidó o quieres
// rotarla). Reusa el mismo lector de contraseña oculta que seed.js.
//
// Uso:
//   npm run reset-password

const readline = require("readline");
const bcrypt = require("bcryptjs");
const db = require("./db");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function ask(pregunta) {
  return new Promise((resolve) => rl.question(pregunta, resolve));
}
function askPassword(pregunta) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    process.stdout.write(pregunta);
    let password = "";
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const onData = (char) => {
      char = char.toString();
      if (char === "\n" || char === "\r" || char === "\u0004") {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener("data", onData);
        process.stdout.write("\n");
        resolve(password);
      } else if (char === "\u0003") {
        process.exit(1);
      } else if (char === "\u007f") {
        password = password.slice(0, -1);
      } else {
        password += char;
      }
    };
    stdin.on("data", onData);
  });
}

(async () => {
  const username = (await ask("Usuario al que le cambiarás la contraseña: ")).trim();
  const user = db.prepare("SELECT id FROM users WHERE username = ?").get(username);

  if (!user) {
    console.log(`No existe un usuario "${username}".`);
    rl.close();
    process.exit(1);
  }

  const password = await askPassword("Nueva contraseña (mínimo 8 caracteres): ");
  if (password.length < 8) {
    console.log("La contraseña debe tener al menos 8 caracteres. No se hizo ningún cambio.");
    rl.close();
    process.exit(1);
  }

  const hash = bcrypt.hashSync(password, 12);
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hash, user.id);

  console.log(`Contraseña de "${username}" actualizada correctamente.`);
  rl.close();
  process.exit(0);
})();
