import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import plazosRouter from './routes/plazos.js';
import cryptosRouter from './routes/cryptos.js';
import dashboardRouter from './routes/dashboard.js';

dotenv.config();

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/plazos-fijos', plazosRouter);
app.use('/api/cryptos', cryptosRouter);
app.use('/api/dashboard', dashboardRouter);

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB conectado');
    app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
  })
  .catch((err) => {
    console.error('Error de conexión MongoDB:', err);
    process.exit(1);
  });
