import { Router } from 'express';
import CedearPosition from '../models/CedearPosition.js';
import { getDolarOficial } from '../services/dolarApi.js';
import { getPriceBA } from '../services/yahooFinance.js';

const router = Router();

function calcularDatos(position, priceData) {
  const precioARS = priceData?.price ?? 0;
  const montoTotalARS = position.cantidad * precioARS;

  return {
    ...position.toObject(),
    ticker: position.ticker.toUpperCase(),
    precioARS: parseFloat(precioARS.toFixed(2)),
    montoTotalARS: parseFloat(montoTotalARS.toFixed(2)),
  };
}

router.get('/', async (req, res) => {
  try {
    const [positions, dolarOficial] = await Promise.all([
      CedearPosition.find().sort({ createdAt: -1 }),
      getDolarOficial(),
    ]);

    if (positions.length === 0) return res.json([]);
    const tickers = [...new Set(positions.map((p) => p.ticker))];
    const prices = await Promise.all(
      tickers.map(async (ticker) => ({ ticker, data: await getPriceBA(ticker) }))
    );

    const priceMap = Object.fromEntries(
      prices.map(({ ticker, data }) => [ticker.toUpperCase(), data])
    );

    res.json(
      positions.map((position) => calcularDatos(position, priceMap[position.ticker.toUpperCase()], dolarOficial))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { ticker, plataforma, cantidad } = req.body;
    if (!ticker || !plataforma || !cantidad || Number(cantidad) <= 0) {
      return res.status(400).json({ error: 'Ticker, plataforma y cantidad son requeridos' });
    }

    const position = new CedearPosition({
      ticker: String(ticker).trim().toUpperCase(),
      plataforma: String(plataforma).trim(),
      cantidad: Number(cantidad),
      tipo: 'cedear',
    });

    await position.save();
    const dolarOficial = await getDolarOficial();
    const priceData = await getPriceBA(position.ticker);
    res.status(201).json(calcularDatos(position, priceData, dolarOficial));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { ticker, plataforma, cantidad } = req.body;
    const position = await CedearPosition.findByIdAndUpdate(
      req.params.id,
      {
        ticker: String(ticker).trim().toUpperCase(),
        plataforma: String(plataforma).trim(),
        cantidad: Number(cantidad),
        tipo: 'cedear',
      },
      { new: true, runValidators: true }
    );

    if (!position) return res.status(404).json({ error: 'Posición no encontrada' });

    const dolarOficial = await getDolarOficial();
    const priceData = await getPriceBA(position.ticker);
    res.json(calcularDatos(position, priceData, dolarOficial));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const position = await CedearPosition.findByIdAndDelete(req.params.id);
    if (!position) return res.status(404).json({ error: 'Posición no encontrada' });
    res.json({ message: 'Eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
