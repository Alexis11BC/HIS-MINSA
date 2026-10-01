// src/controllers/reportes.controller.js
// Controlador para GET /api/reportes/historial?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
// Usa la función dbo.Historial_hra(@fechaIncial, @FechaFinal) tal cual está definida en la BD.

const { sql, poolPromise } = require('../config/db');
const { esFechaISOValida } = require('../middleware/validate');

/**
 * GET /api/reportes/historial?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
 * Ejecuta la función de tabla dbo.Historial_hra y devuelve los resultados.
 */
async function historial(req, res, next) {
  try {
    const { desde, hasta } = req.query;

    if (!desde || !hasta) {
      return res.status(400).json({ error: 'Los parámetros "desde" y "hasta" son obligatorios.' });
    }

    if (!esFechaISOValida(desde)) {
      return res.status(400).json({ error: 'El parámetro "desde" no tiene formato de fecha válido (YYYY-MM-DD).' });
    }
    if (!esFechaISOValida(hasta)) {
      return res.status(400).json({ error: 'El parámetro "hasta" no tiene formato de fecha válido (YYYY-MM-DD).' });
    }

    const pool = await poolPromise;
    // NOTA: el parámetro se llama @fechaIncial (con typo), tal cual en la BD — no se corrige.
    const result = await pool.request()
      .input('fechaIncial', sql.Date, desde)
      .input('FechaFinal', sql.Date, hasta)
      .query('SELECT * FROM dbo.Historial_hra(@fechaIncial, @FechaFinal)');

    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
}

module.exports = { historial };
