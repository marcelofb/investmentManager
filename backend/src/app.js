import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import plazosRouter from './routes/plazos.js';
import cryptosRouter from './routes/cryptos.js';
import dashboardRouter from './routes/dashboard.js';
import { runDailyTelegramReport, startDailyTelegramReportJob } from './jobs/dailyTelegramReportJob.js';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/plazos-fijos', plazosRouter);
app.use('/api/cryptos', cryptosRouter);
app.use('/api/dashboard', dashboardRouter);

app.post('/api/reports/daily-telegram/trigger', async (req, res) => {
  try {
    const configuredToken = process.env.REPORT_TRIGGER_TOKEN;
    if (!configuredToken) {
      return res.status(503).json({ ok: false, error: 'REPORT_TRIGGER_TOKEN no configurado en el servidor' });
    }
    const providedToken = req.get('x-report-trigger-token');
    if (providedToken !== configuredToken) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }

    const force = req.query.force === 'true' || req.query.force === '1';
    const result = await runDailyTelegramReport({ force });
    res.json({ ok: true, result });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB conectado');
    startDailyTelegramReportJob();
    app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
  })
  .catch((err) => {
    console.error('Error de conexión MongoDB:', err);
    process.exit(1);
  });
