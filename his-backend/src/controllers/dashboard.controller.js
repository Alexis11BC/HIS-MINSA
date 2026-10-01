// src/controllers/dashboard.controller.js
// Resumen del sistema para el panel principal.

const { getPool, resetPool } = require('../config/db');

const SUMMARY_QUERY = `
  SELECT
    (SELECT COUNT(*) FROM MaestroPaciente) AS pacientes,
    (SELECT COUNT(*) FROM NProduccion) AS atenciones,
    (SELECT COUNT(*) FROM MaestroPersonal) AS personal,
    (SELECT COUNT(*) FROM MAESTRO_HIS_PROFESION) AS profesiones,
    (SELECT COUNT(*) FROM MAESTRO_HIS_COLEGIO) AS colegios,
    (SELECT COUNT(*) FROM MAESTRO_HIS_CONDICION_CONTRATO) AS condicionesContrato,
    (SELECT COUNT(*) FROM V_SINADEF_AYACUCHO_DOMFALLECIDO) AS defunciones
`;

function isTransientConnectionError(err) {
  const code = err.code || err.originalError?.code;
  return ['ESOCKET', 'ECONNRESET', 'ETIMEDOUT', 'ETIMEOUT'].includes(code)
    || /connection lost|econnreset|failed to connect/i.test(err.message || '');
}

async function querySummary(retries = 1) {
  let pool;
  try {
    pool = await getPool();
    return await pool.request().query(SUMMARY_QUERY);
  } catch (err) {
    if (!retries || !isTransientConnectionError(err)) throw err;
    resetPool(pool);
    return querySummary(retries - 1);
  }
}

async function summary(_req, res) {
  try {
    const result = await querySummary();

    const row = result.recordset[0] || {};
    res.json({
      pacientes: Number(row.pacientes) || 0,
      atenciones: Number(row.atenciones) || 0,
      personal: Number(row.personal) || 0,
      profesiones: Number(row.profesiones) || 0,
      colegios: Number(row.colegios) || 0,
      condicionesContrato: Number(row.condicionesContrato) || 0,
      defunciones: Number(row.defunciones) || 0,
    });
  } catch (err) {
    console.error('❌ Error al obtener el resumen del dashboard:', err.message);
    res.status(503).json({ error: 'No se pudieron cargar los totales desde SQL Server.' });
  }
}

module.exports = { summary };
