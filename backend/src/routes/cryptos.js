import { Router } from 'express';
import CryptoPosition from '../models/CryptoPosition.js';
import { getPrices } from '../services/coinGecko.js';

const router = Router();

function calcularDatos(position, prices) {
  const precio = prices[position.activo]?.usd ?? 0;
  const monto = position.cantidad * precio;

  let montoStaking = 0;
  if (position.staking && position.tnaStaking > 0) {
    const hoy = new Date();
    const inicio = new Date(position.fechaInicio);
    const dias = Math.max(0, Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24)));
    montoStaking = monto * (position.tnaStaking / 100) * (dias / 365);
  }

  const montoTotal = monto + montoStaking;

  return {
    ...position.toObject(),
    precio: parseFloat(precio.toFixed(8)),
    monto: parseFloat(monto.toFixed(2)),
    montoStaking: parseFloat(montoStaking.toFixed(2)),
    montoTotal: parseFloat(montoTotal.toFixed(2)),
  };
}

router.get('/', async (req, res) => {
  try {
    const positions = await CryptoPosition.find().sort({ createdAt: -1 });
    if (positions.length === 0) return res.json([]);
    const ids = [...new Set(positions.map((p) => p.activo))];
    const prices = await getPrices(ids);
    res.json(positions.map((p) => calcularDatos(p, prices)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { activo, plataforma, cantidad, staking, tnaStaking, fechaInicio } = req.body;
    const position = new CryptoPosition({ activo, plataforma, cantidad, staking, tnaStaking, fechaInicio });
    await position.save();
    const prices = await getPrices([activo]);
    res.status(201).json(calcularDatos(position, prices));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { activo, plataforma, cantidad, staking, tnaStaking, fechaInicio } = req.body;
    const position = await CryptoPosition.findByIdAndUpdate(
      req.params.id,
      { activo, plataforma, cantidad, staking, tnaStaking, fechaInicio },
      { new: true, runValidators: true }
    );
    if (!position) return res.status(404).json({ error: 'Posición no encontrada' });
    const prices = await getPrices([position.activo]);
    res.json(calcularDatos(position, prices));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const position = await CryptoPosition.findByIdAndDelete(req.params.id);
    if (!position) return res.status(404).json({ error: 'Posición no encontrada' });
    res.json({ message: 'Eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
