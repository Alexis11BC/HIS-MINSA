// src/middleware/errorHandler.js
// Middleware global de manejo de errores — captura cualquier excepción no gestionada.
// Loguea detalles internos en consola pero nunca los expone al cliente.

function errorHandler(err, _req, res, _next) {
  console.error('🔴 Error no controlado:', err);

  const status = err.status || 500;
  const mensaje = status === 500
    ? 'Error interno del servidor'
    : err.message || 'Error desconocido';

  res.status(status).json({ error: mensaje });
}

module.exports = errorHandler;
