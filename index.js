// Importar módulos necesarios
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { config as dotenv } from "dotenv";
import recetasRouter from "./routes/recetas.js";
import rutinaRouter from "./routes/rutina.js";
import serverless from "serverless-http"; // <-- NUEVA LIBRERÍA

dotenv();

// Inicializar la app de Express
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- NUEVA LÓGICA DE CONEXIÓN A MONGODB ---
const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

// Variable global para guardar la conexión y no saturar Mongo
let isConnected = false; 

const connectDB = async () => {
  if (isConnected) {
    return; // Si ya está conectado, no hace nada
  }
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, clientOptions);
    isConnected = db.connections[0].readyState === 1;
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error("Error de conexión a MongoDB:", err);
  }
};

// Middleware: Antes de cualquier petición, se asegura de que haya conexión
app.use(async (req, res, next) => {
  await connectDB();
  next();
});
// ------------------------------------------

// Configuración de rutas (Le agregamos un prefijo /api para ordenarlo mejor en Netlify)
app.use("/api/recetas", recetasRouter.default || recetasRouter);
app.use("/api/rutina", rutinaRouter);

// --- SE ELIMINA EL app.listen(PORT) ---

// Exportar la aplicación envuelta para Netlify
export const handler = serverless(app);