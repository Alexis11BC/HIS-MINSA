// src/middleware/validate.js
// Funciones de validación reutilizables según el esquema real de BDHIS_HRA.

/**
 * Valida que una fecha tenga formato ISO válido (YYYY-MM-DD).
 * @param {string} valor
 * @returns {boolean}
 */
function esFechaISOValida(valor) {
  if (!valor) return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(valor)) return false;
  const d = new Date(valor);
  return !isNaN(d.getTime());
}

/**
 * Longitudes máximas de varchar/nvarchar por tabla (extraídas del script scripsHis.sql).
 * Formato: { nombreColumna: longitudMaxima }
 * Solo se incluyen columnas con longitud definida (varchar(N), nvarchar(N)).
 */
const LONGITUDES = {
  MaestroPaciente: {
    Id_Paciente: 50, Numero_Documento_Paciente: 15,
    Apellido_Paterno_Paciente: 50, Apellido_Materno_Paciente: 50,
    Nombres_Paciente: 150, Id_Genero: 1, Id_Etnia: 2,
    Historia_Clinica: 15, Ficha_Familiar: 15,
    Ubigeo_Nacimiento: 6, Ubigeo_Reniec: 6, Domicilio_Reniec: 250,
    Ubigeo_Declarado: 6, Domicilio_Declarado: 250,
    Referencia_Domicilio: 500, Id_Pais: 3,
  },
  MaestroPersonal: {
    Id_Personal: 50, Numero_Documento_Personal: 15,
    Apellido_Paterno_Personal: 50, Apellido_Materno_Personal: 50,
    Nombres_Personal: 150, Id_Condicion: 2, Id_Profesion: 2,
    Id_Colegio: 2, Numero_Colegiatura: 20,
  },
  NProduccion: {
    Id_Cita: 50, Anio: 4, Mes: 2, Dia: 2, Lote: 3,
    Id_Ups: 6, Id_Paciente: 50, Id_Personal: 50,
    Id_Registrador: 50, Id_Financiador: 2,
    Id_Condicion_Establecimiento: 1, Id_Condicion_Servicio: 1,
    Tipo_Edad: 1, Id_Turno: 1, Codigo_Item: 15,
    Tipo_Diagnostico: 1, Valor_Lab: 5,
    Id_Centro_Poblado: 10, Id_Pais: 3,
    gruporiesgo_desc: 50, condicion_gestante: 50,
    renipress: 50, Id_Institucion_Edu: 10, Alerta: 3000,
  },
  V_SINADEF_AYACUCHO_DOMFALLECIDO: {
    N: 50, TIPO_CDEF: 50, ESTADO: 50, TIPO_SEGURO: 50,
    PRIMER_APELLIDO: 50, SEGUNDO_APELLIDO: 50, NOMBRES: 50,
    TIPO_DOC: 50, DOCUMENTO: 50, SEXO: 50, ETNIA: 50,
    EDAD: 50, TIEMPO_EDAD: 50, ESTADO_CIVIL: 50,
    NIVEL_DE_INSTRUCCION: 150, OCUPACION: 150,
    CODIGO_UBIGEO_DOMICILIO: 150, UBIGEO_DOMICILIO: 150,
    DIRECCION_DE_DOMICILIO: 150, CONTINENTE_DOMICILIO: 150,
    PAIS_DOMICILIO: 150, DEPARTAMENTO_DOMICILIO: 150,
    PROVINCIA_DOMICILIO: 150, DISTRITO_DOMICILIO: 150,
    HORA: 50, CAUSA_A_CIEX: 150, TIEMPO: 150,
    CAUSA_B_CIEX: 150, TIEMPO1: 150,
    CAUSA_C_CIEX: 150, TIEMPO2: 150,
    CAUSA_D_CIEX: 150, TIEMPO3: 150,
    CAUSA_E_CIEX: 150, TIEMPO4: 150,
    CAUSA_F_CIEX: 150, TIEMPO5: 150,
    TIPO_LUGAR: 150, CODIGO_LUGAR_UBIGEO: 150,
    CONTINENTE: 150, PAIS: 150,
    INSTITUCION: 50, DISA: 50,
    DEPARTAMENTO: 50, PROVINCIA: 50, DISTRITO: 50,
    MUERTE_VIOLENTA: 150, NECROPSIA: 150,
    MUERTE_DURANTE: 150, EDAD_GESTACIONAL: 150,
    CONTROL_PRENATAL: 150, TIEMPO_DE_HOSPITALIZACION: 150,
    TIPO_LUGAR1: 150, CODIGO_LUGAR_UBIGEO1: 150,
    INSTITUCION1: 150, DEPARTAMENTO1: 150,
    PRIMER_APELLIDO1: 150, SEGUNDO_APELLIDO1: 150,
    NOMBRES1: 150, TIPO_DOC1: 150, DOCUMENTO1: 150,
    DECLARA: 150, NUMERO_COLEGIO: 150,
    PRIMER_APELLIDO2: 150, SEGUNDO_APELLIDO2: 150,
    NOMBRES2: 150, DNI_CODIGO_USUARIO: 150,
  },
};

/**
 * Campos NOT NULL de V_SINADEF_AYACUCHO_DOMFALLECIDO (todos excepto EDAD y DEBIDO_CAUSA_E).
 */
const DEFUNCION_OBLIGATORIOS = [
  'N','TIPO_CDEF','CDEF','ESTADO','TIPO_SEGURO',
  'PRIMER_APELLIDO','SEGUNDO_APELLIDO','NOMBRES','TIPO_DOC','DOCUMENTO',
  'SEXO','ETNIA','TIEMPO_EDAD','ESTADO_CIVIL','NIVEL_DE_INSTRUCCION','OCUPACION',
  'CODIGO_UBIGEO_DOMICILIO','UBIGEO_DOMICILIO','DIRECCION_DE_DOMICILIO',
  'CONTINENTE_DOMICILIO','PAIS_DOMICILIO','DEPARTAMENTO_DOMICILIO',
  'PROVINCIA_DOMICILIO','DISTRITO_DOMICILIO',
  'FECHA','ANIO','MES','HORA',
  'DEBIDO_CAUSA_A','CAUSA_A_CIEX','TIEMPO',
  'DEBIDO_CAUSA_B','CAUSA_B_CIEX','TIEMPO1',
  'DEBIDO_CAUSA_C','CAUSA_C_CIEX','TIEMPO2',
  'DEBIDO_CAUSA_D','CAUSA_D_CIEX','TIEMPO3',
  'CAUSA_E_CIEX','TIEMPO4',
  'DEBIDO_CAUSA_F','CAUSA_F_CIEX','TIEMPO5',
  'TIPO_LUGAR','CODIGO_LUGAR_UBIGEO','CONTINENTE','PAIS',
  'INSTITUCION','DISA','DEPARTAMENTO','PROVINCIA','DISTRITO',
  'DESCRIPCION_DE_LUGAR','DIRECCION_DE_LUGAR',
  'MUERTE_VIOLENTA','NECROPSIA','MUERTE_DURANTE',
  'EDAD_GESTACIONAL','CONTROL_PRENATAL','TIEMPO_DE_HOSPITALIZACION',
  'TIPO_LUGAR1','CODIGO_LUGAR_UBIGEO1','INSTITUCION1','DEPARTAMENTO1',
  'DESCRIPCION_DE_LUGAR1',
  'PRIMER_APELLIDO1','SEGUNDO_APELLIDO1','NOMBRES1','TIPO_DOC1','DOCUMENTO1',
  'DECLARA','NUMERO_COLEGIO',
  'FECHA_REGISTRO','ANIO1','MES1',
  'PRIMER_APELLIDO2','SEGUNDO_APELLIDO2','NOMBRES2','DNI_CODIGO_USUARIO',
];

/**
 * Valida longitudes máximas de los campos varchar/nvarchar del body para una tabla dada.
 * @param {string} tabla — nombre de la tabla
 * @param {object} body — cuerpo del request
 * @returns {{ valido: boolean, errores: string[] }}
 */
function validarLongitudes(tabla, body) {
  const reglas = LONGITUDES[tabla];
  if (!reglas) return { valido: true, errores: [] };

  const errores = [];
  for (const [campo, maxLen] of Object.entries(reglas)) {
    const valor = body[campo];
    if (valor !== undefined && valor !== null && String(valor).length > maxLen) {
      errores.push(`${campo} excede la longitud máxima de ${maxLen} caracteres (recibidos: ${String(valor).length}).`);
    }
  }
  return { valido: errores.length === 0, errores };
}

/**
 * Valida campos obligatorios de V_SINADEF_AYACUCHO_DOMFALLECIDO.
 * @param {object} body
 * @returns {{ valido: boolean, errores: string[] }}
 */
function validarDefuncionObligatorios(body) {
  const errores = [];
  for (const campo of DEFUNCION_OBLIGATORIOS) {
    if (body[campo] === undefined || body[campo] === null || body[campo] === '') {
      errores.push(`El campo ${campo} es obligatorio (NOT NULL).`);
    }
  }
  return { valido: errores.length === 0, errores };
}

module.exports = {
  esFechaISOValida,
  validarLongitudes,
  validarDefuncionObligatorios,
  LONGITUDES,
  DEFUNCION_OBLIGATORIOS,
};
