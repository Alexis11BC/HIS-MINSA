// server.js
// Punto de entrada — carga variables de entorno y arranca el servidor Express.

require('dotenv').config();

const app = require('./src/app');
const env = require('./src/config/env');

app.listen(env.port, () => {
  console.log(`
  ╔═══════════════════════════════════════════════╗
  ║   🏥  HIS — Gestión Hospitalaria  API REST   ║
  ║   Servidor corriendo en http://localhost:${env.port}  ║
  ╚═══════════════════════════════════════════════╝
  `);
});
