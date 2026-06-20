import mongoose from "mongoose";

// Este archivo se usa para referencias generales del usuario sobre su rutina
const RutinaSchema = new mongoose.Schema({
  usuarioId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  nombre: String,
  email: String,
  fechaInicio: {
    type: Date,
    default: Date.now,
  },
  objetivos: [String], // ["perder_peso", "ganar_musculo", "mejorar_salud"]
  restricciones: [String], // ["sin_lactosa", "vegetariano", "alergias"]
  diasEntrenamiento: [String], // ["lunes", "miercoles", "viernes"]
  horaPreferidaEntrenamiento: String, // "antes17" o "despues18"
  caloriasDiarias: Number,
  macronutrientes: {
    proteinas: Number,
    carbohidratos: Number,
    grasas: Number,
  },
  preferenciasDesayuno: [Number], // números de opciones preferidas
  preferenaciasMerienda: [Number],
  notasNutricionista: String,
  activo: {
    type: Boolean,
    default: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Rutina = mongoose.model("Rutina", RutinaSchema);
