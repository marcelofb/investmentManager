import PlazoFijo from '../models/PlazoFijo.js';
import CryptoPosition from '../models/CryptoPosition.js';
import { getPrices } from './coinGecko.js';
import { getDolarOficial } from './dolarApi.js';

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

function round2(value) {
  return parseFloat(value.toFixed(2));
}

export async function getPatrimonioSnapshot() {
  const [plazos, positions, dolarOficial] = await Promise.all([
    PlazoFijo.find({ estado: 'activo' }),
    CryptoPosition.find(),
    getDolarOficial(),
  ]);

  const totalPlazoARS = plazos.reduce((acc, plazo) => acc + calcularPlazo(plazo), 0);
  const totalPlazoUSD = dolarOficial > 0 ? totalPlazoARS / dolarOficial : 0;

  let totalCryptoUSD = 0;
  if (positions.length > 0) {
    const ids = [...new Set(positions.map((position) => position.activo))];
    const prices = await getPrices(ids);
    totalCryptoUSD = positions.reduce(
      (acc, position) => acc + calcularCrypto(position, prices),
      0
    );
  }

  const patrimonioTotalUSD = totalPlazoUSD + totalCryptoUSD;

  return {
    dolarOficial: round2(dolarOficial),
    plazos: {
      totalARS: round2(totalPlazoARS),
      totalUSD: round2(totalPlazoUSD),
      count: plazos.length,
    },
    cryptos: {
      totalUSD: round2(totalCryptoUSD),
      count: positions.length,
    },
    patrimonioTotalUSD: round2(patrimonioTotalUSD),
  };
}
