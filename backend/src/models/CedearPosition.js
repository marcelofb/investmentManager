import mongoose from 'mongoose';

const cedearPositionSchema = new mongoose.Schema(
  {
    ticker: { type: String, required: true, trim: true, uppercase: true },
    plataforma: { type: String, required: true, trim: true },
    cantidad: { type: Number, required: true, min: 0 },
    tipo: { type: String, default: 'cedear', enum: ['cedear'] },
  },
  { timestamps: true }
);

export default mongoose.model('CedearPosition', cedearPositionSchema);
