import { Router } from 'express';
import { getPatrimonioSnapshot } from '../services/patrimonioService.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const snapshot = await getPatrimonioSnapshot();
    res.json(snapshot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
