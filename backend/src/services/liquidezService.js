import Liquidez from '../models/Liquidez.js';

export function calculateLiquidityUSD(liquidity = {}, officialRate = 0) {
  const ars = Number(liquidity.ars ?? 0);
  const usd = Number(liquidity.usd ?? 0);

  if (!Number.isFinite(ars) || !Number.isFinite(usd)) return 0;
  if (!Number.isFinite(officialRate) || officialRate <= 0) return usd;

  return parseFloat((ars / officialRate + usd).toFixed(2));
}

export async function getLiquidityRecord() {
  const record = await Liquidez.findOne().lean();

  return {
    ars: Number(record?.ars ?? 0),
    usd: Number(record?.usd ?? 0),
    updatedAt: record?.updatedAt ?? null,
  };
}

export async function upsertLiquidityRecord(data = {}) {
  const payload = {
    ars: Number(data.ars ?? 0),
    usd: Number(data.usd ?? 0),
  };

  let record = await Liquidez.findOne();

  if (!record) {
    record = await Liquidez.create(payload);
    return record.toObject();
  }

  record.set(payload);
  await record.save();
  return record.toObject();
}
