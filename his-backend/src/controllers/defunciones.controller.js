// src/controllers/defunciones.controller.js
// Controlador para operaciones sobre V_SINADEF_AYACUCHO_DOMFALLECIDO

const { sql, poolPromise } = require('../config/db');
const { validarLongitudes, validarDefuncionObligatorios } = require('../middleware/validate');

/**
 * GET /api/defunciones?modo=documento|n|cdef|nombre&q=...
 * Busca defunciones según el modo indicado.
 */
async function buscar(req, res, next) {
  try {
    const q = (req.query.q || '').trim();
    const modo = req.query.modo || 'documento';
    if (!q) return res.status(400).json({ error: 'El parámetro q es obligatorio.' });

    const pool = await poolPromise;
    const request = pool.request().input('q', sql.NVarChar, `%${q}%`);

    let where = '';
    switch (modo) {
      case 'documento':
        where = 'DOCUMENTO LIKE @q';
        break;
      case 'n':
        where = 'N LIKE @q';
        break;
      case 'cdef':
        where = 'CDEF LIKE @q';
        break;
      case 'nombre':
        where = `(PRIMER_APELLIDO LIKE @q
                  OR SEGUNDO_APELLIDO LIKE @q
                  OR NOMBRES LIKE @q)`;
        break;
      default:
        where = `(DOCUMENTO LIKE @q OR N LIKE @q OR CDEF LIKE @q
                  OR PRIMER_APELLIDO LIKE @q OR SEGUNDO_APELLIDO LIKE @q OR NOMBRES LIKE @q)`;
    }

    const result = await request.query(`
      SELECT TOP 100 *
      FROM V_SINADEF_AYACUCHO_DOMFALLECIDO
      WHERE ${where}
      ORDER BY FECHA DESC
    `);

    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/defunciones
 * Inserta un nuevo registro en V_SINADEF_AYACUCHO_DOMFALLECIDO.
 */
async function crear(req, res, next) {
  try {
    const body = req.body;

    // Validar campos obligatorios
    const obligatorios = validarDefuncionObligatorios(body);
    if (!obligatorios.valido) {
      return res.status(400).json({ error: obligatorios.errores.join(' ') });
    }

    // Validar longitudes
    const { valido, errores } = validarLongitudes('V_SINADEF_AYACUCHO_DOMFALLECIDO', body);
    if (!valido) return res.status(400).json({ error: errores.join(' ') });

    const pool = await poolPromise;
    const request = pool.request();

    // Mapear todos los campos — son muchos, así que los definimos en orden
    const camposVarchar50 = [
      'N', 'TIPO_CDEF', 'ESTADO', 'TIPO_SEGURO',
      'PRIMER_APELLIDO', 'SEGUNDO_APELLIDO', 'NOMBRES',
      'TIPO_DOC', 'DOCUMENTO', 'SEXO', 'ETNIA', 'EDAD',
      'TIEMPO_EDAD', 'ESTADO_CIVIL', 'HORA',
      'INSTITUCION', 'DISA', 'DEPARTAMENTO', 'PROVINCIA', 'DISTRITO',
    ];
    camposVarchar50.forEach(c => {
      request.input(c, sql.NVarChar(50), body[c] !== undefined ? body[c] : null);
    });

    const camposVarchar150 = [
      'NIVEL_DE_INSTRUCCION', 'OCUPACION',
      'CODIGO_UBIGEO_DOMICILIO', 'UBIGEO_DOMICILIO', 'DIRECCION_DE_DOMICILIO',
      'CONTINENTE_DOMICILIO', 'PAIS_DOMICILIO', 'DEPARTAMENTO_DOMICILIO',
      'PROVINCIA_DOMICILIO', 'DISTRITO_DOMICILIO',
      'CAUSA_A_CIEX', 'TIEMPO', 'CAUSA_B_CIEX', 'TIEMPO1',
      'CAUSA_C_CIEX', 'TIEMPO2', 'CAUSA_D_CIEX', 'TIEMPO3',
      'CAUSA_E_CIEX', 'TIEMPO4', 'CAUSA_F_CIEX', 'TIEMPO5',
      'TIPO_LUGAR', 'CODIGO_LUGAR_UBIGEO', 'CONTINENTE', 'PAIS',
      'MUERTE_VIOLENTA', 'NECROPSIA', 'MUERTE_DURANTE',
      'EDAD_GESTACIONAL', 'CONTROL_PRENATAL', 'TIEMPO_DE_HOSPITALIZACION',
      'TIPO_LUGAR1', 'CODIGO_LUGAR_UBIGEO1', 'INSTITUCION1', 'DEPARTAMENTO1',
      'PRIMER_APELLIDO1', 'SEGUNDO_APELLIDO1', 'NOMBRES1',
      'TIPO_DOC1', 'DOCUMENTO1', 'DECLARA', 'NUMERO_COLEGIO',
      'PRIMER_APELLIDO2', 'SEGUNDO_APELLIDO2', 'NOMBRES2', 'DNI_CODIGO_USUARIO',
    ];
    camposVarchar150.forEach(c => {
      request.input(c, sql.NVarChar(150), body[c] !== undefined ? body[c] : null);
    });

    // Campos varchar(max)
    const camposMax = [
      'CDEF', 'DEBIDO_CAUSA_A', 'DEBIDO_CAUSA_B', 'DEBIDO_CAUSA_C',
      'DEBIDO_CAUSA_D', 'DEBIDO_CAUSA_E', 'DEBIDO_CAUSA_F',
      'DESCRIPCION_DE_LUGAR', 'DIRECCION_DE_LUGAR',
      'DESCRIPCION_DE_LUGAR1',
    ];
    camposMax.forEach(c => {
      request.input(c, sql.VarChar(sql.MAX), body[c] !== undefined ? body[c] : null);
    });

    // Campos numéricos
    request.input('ANIO',  sql.Int, body.ANIO || null);
    request.input('MES',   sql.Int, body.MES || null);
    request.input('ANIO1', sql.Int, body.ANIO1 || null);
    request.input('MES1',  sql.Int, body.MES1 || null);

    // Campos fecha
    request.input('FECHA',           sql.Date, body.FECHA || null);
    request.input('FECHA_REGISTRO',  sql.Date, body.FECHA_REGISTRO || null);

    // Construir la lista dinámica de columnas y valores
    const todosLosCampos = [
      ...camposVarchar50, ...camposVarchar150, ...camposMax,
      'ANIO', 'MES', 'ANIO1', 'MES1', 'FECHA', 'FECHA_REGISTRO',
    ];

    const columnas = todosLosCampos.join(', ');
    const valores = todosLosCampos.map(c => `@${c}`).join(', ');

    await request.query(`
      INSERT INTO V_SINADEF_AYACUCHO_DOMFALLECIDO (${columnas})
      VALUES (${valores})
    `);

    res.status(201).json({ mensaje: 'Defunción registrada correctamente.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { buscar, crear };
