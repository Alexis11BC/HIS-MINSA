function numberFromEnv(name, fallback) {
  const value = Number.parseInt(process.env[name], 10);
  return Number.isFinite(value) ? value : fallback;
}

function booleanFromEnv(name, fallback = false) {
  if (process.env[name] === undefined) return fallback;
  return process.env[name].toLowerCase() === 'true';
}

const env = {
  port: numberFromEnv('PORT', 3000),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  database: {
    server: process.env.DB_SERVER || 'localhost',
    port: numberFromEnv('DB_PORT', 1433),
    name: process.env.DB_DATABASE || 'BDHIS_HRA',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    encrypt: booleanFromEnv('DB_ENCRYPT'),
    trustServerCertificate: booleanFromEnv('DB_TRUST_SERVER_CERTIFICATE'),
  },
};

module.exports = env;
