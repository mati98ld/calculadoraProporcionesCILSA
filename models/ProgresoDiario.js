import mongoose from "mongoose";

const ProgresoDiarioSchema = new mongoose.Schema({
  usuarioId: {
    type: String,
    required: true,
    index: true,
  },
  fecha: {
    type: Date,
    required: true,
    index: true,
  },
  totalComidas: {
    type: Number,
    default: 0,
  },
  comidasConsumidas: {
    type: Number,
    default: 0,
  },
  porcentajeComplecion: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  calorias: {
    planeo: Number,
    consumidas: Number,
  },
  macronutrientes: {
    proteinas: {
      planeo: Number,
      consumidas: Number,
    },
    carbohidratos: {
      planeo: Number,
      consumidas: Number,
    },
    grasas: {
      planeo: Number,
      consumidas: Number,
    },
  },
  accionesRealizadas: [
    {
      comida: String, // "desayuno", "merienda", "almuerzo", etc
      timestamp: Date,
      marcadaConsumida: Boolean,
    },
  ],
  notas: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const ProgresoDiario = mongoose.model("ProgresoDiario", ProgresoDiarioSchema);
