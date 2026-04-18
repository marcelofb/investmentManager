import { Router } from 'express';
import PlazoFijo from '../models/PlazoFijo.js';

const router = Router();
const DURACION_DIAS = 365;
const DIAS_MIN_PRECANCELACION = 30;

function calcularDatos(plazo) {
  const hoy = new Date();
  const inicio = new Date(plazo.fechaInicio);

  const fechaVencimiento = new Date(inicio);
  fechaVencimiento.setDate(fechaVencimiento.getDate() + DURACION_DIAS);

  const diasTranscurridos = Math.max(
    0,
    Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24))
  );
  const diasEfectivos = Math.min(diasTranscurridos, DURACION_DIAS);
  const intereses = plazo.monto * (plazo.tna / 100) * (diasEfectivos / DURACION_DIAS);
  const montoActual = plazo.monto + intereses;
  const precancelable = diasTranscurridos >= DIAS_MIN_PRECANCELACION && diasTranscurridos < DURACION_DIAS;
  const vencido = diasTranscurridos >= DURACION_DIAS;

  return {
    ...plazo.toObject(),
    fechaVencimiento,
    diasTranscurridos: diasEfectivos,
    intereses: parseFloat(intereses.toFixed(2)),
    montoActual: parseFloat(montoActual.toFixed(2)),
    precancelable,
    vencido,
  };
}

// Marca automáticamente como vencidos los plazos activos que ya cumplieron 365 días
async function cerrarVencidos() {
  const hoy = new Date();
  const limite = new Date(hoy);
  limite.setDate(limite.getDate() - DURACION_DIAS);

  const vencidos = await PlazoFijo.find({
    estado: 'activo',
    fechaInicio: { $lte: limite },
  });

  for (const plazo of vencidos) {
    const intereses = plazo.monto * (plazo.tna / 100); // 365/365 = 1
    const montoCobrado = parseFloat((plazo.monto + intereses).toFixed(2));
    const fechaVencimiento = new Date(plazo.fechaInicio);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + DURACION_DIAS);

    await PlazoFijo.findByIdAndUpdate(plazo._id, {
      estado: 'vencido',
      fechaCierre: fechaVencimiento,
      montoCobrado,
    });
  }
}

// GET /api/plazos-fijos — solo activos (con cierre lazy de vencidos)
router.get('/', async (req, res) => {
  try {
    await cerrarVencidos();
    const plazos = await PlazoFijo.find({ estado: 'activo' }).sort({ fechaInicio: -1 });
    res.json(plazos.map(calcularDatos));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/plazos-fijos/historial — precancelados y vencidos
router.get('/historial', async (req, res) => {
  try {
    const historial = await PlazoFijo.find({
      estado: { $in: ['precancelado', 'vencido'] },
    }).sort({ fechaCierre: -1 });
    res.json(historial);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { monto, tna, fechaInicio } = req.body;
    const plazo = new PlazoFijo({ monto, tna, fechaInicio });
    await plazo.save();
    res.status(201).json(calcularDatos(plazo));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { monto, tna, fechaInicio } = req.body;
    const plazo = await PlazoFijo.findByIdAndUpdate(
      req.params.id,
      { monto, tna, fechaInicio },
      { new: true, runValidators: true }
    );
    if (!plazo) return res.status(404).json({ error: 'Plazo fijo no encontrado' });
    res.json(calcularDatos(plazo));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/plazos-fijos/:id/precancelar
router.post('/:id/precancelar', async (req, res) => {
  try {
    const plazo = await PlazoFijo.findById(req.params.id);
    if (!plazo) return res.status(404).json({ error: 'Plazo fijo no encontrado' });
    if (plazo.estado !== 'activo') {
      return res.status(400).json({ error: 'Solo se pueden precancelar plazos activos' });
    }

    const hoy = new Date();
    const inicio = new Date(plazo.fechaInicio);
    const diasTranscurridos = Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24));

    if (diasTranscurridos < DIAS_MIN_PRECANCELACION) {
      return res.status(400).json({ error: `El plazo aún no puede precancelarse (mínimo ${DIAS_MIN_PRECANCELACION} días)` });
    }

    const diasEfectivos = Math.min(diasTranscurridos, DURACION_DIAS);
    const intereses = plazo.monto * (plazo.tna / 100) * (diasEfectivos / DURACION_DIAS);
    const montoCobrado = parseFloat((plazo.monto + intereses).toFixed(2));

    const updated = await PlazoFijo.findByIdAndUpdate(
      plazo._id,
      { estado: 'precancelado', fechaCierre: hoy, montoCobrado },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const plazo = await PlazoFijo.findByIdAndDelete(req.params.id);
    if (!plazo) return res.status(404).json({ error: 'Plazo fijo no encontrado' });
    res.json({ message: 'Eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
