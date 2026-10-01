// src/routes/defunciones.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/defunciones.controller');

router.get('/',  ctrl.buscar);

module.exports = router;
