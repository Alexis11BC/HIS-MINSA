// src/controllers/busqueda.controller.js
// Controlador para el buscador universal — GET /api/busqueda?q=...&tipo=todo|paciente|personal|atencion|defuncion

const { sql, poolPromise } = require('../config/db');

async function buscar(req, res, next) {
  try {
    const q = (req.query.q || '').trim();
    const tipo = req.query.tipo || 'todo';
    if (!q) return res.status(400).json({ error: 'El parámetro q es obligatorio.' });

    const pool = await poolPromise;
    const resultados = {};

    // Búsqueda en pacientes
    if (tipo === 'todo' || tipo === 'paciente') {
      const r = await pool.request()
        .input('q', sql.VarChar, `%${q}%`)
        .query(`
          SELECT TOP 10 *
          FROM MaestroPaciente
          WHERE Id_Paciente LIKE @q
             OR Numero_Documento_Paciente LIKE @q
             OR Apellido_Paterno_Paciente LIKE @q
             OR Apellido_Materno_Paciente LIKE @q
             OR Nombres_Paciente LIKE @q
             OR Historia_Clinica LIKE @q
        `);
      resultados.pacientes = r.recordset;
    }

    // Búsqueda en personal
    if (tipo === 'todo' || tipo === 'personal') {
      const r = await pool.request()
        .input('q', sql.VarChar, `%${q}%`)
        .query(`
          SELECT TOP 10 *
          FROM MaestroPersonal
          WHERE Id_Personal LIKE @q
             OR Numero_Documento_Personal LIKE @q
             OR Apellido_Paterno_Personal LIKE @q
             OR Apellido_Materno_Personal LIKE @q
             OR Nombres_Personal LIKE @q
        `);
      resultados.personal = r.recordset;
    }

    // Búsqueda en atenciones
    if (tipo === 'todo' || tipo === 'atencion') {
      const r = await pool.request()
        .input('q', sql.VarChar, `%${q}%`)
        .query(`
          SELECT TOP 10 *
          FROM NProduccion
          WHERE Id_Cita LIKE @q
             OR Id_Paciente LIKE @q
             OR Id_Personal LIKE @q
             OR Codigo_Item LIKE @q
        `);
      resultados.atenciones = r.recordset;
    }

    // Búsqueda en defunciones
    if (tipo === 'todo' || tipo === 'defuncion') {
      const r = await pool.request()
        .input('q', sql.NVarChar, `%${q}%`)
        .query(`
          SELECT TOP 10 *
          FROM V_SINADEF_AYACUCHO_DOMFALLECIDO
          WHERE DOCUMENTO LIKE @q
             OR N LIKE @q
             OR CDEF LIKE @q
             OR PRIMER_APELLIDO LIKE @q
             OR SEGUNDO_APELLIDO LIKE @q
             OR NOMBRES LIKE @q
        `);
      resultados.defunciones = r.recordset;
    }

    res.json(resultados);
  } catch (err) {
    next(err);
  }
}

module.exports = { buscar };
