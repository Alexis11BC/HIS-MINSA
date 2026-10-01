// src/controllers/catalogos.controller.js
// Controlador para GET /api/catalogos/:tabla?q=...
// Valida el nombre de tabla contra whitelist para evitar SQL injection en identificadores.

const { sql, poolPromise } = require('../config/db');
const { esTablaValida } = require('../utils/sqlIdentifierWhitelist');

/**
 * GET /api/catalogos/:tabla?q=...
 * Devuelve los registros de una tabla catálogo, opcionalmente filtrados por q.
 */
async function listar(req, res, next) {
  try {
    const tabla = req.params.tabla;

    // Validar contra whitelist
    if (!esTablaValida(tabla)) {
      return res.status(400).json({ error: `La tabla "${tabla}" no es válida o no está permitida.` });
    }

    const q = (req.query.q || '').trim();
    const pool = await poolPromise;

    if (!q) {
      // Sin filtro: devolver todos los registros (TOP 500 como seguridad)
      const result = await pool.request()
        .query(`SELECT TOP 500 * FROM [${tabla}]`);
      return res.json(result.recordset);
    }

    // Con filtro: buscar en todas las columnas de texto de la tabla
    // Para esto, primero obtenemos las columnas de la tabla
    const colsResult = await pool.request()
      .input('tabla', sql.NVarChar(128), tabla)
      .query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = @tabla
          AND DATA_TYPE IN ('varchar','nvarchar','char','nchar','text','ntext')
      `);

    const columnas = colsResult.recordset.map(r => r.COLUMN_NAME);

    if (!columnas.length) {
      // No hay columnas de texto; devolver todo
      const result = await pool.request()
        .query(`SELECT TOP 500 * FROM [${tabla}]`);
      return res.json(result.recordset);
    }

    // Construir WHERE dinámico sobre columnas de texto
    const request = pool.request().input('q', sql.NVarChar, `%${q}%`);
    const conditions = columnas.map(c => `[${c}] LIKE @q`).join(' OR ');

    const result = await request.query(`
      SELECT TOP 500 * FROM [${tabla}] WHERE ${conditions}
    `);

    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
}

module.exports = { listar };
