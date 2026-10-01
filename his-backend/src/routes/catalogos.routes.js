// src/routes/catalogos.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/catalogos.controller');

router.get('/:tabla', ctrl.listar);

module.exports = router;
