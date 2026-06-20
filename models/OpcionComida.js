import mongoose from "mongoose";

const OpcionComidaSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ["desayuno", "merienda", "colacion1", "colacion2"],
    required: true,
  },
  numero: {
    type: Number,
    required: true,
  },
  titulo: String,
  descripcion: String,
  ingredientes: [String],
  instrucciones: [String],
  calorias: Number,
  proteinas: Number,
  carbohidratos: Number,
  grasas: Number,
  activa: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const OpcionComida = mongoose.model("OpcionComida", OpcionComidaSchema);
