import mongoose from "mongoose";

const OpcionAlmuerzoCenaSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ["almuerzo", "cena"],
    required: true,
  },
  numero: {
    type: Number,
    required: true,
  },
  titulo: String,
  descripcion: String,
  proteina: {
    tipo: {
      type: String,
      enum: ["carne_vacuna", "pollo", "pescado", "cerdo", "huevo"],
    },
    opciones: [String],
    cantidadGr: Number,
  },
  verdura: String,
  adicional: {
    tipo: String,
    descripcion: String,
    opcional: Boolean,
  },
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

export const OpcionAlmuerzoCena = mongoose.model("OpcionAlmuerzoCena", OpcionAlmuerzoCenaSchema);
