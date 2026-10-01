// src/utils/sqlIdentifierWhitelist.js
// Whitelist de tablas válidas para GET /api/catalogos/:tabla
// Evita SQL injection vía nombre de tabla dinámico (no se puede parametrizar un identificador).

const TABLAS_VALIDAS = new Set([
  'MAESTRO_HIS_CENTRO_POBLADO',
  'MAESTRO_HIS_CIE_CPMS',
  'MAESTRO_HIS_CONDICION_CONTRATO',
  'MAESTRO_HIS_ESTABLECIMIENTO',
  'MAESTRO_HIS_PROFESION',
  'MAESTRO_HIS_SISTEMA',
  'MAESTRO_HIS_UPS',
  'MaestroRegistrador',
  'MAESTRO_HIS_ACTIVIDAD_HIS',
  'MAESTRO_HIS_COLEGIO',
  'MAESTRO_HIS_DOSIS',
  'MAESTRO_HIS_ETNIA',
  'MAESTRO_HIS_FINANCIADOR',
  'MAESTRO_HIS_GRUPORIESGO_LAB',
  'MAESTRO_HIS_INSTITUCION_EDUCATIVA',
  'MAESTRO_HIS_LAB',
  'MAESTRO_HIS_OTRA_CONDICION',
  'MAESTRO_HIS_PAIS',
  'MAESTRO_HIS_TIPO_DOC',
  'MAESTRO_HIS_UBIGEO_INEI_RENIEC',
  'MaestroPaciente',
  'MaestroPersonal',
  'NProduccion',
  'V_SINADEF_AYACUCHO_DOMFALLECIDO',
]);

/**
 * Valida que el nombre de tabla esté en la whitelist.
 * @param {string} tabla — nombre recibido desde la URL
 * @returns {boolean}
 */
function esTablaValida(tabla) {
  return TABLAS_VALIDAS.has(tabla);
}

module.exports = { esTablaValida, TABLAS_VALIDAS };
