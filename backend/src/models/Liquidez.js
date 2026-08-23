import mongoose from 'mongoose';

const liquidezSchema = new mongoose.Schema(
  {
    ars: { type: Number, default: 0, min: 0 },
    usd: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Liquidez', liquidezSchema);
