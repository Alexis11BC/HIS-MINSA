// src/routes/personal.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/personal.controller');

router.get('/',    ctrl.buscar);
router.get('/:id', ctrl.obtenerPorId);

module.exports = router;
