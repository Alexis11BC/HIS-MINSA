// src/controllers/pacientes.controller.js
// Controlador para operaciones CRUD sobre MaestroPaciente

const { sql, poolPromise } = require('../config/db');
const { validarLongitudes } = require('../middleware/validate');

/**
 * GET /api/pacientes?q=...
 * Busca pacientes por ID, documento, historia clínica, ficha familiar o nombre.
 */
async function buscar(req, res, next) {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.status(400).json({ error: 'El parámetro q es obligatorio.' });

    const pool = await poolPromise;
    const result = await pool.request()
      .input('q', sql.VarChar, `%${q}%`)
      .query(`
        SELECT TOP 100 *
        FROM MaestroPaciente
        WHERE Id_Paciente              LIKE @q
           OR Numero_Documento_Paciente LIKE @q
           OR Historia_Clinica          LIKE @q
           OR Ficha_Familiar            LIKE @q
           OR Apellido_Paterno_Paciente LIKE @q
           OR Apellido_Materno_Paciente LIKE @q
           OR Nombres_Paciente          LIKE @q
      `);

    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/pacientes/:id
 * Obtiene un paciente por su Id_Paciente.
 */
async function obtenerPorId(req, res, next) {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.VarChar(50), req.params.id)
      .query('SELECT * FROM MaestroPaciente WHERE Id_Paciente = @id');

    if (!result.recordset.length) {
      return res.status(404).json({ error: 'Paciente no encontrado.' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/pacientes/:id/atenciones
 * Obtiene las atenciones (NProduccion) del paciente, con descripción del ítem desde CIE/CPMS.
 */
async function obtenerAtenciones(req, res, next) {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.VarChar(50), req.params.id)
      .query(`
        SELECT n.*, c.Descripcion_Item AS DescItem
        FROM NProduccion n
        LEFT JOIN MAESTRO_HIS_CIE_CPMS c ON n.Codigo_Item = c.Codigo_Item
        WHERE n.Id_Paciente = @id
        ORDER BY n.Fecha_Atencion DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/pacientes
 * Inserta un nuevo registro en MaestroPaciente.
 */
async function crear(req, res, next) {
  try {
    const body = req.body;

    // Validar longitudes
    const { valido, errores } = validarLongitudes('MaestroPaciente', body);
    if (!valido) return res.status(400).json({ error: errores.join(' ') });

    const pool = await poolPromise;
    const request = pool.request();

    request.input('Id_Paciente',                sql.VarChar(50),   body.Id_Paciente || null);
    request.input('Id_Tipo_Documento_Paciente',  sql.Int,           body.Id_Tipo_Documento_Paciente || null);
    request.input('Numero_Documento_Paciente',   sql.VarChar(15),   body.Numero_Documento_Paciente || null);
    request.input('Apellido_Paterno_Paciente',   sql.VarChar(50),   body.Apellido_Paterno_Paciente || null);
    request.input('Apellido_Materno_Paciente',   sql.VarChar(50),   body.Apellido_Materno_Paciente || null);
    request.input('Nombres_Paciente',            sql.VarChar(150),  body.Nombres_Paciente || null);
    request.input('Fecha_Nacimiento_Paciente',   sql.Date,          body.Fecha_Nacimiento_Paciente || null);
    request.input('Id_Genero',                   sql.VarChar(1),    body.Id_Genero || null);
    request.input('Id_Etnia',                    sql.VarChar(2),    body.Id_Etnia || null);
    request.input('Historia_Clinica',            sql.VarChar(15),   body.Historia_Clinica || null);
    request.input('Ficha_Familiar',              sql.VarChar(15),   body.Ficha_Familiar || null);
    request.input('Ubigeo_Nacimiento',           sql.VarChar(6),    body.Ubigeo_Nacimiento || null);
    request.input('Ubigeo_Reniec',               sql.VarChar(6),    body.Ubigeo_Reniec || null);
    request.input('Domicilio_Reniec',            sql.VarChar(250),  body.Domicilio_Reniec || null);
    request.input('Ubigeo_Declarado',            sql.VarChar(6),    body.Ubigeo_Declarado || null);
    request.input('Domicilio_Declarado',         sql.VarChar(250),  body.Domicilio_Declarado || null);
    request.input('Referencia_Domicilio',        sql.VarChar(500),  body.Referencia_Domicilio || null);
    request.input('Id_Pais',                     sql.VarChar(3),    body.Id_Pais || null);
    request.input('Id_Establecimiento',          sql.Int,           body.Id_Establecimiento || null);
    request.input('Fecha_Alta',                  sql.DateTime,      body.Fecha_Alta || null);
    request.input('Fecha_Modificacion',          sql.DateTime,      body.Fecha_Modificacion || null);

    await request.query(`
      INSERT INTO MaestroPaciente (
        Id_Paciente, Id_Tipo_Documento_Paciente, Numero_Documento_Paciente,
        Apellido_Paterno_Paciente, Apellido_Materno_Paciente, Nombres_Paciente,
        Fecha_Nacimiento_Paciente, Id_Genero, Id_Etnia,
        Historia_Clinica, Ficha_Familiar,
        Ubigeo_Nacimiento, Ubigeo_Reniec, Domicilio_Reniec,
        Ubigeo_Declarado, Domicilio_Declarado, Referencia_Domicilio,
        Id_Pais, Id_Establecimiento, Fecha_Alta, Fecha_Modificacion
      ) VALUES (
        @Id_Paciente, @Id_Tipo_Documento_Paciente, @Numero_Documento_Paciente,
        @Apellido_Paterno_Paciente, @Apellido_Materno_Paciente, @Nombres_Paciente,
        @Fecha_Nacimiento_Paciente, @Id_Genero, @Id_Etnia,
        @Historia_Clinica, @Ficha_Familiar,
        @Ubigeo_Nacimiento, @Ubigeo_Reniec, @Domicilio_Reniec,
        @Ubigeo_Declarado, @Domicilio_Declarado, @Referencia_Domicilio,
        @Id_Pais, @Id_Establecimiento, @Fecha_Alta, @Fecha_Modificacion
      )
    `);

    res.status(201).json({ mensaje: 'Paciente registrado correctamente.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { buscar, obtenerPorId, obtenerAtenciones, crear };
