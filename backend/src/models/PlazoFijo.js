import mongoose from 'mongoose';

const plazoFijoSchema = new mongoose.Schema(
  {
    monto: { type: Number, required: true, min: 0 },
    tna: { type: Number, required: true, min: 0 },
    fechaInicio: { type: Date, required: true },
    estado: {
      type: String,
      enum: ['activo', 'precancelado', 'vencido'],
      default: 'activo',
    },
    fechaCierre: { type: Date, default: null },
    montoCobrado: { type: Number, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('PlazoFijo', plazoFijoSchema);
