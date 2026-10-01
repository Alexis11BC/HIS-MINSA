// src/controllers/personal.controller.js
// Controlador para operaciones CRUD sobre MaestroPersonal

const { sql, poolPromise } = require('../config/db');
const { validarLongitudes } = require('../middleware/validate');

/**
 * GET /api/personal?q=...&modo=todo|id|documento|nombre
 * Busca personal según el modo indicado.
 */
async function buscar(req, res, next) {
  try {
    const q = (req.query.q || '').trim();
    const modo = req.query.modo || 'todo';
    if (!q) return res.status(400).json({ error: 'El parámetro q es obligatorio.' });

    const pool = await poolPromise;
    const request = pool.request().input('q', sql.VarChar, `%${q}%`);

    let where = '';
    switch (modo) {
      case 'id':
        where = 'Id_Personal LIKE @q';
        break;
      case 'documento':
        where = 'Numero_Documento_Personal LIKE @q';
        break;
      case 'nombre':
        where = `(Apellido_Paterno_Personal LIKE @q
                  OR Apellido_Materno_Personal LIKE @q
                  OR Nombres_Personal LIKE @q)`;
        break;
      default: // 'todo'
        where = `(Id_Personal LIKE @q
                  OR Numero_Documento_Personal LIKE @q
                  OR Apellido_Paterno_Personal LIKE @q
                  OR Apellido_Materno_Personal LIKE @q
                  OR Nombres_Personal LIKE @q)`;
    }

    const result = await request.query(`
      SELECT TOP 100 p.*,
             prof.Descripcion_Profesion AS Profesion,
             col.Descripcion_Colegio    AS Colegio,
             cond.Descripcion_Condicion AS Condicion,
             est.Nombre_Establecimiento AS Establecimiento
      FROM MaestroPersonal p
      LEFT JOIN MAESTRO_HIS_PROFESION         prof ON p.Id_Profesion = prof.Id_Profesion
      LEFT JOIN MAESTRO_HIS_COLEGIO           col  ON p.Id_Colegio   = col.Id_Colegio
      LEFT JOIN MAESTRO_HIS_CONDICION_CONTRATO cond ON p.Id_Condicion = cond.Id_Condicion
      LEFT JOIN MAESTRO_HIS_ESTABLECIMIENTO   est  ON p.Id_Establecimiento = est.Id_Establecimiento
      WHERE ${where}
    `);

    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/personal/:id
 * Obtiene un miembro del personal por su Id_Personal.
 */
async function obtenerPorId(req, res, next) {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.VarChar(50), req.params.id)
      .query(`
        SELECT p.*,
               prof.Descripcion_Profesion AS Profesion,
               col.Descripcion_Colegio    AS Colegio,
               cond.Descripcion_Condicion AS Condicion,
               est.Nombre_Establecimiento AS Establecimiento
        FROM MaestroPersonal p
        LEFT JOIN MAESTRO_HIS_PROFESION         prof ON p.Id_Profesion = prof.Id_Profesion
        LEFT JOIN MAESTRO_HIS_COLEGIO           col  ON p.Id_Colegio   = col.Id_Colegio
        LEFT JOIN MAESTRO_HIS_CONDICION_CONTRATO cond ON p.Id_Condicion = cond.Id_Condicion
        LEFT JOIN MAESTRO_HIS_ESTABLECIMIENTO   est  ON p.Id_Establecimiento = est.Id_Establecimiento
        WHERE p.Id_Personal = @id
      `);

    if (!result.recordset.length) {
      return res.status(404).json({ error: 'Personal no encontrado.' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/personal
 * Inserta un nuevo registro en MaestroPersonal.
 */
async function crear(req, res, next) {
  try {
    const body = req.body;

    const { valido, errores } = validarLongitudes('MaestroPersonal', body);
    if (!valido) return res.status(400).json({ error: errores.join(' ') });

    const pool = await poolPromise;
    const request = pool.request();

    request.input('Id_Personal',               sql.VarChar(50),   body.Id_Personal || null);
    request.input('Id_Tipo_Documento_Personal', sql.Int,           body.Id_Tipo_Documento_Personal || null);
    request.input('Numero_Documento_Personal',  sql.VarChar(15),   body.Numero_Documento_Personal || null);
    request.input('Apellido_Paterno_Personal',  sql.VarChar(50),   body.Apellido_Paterno_Personal || null);
    request.input('Apellido_Materno_Personal',  sql.VarChar(50),   body.Apellido_Materno_Personal || null);
    request.input('Nombres_Personal',           sql.VarChar(150),  body.Nombres_Personal || null);
    request.input('Fecha_Nacimiento_Personal',  sql.Date,          body.Fecha_Nacimiento_Personal || null);
    request.input('Id_Condicion',               sql.VarChar(2),    body.Id_Condicion || null);
    request.input('Id_Profesion',               sql.VarChar(2),    body.Id_Profesion || null);
    request.input('Id_Colegio',                 sql.VarChar(2),    body.Id_Colegio || null);
    request.input('Numero_Colegiatura',         sql.VarChar(20),   body.Numero_Colegiatura || null);
    request.input('Id_Establecimiento',         sql.Int,           body.Id_Establecimiento || null);
    request.input('Fecha_Alta',                 sql.DateTime,      body.Fecha_Alta || null);
    request.input('Fecha_Baja',                 sql.DateTime,      body.Fecha_Baja || null);

    await request.query(`
      INSERT INTO MaestroPersonal (
        Id_Personal, Id_Tipo_Documento_Personal, Numero_Documento_Personal,
        Apellido_Paterno_Personal, Apellido_Materno_Personal, Nombres_Personal,
        Fecha_Nacimiento_Personal, Id_Condicion, Id_Profesion, Id_Colegio,
        Numero_Colegiatura, Id_Establecimiento, Fecha_Alta, Fecha_Baja
      ) VALUES (
        @Id_Personal, @Id_Tipo_Documento_Personal, @Numero_Documento_Personal,
        @Apellido_Paterno_Personal, @Apellido_Materno_Personal, @Nombres_Personal,
        @Fecha_Nacimiento_Personal, @Id_Condicion, @Id_Profesion, @Id_Colegio,
        @Numero_Colegiatura, @Id_Establecimiento, @Fecha_Alta, @Fecha_Baja
      )
    `);

    res.status(201).json({ mensaje: 'Personal registrado correctamente.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { buscar, obtenerPorId, crear };
