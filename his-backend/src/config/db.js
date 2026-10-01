// src/config/db.js
// Pool de conexión único y reutilizable para SQL Server (mssql / tedious)
// Lee credenciales desde variables de entorno (.env)

const sql = require('mssql');
const env = require('./env');

const config = {
  server:   env.database.server,
  port:     env.database.port,
  database: env.database.name,
  user:     env.database.user,
  password: env.database.password,
  options: {
    encrypt: env.database.encrypt,
    trustServerCertificate: env.database.trustServerCertificate,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool = null;
let connectionAttempt = null;

function resetPool(disconnectedPool = pool) {
  if (disconnectedPool !== pool) return;
  pool = null;
  if (disconnectedPool) disconnectedPool.close().catch(() => {});
}

async function getPool() {
  if (pool && pool.connected) {
    return pool;
  }
  if (connectionAttempt) {
    return connectionAttempt;
  }

  if (pool) resetPool(pool);

  const nextPool = new sql.ConnectionPool(config);
  connectionAttempt = nextPool.connect()
    .then((connectedPool) => {
      pool = connectedPool;
      connectedPool.on('error', () => {
        resetPool(connectedPool);
      });
      connectedPool.on('close', () => {
        resetPool(connectedPool);
      });
      console.log('✅ Conectado a SQL Server —', config.database);
      return connectedPool;
    })
    .catch((err) => {
      nextPool.close().catch(() => {});
      console.error('❌ Error al conectar con SQL Server:', err.message);
      throw err;
    })
    .finally(() => {
      connectionAttempt = null;
    });

  return connectionAttempt;
}

// Intentar conexión inicial sin tumbar el proceso si falla
getPool().catch(() => {
  console.log('⚠️ La API seguirá corriendo en localhost. Revisa credenciales o estado de SQL Server si las consultas fallan.');
});

// `poolPromise` se exporta como thenable para compatibilidad con `await poolPromise` en los controladores
const poolPromise = {
  then(onFulfilled, onRejected) {
    return getPool().then(onFulfilled, onRejected);
  },
  catch(onRejected) {
    return getPool().catch(onRejected);
  }
};

module.exports = { sql, poolPromise, getPool, resetPool };

