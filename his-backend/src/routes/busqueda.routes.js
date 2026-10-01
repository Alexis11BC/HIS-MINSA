// src/routes/busqueda.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/busqueda.controller');

router.get('/', ctrl.buscar);

module.exports = router;
