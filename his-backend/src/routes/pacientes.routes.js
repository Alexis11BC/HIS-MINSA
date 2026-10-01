// src/routes/pacientes.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/pacientes.controller');

router.get('/',              ctrl.buscar);
router.get('/:id',           ctrl.obtenerPorId);
router.get('/:id/atenciones', ctrl.obtenerAtenciones);

module.exports = router;
