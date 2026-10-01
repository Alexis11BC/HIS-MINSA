// src/controllers/atenciones.controller.js
// Controlador para operaciones sobre NProduccion (atenciones / citas)

const { sql, poolPromise } = require('../config/db');
const { validarLongitudes, esFechaISOValida } = require('../middleware/validate');

/**
 * GET /api/atenciones?modo=cita|paciente|personal|codigo&q=...&desde=YYYY-MM-DD&hasta=YYYY-MM-DD
 * GET /api/atenciones?personal=:idPersonal  (atenciones de un trabajador)
 */
async function buscar(req, res, next) {
  try {
    const { modo, q, desde, hasta, personal } = req.query;

    // Validar fechas si se envían
    if (desde && !esFechaISOValida(desde)) {
      return res.status(400).json({ error: 'El parámetro "desde" no tiene formato de fecha válido (YYYY-MM-DD).' });
    }
    if (hasta && !esFechaISOValida(hasta)) {
      return res.status(400).json({ error: 'El parámetro "hasta" no tiene formato de fecha válido (YYYY-MM-DD).' });
    }

    const pool = await poolPromise;
    const request = pool.request();

    // Atenciones de un personal específico (usado desde la ficha de personal)
    if (personal) {
      request.input('personal', sql.VarChar(50), personal);
      const result = await request.query(`
        SELECT TOP 200 n.*, c.Descripcion_Item AS DescItem
        FROM NProduccion n
        LEFT JOIN MAESTRO_HIS_CIE_CPMS c ON n.Codigo_Item = c.Codigo_Item
        WHERE n.Id_Personal = @personal
        ORDER BY n.Fecha_Atencion DESC
      `);
      return res.json(result.recordset);
    }

    // Búsqueda por modo
    const conditions = [];
    if (q) {
      request.input('q', sql.VarChar, `%${q.trim()}%`);
      switch (modo) {
        case 'cita':
          conditions.push('n.Id_Cita LIKE @q');
          break;
        case 'paciente':
          conditions.push('n.Id_Paciente LIKE @q');
          break;
        case 'personal':
          conditions.push('n.Id_Personal LIKE @q');
          break;
        case 'codigo':
          conditions.push('n.Codigo_Item LIKE @q');
          break;
        default:
          conditions.push('(n.Id_Cita LIKE @q OR n.Id_Paciente LIKE @q OR n.Id_Personal LIKE @q OR n.Codigo_Item LIKE @q)');
      }
    }

    if (desde) {
      request.input('desde', sql.Date, desde);
      conditions.push('n.Fecha_Atencion >= @desde');
    }
    if (hasta) {
      request.input('hasta', sql.Date, hasta);
      conditions.push('n.Fecha_Atencion <= @hasta');
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const result = await request.query(`
      SELECT TOP 200 n.*, c.Descripcion_Item AS DescItem
      FROM NProduccion n
      LEFT JOIN MAESTRO_HIS_CIE_CPMS c ON n.Codigo_Item = c.Codigo_Item
      ${where}
      ORDER BY n.Fecha_Atencion DESC
    `);

    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/atenciones
 * Inserta un nuevo registro en NProduccion.
 */
async function crear(req, res, next) {
  try {
    const body = req.body;

    const { valido, errores } = validarLongitudes('NProduccion', body);
    if (!valido) return res.status(400).json({ error: errores.join(' ') });

    const pool = await poolPromise;
    const request = pool.request();

    // Campos de NProduccion
    request.input('Id_Cita',                     sql.VarChar(50),       body.Id_Cita || null);
    request.input('Anio',                        sql.VarChar(4),        body.Anio || null);
    request.input('Mes',                         sql.VarChar(2),        body.Mes || null);
    request.input('Dia',                         sql.VarChar(2),        body.Dia || null);
    request.input('Fecha_Atencion',              sql.Date,              body.Fecha_Atencion || null);
    request.input('Lote',                        sql.VarChar(3),        body.Lote || null);
    request.input('Num_Pag',                     sql.Int,               body.Num_Pag || null);
    request.input('Num_Reg',                     sql.Int,               body.Num_Reg || null);
    request.input('Id_Ups',                      sql.VarChar(6),        body.Id_Ups || null);
    request.input('Id_Establecimiento',          sql.Int,               body.Id_Establecimiento || null);
    request.input('Id_Paciente',                 sql.VarChar(50),       body.Id_Paciente || null);
    request.input('Id_Personal',                 sql.VarChar(50),       body.Id_Personal || null);
    request.input('Id_Registrador',              sql.VarChar(50),       body.Id_Registrador || null);
    request.input('Id_Financiador',              sql.VarChar(2),        body.Id_Financiador || null);
    request.input('Id_Condicion_Establecimiento',sql.VarChar(1),        body.Id_Condicion_Establecimiento || null);
    request.input('Id_Condicion_Servicio',       sql.VarChar(1),        body.Id_Condicion_Servicio || null);
    request.input('Edad_Reg',                    sql.Int,               body.Edad_Reg || null);
    request.input('Tipo_Edad',                   sql.VarChar(1),        body.Tipo_Edad || null);
    request.input('Anio_Actual_Paciente',        sql.Int,               body.Anio_Actual_Paciente || null);
    request.input('Mes_Actual_Paciente',         sql.Int,               body.Mes_Actual_Paciente || null);
    request.input('Dia_Actual_Paciente',         sql.Int,               body.Dia_Actual_Paciente || null);
    request.input('Id_Turno',                    sql.VarChar(1),        body.Id_Turno || null);
    request.input('Codigo_Item',                 sql.VarChar(15),       body.Codigo_Item || null);
    request.input('Tipo_Diagnostico',            sql.VarChar(1),        body.Tipo_Diagnostico || null);
    request.input('Valor_Lab',                   sql.VarChar(5),        body.Valor_Lab || null);
    request.input('Id_Correlativo_Item',         sql.Int,               body.Id_Correlativo_Item || null);
    request.input('Id_Correlativo_Lab',          sql.Int,               body.Id_Correlativo_Lab || null);
    request.input('Peso',                        sql.Decimal(10, 3),    body.Peso || null);
    request.input('Talla',                       sql.Decimal(10, 2),    body.Talla || null);
    request.input('Hemoglobina',                 sql.Decimal(6, 2),     body.Hemoglobina || null);
    request.input('Perimetro_Abdominal',         sql.Decimal(10, 2),    body.Perimetro_Abdominal || null);
    request.input('Perimetro_Cefalico',          sql.Decimal(10, 2),    body.Perimetro_Cefalico || null);
    request.input('Id_Otra_Condicion',           sql.Int,               body.Id_Otra_Condicion || null);
    request.input('Id_Centro_Poblado',           sql.VarChar(10),       body.Id_Centro_Poblado || null);
    request.input('Fecha_Ultima_Regla',          sql.Date,              body.Fecha_Ultima_Regla || null);
    request.input('Fecha_Solicitud_Hb',          sql.Date,              body.Fecha_Solicitud_Hb || null);
    request.input('Fecha_Resultado_Hb',          sql.Date,              body.Fecha_Resultado_Hb || null);
    request.input('Fecha_Registro',              sql.DateTime,          body.Fecha_Registro || null);
    request.input('Fecha_Modificacion',          sql.DateTime,          body.Fecha_Modificacion || null);
    request.input('Id_Pais',                     sql.VarChar(3),        body.Id_Pais || null);
    request.input('gruporiesgo_desc',            sql.VarChar(50),       body.gruporiesgo_desc || null);
    request.input('condicion_gestante',          sql.VarChar(50),       body.condicion_gestante || null);
    request.input('Peso_Pregestacional',         sql.Decimal(10, 2),    body.Peso_Pregestacional || null);
    request.input('Id_Dosis',                    sql.Int,               body.Id_Dosis || null);
    request.input('renipress',                   sql.VarChar(50),       body.renipress || null);
    request.input('Id_Institucion_Edu',          sql.VarChar(10),       body.Id_Institucion_Edu || null);
    request.input('Id_AplicacionOrigen',         sql.Int,               body.Id_AplicacionOrigen || null);
    request.input('Alerta',                      sql.VarChar(3000),     body.Alerta || null);

    await request.query(`
      INSERT INTO NProduccion (
        Id_Cita, Anio, Mes, Dia, Fecha_Atencion, Lote, Num_Pag, Num_Reg,
        Id_Ups, Id_Establecimiento, Id_Paciente, Id_Personal, Id_Registrador,
        Id_Financiador, Id_Condicion_Establecimiento, Id_Condicion_Servicio,
        Edad_Reg, Tipo_Edad, Anio_Actual_Paciente, Mes_Actual_Paciente, Dia_Actual_Paciente,
        Id_Turno, Codigo_Item, Tipo_Diagnostico, Valor_Lab,
        Id_Correlativo_Item, Id_Correlativo_Lab,
        Peso, Talla, Hemoglobina, Perimetro_Abdominal, Perimetro_Cefalico,
        Id_Otra_Condicion, Id_Centro_Poblado,
        Fecha_Ultima_Regla, Fecha_Solicitud_Hb, Fecha_Resultado_Hb,
        Fecha_Registro, Fecha_Modificacion, Id_Pais,
        gruporiesgo_desc, condicion_gestante, Peso_Pregestacional,
        Id_Dosis, renipress, Id_Institucion_Edu, Id_AplicacionOrigen, Alerta
      ) VALUES (
        @Id_Cita, @Anio, @Mes, @Dia, @Fecha_Atencion, @Lote, @Num_Pag, @Num_Reg,
        @Id_Ups, @Id_Establecimiento, @Id_Paciente, @Id_Personal, @Id_Registrador,
        @Id_Financiador, @Id_Condicion_Establecimiento, @Id_Condicion_Servicio,
        @Edad_Reg, @Tipo_Edad, @Anio_Actual_Paciente, @Mes_Actual_Paciente, @Dia_Actual_Paciente,
        @Id_Turno, @Codigo_Item, @Tipo_Diagnostico, @Valor_Lab,
        @Id_Correlativo_Item, @Id_Correlativo_Lab,
        @Peso, @Talla, @Hemoglobina, @Perimetro_Abdominal, @Perimetro_Cefalico,
        @Id_Otra_Condicion, @Id_Centro_Poblado,
        @Fecha_Ultima_Regla, @Fecha_Solicitud_Hb, @Fecha_Resultado_Hb,
        @Fecha_Registro, @Fecha_Modificacion, @Id_Pais,
        @gruporiesgo_desc, @condicion_gestante, @Peso_Pregestacional,
        @Id_Dosis, @renipress, @Id_Institucion_Edu, @Id_AplicacionOrigen, @Alerta
      )
    `);

    res.status(201).json({ mensaje: 'Atención registrada correctamente.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { buscar, crear };
