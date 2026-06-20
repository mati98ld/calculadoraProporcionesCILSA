import mongoose from "mongoose";

const ComidaDiariaSchema = new mongoose.Schema({
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
  diaSemana: {
    type: String,
    enum: ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"],
    required: true,
  },
  esEntrenamiento: {
    type: Boolean,
    default: false,
  },
  horaEntrenamiento: {
    type: String, // "antes17" o "despues18"
    enum: ["antes17", "despues18", "ninguno"],
    default: "ninguno",
  },
  desayuno: {
    opcion: {
      type: Number,
      min: 1,
      max: 6,
    },
    descripcion: String,
    consumido: {
      type: Boolean,
      default: false,
    },
  },
  colacion1: {
    opcion: Number,
    descripcion: String,
    consumido: {
      type: Boolean,
      default: false,
    },
    opcional: {
      type: Boolean,
      default: true,
    },
  },
  almuerzo: {
    grupoAlimentos: {
      proteina: {
        tipo: String, // "carne", "huevo", "pescado"
        cantidad: String,
      },
      verdura: String,
      adicional: String,
    },
    consumido: {
      type: Boolean,
      default: false,
    },
    descripcion: String,
  },
  merienda: {
    opcion: Number,
    descripcion: String,
    consumido: {
      type: Boolean,
      default: false,
    },
  },
  colacion2: {
    opcion: Number,
    descripcion: String,
    consumido: {
      type: Boolean,
      default: false,
    },
    opcional: {
      type: Boolean,
      default: true,
    },
  },
  cena: {
    grupoAlimentos: {
      proteina: {
        tipo: String,
        cantidad: String,
      },
      verdura: String,
    },
    consumido: {
      type: Boolean,
      default: false,
    },
    descripcion: String,
  },
  notasUsuario: String,
  calorias: Number,
  proteinas: Number,
  carbohidratos: Number,
  grasas: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const ComidaDiaria = mongoose.model("ComidaDiaria", ComidaDiariaSchema);
