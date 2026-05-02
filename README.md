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
│       │   ├── CryptoPosition.js
│       │   └── DailySnapshot.js  # Snapshot diario para variación de patrimonio
│       ├── routes/
│       │   ├── plazos.js        # CRUD + precancelación + historial
│       │   ├── cryptos.js       # CRUD con precios live
│       │   └── dashboard.js     # Resumen de patrimonio total
│       ├── jobs/
│       │   └── dailyTelegramReportJob.js  # Envío diario programado a Telegram
│       └── services/
│           ├── coinGecko.js     # Precios USD con caché de 5 min
│           ├── dolarApi.js      # Tipo de cambio oficial ARS/USD
│           ├── patrimonioService.js  # Cálculo centralizado de patrimonio
│           ├── dailySummaryFormatter.js  # Formato de mensaje Telegram
│           └── telegramReporter.js  # Cliente Telegram Bot API
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
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
DAILY_REPORT_CRON=0 8 * * *
REPORT_TIMEZONE=America/Argentina/Buenos_Aires
REPORT_TRIGGER_TOKEN=
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
| `TELEGRAM_BOT_TOKEN` | Token del bot de Telegram | `123456:ABCDEF...` |
| `TELEGRAM_CHAT_ID` | Chat ID de destino (chat privado, grupo o canal) | `123456789` |
| `DAILY_REPORT_CRON` | Expresión cron del envío diario | `0 8 * * *` |
| `REPORT_TIMEZONE` | Zona horaria usada por el scheduler | `America/Argentina/Buenos_Aires` |
| `REPORT_TRIGGER_TOKEN` | Token opcional para disparo manual por API | `token-seguro` |

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

## UptimeRobot

Render apaga los servicios gratuitos tras **15 minutos de inactividad**. Cuando el backend está dormido, la primera petición tarda ~30 segundos en responder (cold start), lo que hace que la app parezca caída.

Para evitarlo, se configura un monitor HTTP en [UptimeRobot](https://uptimerobot.com) que hace ping cada 5 minutos al endpoint `GET /api/health` del backend. Esto mantiene el proceso activo de forma continua sin necesidad de un plan pago en Render.

> Solo es necesario si el backend está en el **plan gratuito de Render**.

## Reporte diario por Telegram

El backend envía un resumen diario de patrimonio por Telegram con:
- Patrimonio total en USD
- Variación diaria absoluta y porcentual respecto del último snapshot

### Configuración inicial (una sola vez)
1. Crear un bot con BotFather y copiar el token.
2. Obtener el chat ID de tu cuenta (chat privado) y cargarlo en `TELEGRAM_CHAT_ID`.
3. Configurar variables en Render:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `DAILY_REPORT_CRON=0 8 * * *`
   - `REPORT_TIMEZONE=America/Argentina/Buenos_Aires`
   - `REPORT_TRIGGER_TOKEN` (recomendado)

### Cómo funciona
- El scheduler se inicia al levantar el backend.
- Por defecto corre todos los días a las 08:00 (Argentina).
- Evita envíos duplicados en el mismo día.
- Guarda un snapshot diario en MongoDB para calcular variación contra el día anterior.

### Prueba manual del envío

Podés disparar el reporte sin esperar al cron:

```bash
curl -X POST https://TU_BACKEND.onrender.com/api/reports/daily-telegram/trigger \
  -H "x-report-trigger-token: TU_REPORT_TRIGGER_TOKEN"
```

Ese trigger no fuerza un reenvío si ya se envió hoy. Si querés forzar explícitamente (por ejemplo para pruebas), usá:

```bash
curl -X POST "https://TU_BACKEND.onrender.com/api/reports/daily-telegram/trigger?force=true" \
  -H "x-report-trigger-token: TU_REPORT_TRIGGER_TOKEN"
```

### Render + UptimeRobot

Como ya usás UptimeRobot para mantener el servicio activo en Render free, el cron in-process del backend se mantiene vivo y puede ejecutar el envío diario de forma estable.

### Si aparece CoinGecko 429

El backend usa caché de precios en memoria como fallback.
Si CoinGecko falla y existe caché previa, se reutiliza esa información para evitar cortes en la app.

## Notas

- Los IDs de activos deben ser los IDs de CoinGecko (ej: `bitcoin`, `ethereum`, `usd-coin`).
  Para obtener los IDs de las 100 criptomonedas más importantes, consultá:
  [https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1](https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1)
- La duración de los plazos fijos está fijada en 365 días
- El tipo de cambio oficial se obtiene de [dolarapi.com](https://dolarapi.com)
