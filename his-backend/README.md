# HIS Backend

API de consulta para el sistema de Gestión Hospitalaria HIS. El backend sirve el frontend estático desde `public/` y expone únicamente endpoints `GET`.

## Estructura

```text
server.js                 Arranque del servidor
src/
  app.js                  Middlewares, estáticos y ciclo de aplicación
  config/
    env.js                Configuración normalizada del entorno
    db.js                 Pool reutilizable de SQL Server
  controllers/            Casos de uso HTTP y consultas SQL
  middleware/
    errorHandler.js       Errores no controlados
    notFound.js           404 para recursos de API
    validate.js            Validaciones compartidas heredadas
  routes/
    index.js              Registro central de módulos de rutas
    *.routes.js           Contratos HTTP por módulo
  utils/                  Utilidades de seguridad y SQL
public/
  index.html              Aplicación web de consultas
  LogosHIS.png            Identidad visual
```

## Ejecutar

```powershell
npm install
Copy-Item .env.example .env
npm start
```

Abrir `http://localhost:3000`.

Para desarrollo:

```powershell
npm run dev
```

## API

- `GET /api/health`
- `GET /api/pacientes`
- `GET /api/personal`
- `GET /api/atenciones`
- `GET /api/defunciones`
- `GET /api/busqueda`
- `GET /api/catalogos/:tabla`
- `GET /api/dashboard/summary`
- `GET /api/reportes/historial`

Las credenciales y la conexión se configuran únicamente mediante `.env`; nunca deben escribirse en el repositorio.
