const pacientesRoutes = require('./pacientes.routes');
const personalRoutes = require('./personal.routes');
const atencionesRoutes = require('./atenciones.routes');
const defuncionesRoutes = require('./defunciones.routes');
const busquedaRoutes = require('./busqueda.routes');
const catalogosRoutes = require('./catalogos.routes');
const dashboardRoutes = require('./dashboard.routes');
const reportesRoutes = require('./reportes.routes');

const routes = [
  ['/api/pacientes', pacientesRoutes],
  ['/api/personal', personalRoutes],
  ['/api/atenciones', atencionesRoutes],
  ['/api/defunciones', defuncionesRoutes],
  ['/api/busqueda', busquedaRoutes],
  ['/api/catalogos', catalogosRoutes],
  ['/api/dashboard', dashboardRoutes],
  ['/api/reportes', reportesRoutes],
];

function registerRoutes(app) {
  for (const [prefix, router] of routes) {
    app.use(prefix, router);
  }
}

module.exports = { registerRoutes };
