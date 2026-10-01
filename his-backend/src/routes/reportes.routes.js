// src/routes/reportes.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/reportes.controller');

router.get('/historial', ctrl.historial);

module.exports = router;
