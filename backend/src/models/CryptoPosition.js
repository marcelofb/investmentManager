import mongoose from 'mongoose';

const cryptoPositionSchema = new mongoose.Schema(
  {
    activo: { type: String, required: true, trim: true, lowercase: true },
    plataforma: { type: String, required: true, trim: true },
    cantidad: { type: Number, required: true, min: 0 },
    staking: { type: Boolean, default: false },
    tnaStaking: { type: Number, default: 0, min: 0 },
    fechaInicio: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('CryptoPosition', cryptoPositionSchema);
