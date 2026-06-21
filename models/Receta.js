import mongoose from "mongoose";

const RecetaSchema = new mongoose.Schema({
  nombreReceta: {
    type: String,
    required: true,
  },
  ingredientes: {
    type: [
      {
        ingrediente: String,
        cantidad: Number,
        unidad: String,
      },
    ],
    required: true,
  },
  descripcion: {
    type: String,
  },
  favorita: {
    type: Boolean,
    default: false,
  },
  esProporcion: {
    type: Boolean,
    default: false,
  },
  original: {
    type: String,
    default: "",
  },
  tipoAlimento: {
    type: String,
    enum: ["proteina", "verdura", "carbohidrato", "mixto", "desayuno_merienda", ""],
    default: "",
  },
});
export const Receta = mongoose.model("Receta", RecetaSchema);
