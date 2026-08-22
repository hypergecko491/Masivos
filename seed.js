// seed.js
// Crea un nuevo usuario desde la terminal. Úsalo la primera vez para tener
// con qué entrar, y después cada vez que necesites dar de alta a alguien más.
//
// Uso:
//   npm run seed

const readline = require("readline");
const bcrypt = require("bcryptjs");
const db = require("./db");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(pregunta) {
  return new Promise((resolve) => rl.question(pregunta, resolve));
}

// Lee la contraseña sin mostrarla en la terminal
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
  console.log("=== Crear nuevo usuario ===");
  const username = (await ask("Usuario: ")).trim();
  if (!username) {
    console.log("El usuario no puede estar vacío.");
    process.exit(1);
  }

  const existente = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
  if (existente) {
    console.log(`Ya existe un usuario "${username}".`);
    process.exit(1);
  }

  const password = await askPassword("Contraseña: ");
  if (password.length < 8) {
    console.log("La contraseña debe tener al menos 8 caracteres.");
    process.exit(1);
  }

  const hash = bcrypt.hashSync(password, 12);
  db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)").run(username, hash);

  console.log(`Usuario "${username}" creado correctamente.`);
  rl.close();
  process.exit(0);
})();
