# Investment Manager

Aplicación full-stack para gestionar inversiones personales: plazos fijos en ARS y posiciones en criptomonedas.

## Tecnologías

| Capa | Stack |
|------|-------|
| Frontend | React 18, Vite 5, React Router v6 |
| Backend | Node.js (ESM), Express 4 |
| Base de datos | MongoDB + Mongoose 8 |
| APIs externas | CoinGecko (precios crypto), dolarapi.com (tipo de cambio oficial) |

## Deploy en producción

| Servicio | Plataforma | URL |
|---|---|---|
| Frontend | Vercel | — |
| Backend | Render | — |
| Base de datos | MongoDB Atlas M0 | — |
| Keep-alive | UptimeRobot | ping cada 5 min a `/api/health` |

## Estructura

```
investment-manager/
├── backend/
│   └── src/
│       ├── app.js               # Entry point, Express + Mongoose
│       ├── models/
│       │   ├── PlazoFijo.js
│       │   └── CryptoPosition.js
│       ├── routes/
│       │   ├── plazos.js        # CRUD + precancelación + historial
│       │   ├── cryptos.js       # CRUD con precios live
│       │   └── dashboard.js     # Resumen de patrimonio total
│       └── services/
│           ├── coinGecko.js     # Precios USD con caché de 5 min
│           └── dolarApi.js      # Tipo de cambio oficial ARS/USD
└── frontend/
    └── src/
        ├── pages/
        │   ├── DashboardPage.jsx
        │   ├── PlazosFijosPage.jsx
        │   └── CryptosPage.jsx
        ├── components/
        │   ├── LoginPage.jsx        # Pantalla de login con protección por contraseña
        │   ├── PlazoFijoCard.jsx
        │   ├── PlazoFijoForm.jsx
        │   ├── CryptoCard.jsx
        │   ├── CryptoForm.jsx
        │   └── Modal.jsx
        ├── services/api.js
        └── utils/formatters.js
```

## Instalación y uso local

### Requisitos previos
- Node.js 18+
- MongoDB 7.0 corriendo en `localhost:27017`

### Backend

```bash
cd backend
npm install
```

Crear el archivo `.env` (ver `.env.example`):

```
MONGO_URI=mongodb://localhost:27017/investment-manager
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

```bash
npm run dev    # desarrollo con nodemon
npm start      # producción
```

### Frontend

```bash
cd frontend
npm install
npm run dev    # inicia en http://localhost:5173
```

El frontend tiene configurado un proxy a `localhost:3001` en desarrollo, por lo que ambos servidores deben estar corriendo simultáneamente. En producción, el frontend usa la variable de entorno `VITE_API_URL` para apuntar al backend de Render.

## Variables de entorno

### Backend
| Variable | Descripción | Ejemplo |
|---|---|---|
| `MONGO_URI` | URI de conexión a MongoDB | `mongodb://localhost:27017/investment-manager` |
| `PORT` | Puerto del servidor | `3001` |
| `CORS_ORIGIN` | Origen permitido por CORS | `http://localhost:5173` |

### Frontend
| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base del backend (solo producción) | `https://your-backend.onrender.com/api` |
| `VITE_APP_PASSWORD` | Contraseña de acceso a la app | `mi_contraseña` |

## Funcionalidades

### Dashboard
- Patrimonio total en USD (plazos + cryptos)
- Conversión ARS → USD usando el dólar oficial
- Distribución porcentual del portfolio
- Botón de actualización manual

### Plazos Fijos
- Registro de plazo, monto, TNA y fecha de inicio
- Cálculo automático de intereses acumulados y monto actual
- **Estados:**
  - `activo` — en curso
  - `precancelado` — cerrado manualmente (disponible desde el día 30)
  - `vencido` — cerrado automáticamente al cumplir 365 días (transición lazy en cada GET)
- Historial de plazos cerrados con fecha y monto cobrado
- Los plazos cerrados **no cuentan** en el patrimonio del dashboard

### Criptomonedas
- Registro de posiciones por activo (ID de CoinGecko), plataforma y cantidad
- Soporte de staking con TNA
- Precios en tiempo real con caché de 5 minutos para evitar rate limiting de CoinGecko

## Notas

- Los IDs de activos deben ser los IDs de CoinGecko (ej: `bitcoin`, `ethereum`, `usd-coin`)
- La duración de los plazos fijos está fijada en 365 días
- El tipo de cambio oficial se obtiene de [dolarapi.com](https://dolarapi.com)
