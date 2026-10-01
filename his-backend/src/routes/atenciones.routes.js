// src/routes/atenciones.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/atenciones.controller');

router.get('/',  ctrl.buscar);

module.exports = router;
