import mongoose from 'mongoose';

const dailySnapshotSchema = new mongoose.Schema(
  {
    dateKey: { type: String, required: true, unique: true },
    patrimonioTotalUSD: { type: Number, required: true, min: 0 },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('DailySnapshot', dailySnapshotSchema);
