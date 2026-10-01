// src/app.js
// Aplicación Express — configuración de middlewares, rutas y manejo de errores.

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const env = require('./config/env');

const { registerRoutes } = require('./routes');

const app = express();

// --- Middlewares globales ---

// Seguridad: cabeceras HTTP (deshabilitamos CSP para permitir CDN de Tailwind en el frontend)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS: permite que el frontend (desde cualquier origen o file://) consuma la API
app.use(cors({
  origin: env.corsOrigin,
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Logging de requests en desarrollo
app.use(morgan('dev'));

// Servir el frontend (archivos estáticos) desde la carpeta public/
app.use(express.static(path.join(__dirname, '..', 'public')));

// TODO: auth — agregar middleware de autenticación/roles aquí cuando se implemente

// --- Rutas de la API de consulta ---
registerRoutes(app);

// Ruta de salud
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(notFound);

// SPA fallback: cualquier ruta que no sea /api/ sirve el index.html del frontend
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// --- Middleware global de manejo de errores (debe ir al final) ---
app.use(errorHandler);

module.exports = app;
