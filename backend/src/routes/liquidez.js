import { Router } from 'express';
import { getLiquidityRecord, upsertLiquidityRecord } from '../services/liquidezService.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const liquidity = await getLiquidityRecord();
    res.json(liquidity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const { ars, usd } = req.body ?? {};
    const liquidity = await upsertLiquidityRecord({ ars, usd });
    res.json(liquidity);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
