import { Router } from 'express';
import PlazoFijo from '../models/PlazoFijo.js';
import CryptoPosition from '../models/CryptoPosition.js';
import { getPrices } from '../services/coinGecko.js';
import { getDolarOficial } from '../services/dolarApi.js';

const router = Router();
const DURACION_DIAS = 365;

function calcularPlazo(plazo) {
  const hoy = new Date();
  const inicio = new Date(plazo.fechaInicio);
  const diasTranscurridos = Math.max(
    0,
    Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24))
  );
  const diasEfectivos = Math.min(diasTranscurridos, DURACION_DIAS);
  const intereses = plazo.monto * (plazo.tna / 100) * (diasEfectivos / DURACION_DIAS);
  return plazo.monto + intereses;
}

function calcularCrypto(position, prices) {
  const precio = prices[position.activo]?.usd ?? 0;
  const monto = position.cantidad * precio;
  let montoStaking = 0;
  if (position.staking && position.tnaStaking > 0) {
    const hoy = new Date();
    const inicio = new Date(position.fechaInicio);
    const dias = Math.max(0, Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24)));
    montoStaking = monto * (position.tnaStaking / 100) * (dias / 365);
  }
  return monto + montoStaking;
}

router.get('/', async (req, res) => {
  try {
    const [plazos, positions, dolarOficial] = await Promise.all([
      PlazoFijo.find({ estado: 'activo' }),
      CryptoPosition.find(),
      getDolarOficial(),
    ]);

    const totalPlazoARS = plazos.reduce((acc, p) => acc + calcularPlazo(p), 0);
    const totalPlazoUSD = dolarOficial > 0 ? totalPlazoARS / dolarOficial : 0;

    let totalCryptoUSD = 0;
    if (positions.length > 0) {
      const ids = [...new Set(positions.map((p) => p.activo))];
      const prices = await getPrices(ids);
      totalCryptoUSD = positions.reduce((acc, p) => acc + calcularCrypto(p, prices), 0);
    }

    const patrimonioTotalUSD = totalPlazoUSD + totalCryptoUSD;

    res.json({
      dolarOficial: parseFloat(dolarOficial.toFixed(2)),
      plazos: {
        totalARS: parseFloat(totalPlazoARS.toFixed(2)),
        totalUSD: parseFloat(totalPlazoUSD.toFixed(2)),
        count: plazos.length,
      },
      cryptos: {
        totalUSD: parseFloat(totalCryptoUSD.toFixed(2)),
        count: positions.length,
      },
      patrimonioTotalUSD: parseFloat(patrimonioTotalUSD.toFixed(2)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
