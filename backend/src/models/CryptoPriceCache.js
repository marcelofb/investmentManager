import mongoose from 'mongoose';

const cryptoPriceCacheSchema = new mongoose.Schema(
  {
    activo: { type: String, required: true, unique: true, trim: true, lowercase: true },
    usd: { type: Number, required: true, min: 0 },
    fetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('CryptoPriceCache', cryptoPriceCacheSchema);
