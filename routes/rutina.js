import express from "express";
import { ComidaDiaria } from "../models/ComidaDiaria.js";
import { ProgresoDiario } from "../models/ProgresoDiario.js";

const router = express.Router();

// Mapeos de las opciones según el plan de alimentación
const opcionesDesayuno = {
  1: {
    titulo: "Yogur con semillas y frutas secas",
    descripcion: "Yogur descremado + 14 almendras o 7 nueces + 1 cda semillas",
    calorias: 200,
  },
  2: {
    titulo: "Leche/yogur con mix de frutas",
    descripcion: "Leche/yogur + 1 fruta fresca + 14 almendras o 7 nueces",
    calorias: 220,
  },
  3: {
    titulo: "Café con omelet",
    descripcion: "Café o mate + Omelet (1 huevo + queso port salut)",
    calorias: 180,
  },
  4: {
    titulo: "Yogur con omelet (dulce)",
    descripcion: "Yogur + Omelet (1 huevo + salvado + ½ banana)",
    calorias: 210,
  },
  5: {
    titulo: "Café negro con pan nube",
    descripcion: "Café/mate/té + Pan nube + queso/mermelada/jamón",
    calorias: 190,
  },
  6: {
    titulo: "Opción Libre",
    descripcion: "Consúltalo con tu nutricionista",
    calorias: 200,
  },
};

const opcionesMerienda = {
  1: {
    titulo: "Yogur con cereales y frutas secas",
    descripcion: "Yogur + ¾ taza copos de maíz + 12 almendras o 7 nueces",
    calorias: 220,
  },
  2: {
    titulo: "Yogur con pan integral",
    descripcion: "Yogur descremado + 2 rodajas pan integral + queso opcional",
    calorias: 200,
  },
  3: {
    titulo: "Café cortado con budín integral",
    descripcion: "Café/mate/té cortado con leche + 1-2 rebanada budín",
    calorias: 240,
  },
  4: {
    titulo: "Café con leche con tostadas untadas",
    descripcion: "Café/mate/té + 2 tostadas + queso descremado/mermelada light",
    calorias: 210,
  },
  5: {
    titulo: "Café cortado con pan nube",
    descripcion: "Café/mate/té + ¾ taza leche + pan nube untado",
    calorias: 220,
  },
};

const colacion1Opciones = {
  1: "Café, té o mate (amargo o endulzado)",
  2: "Frutas secas (hasta 10 unidades)",
  3: "Palta (½ unidad)",
  4: "Gelatina light",
  5: "Caldos (caseros o comerciales)",
  6: "Huevo (1 unidad) en omelet o hervido",
  7: "Rollito de lomito y queso (1 feta de cada uno)",
  8: "Aceitunas (3 unidades)",
  9: "Bastoncitos de pechuga de pollo",
};

const colacion2Opciones = {
  1: "Fruta fresca (2-3/día)",
  2: "Yogur (1 vaso o pote)",
  3: "Leche para 'cortar' infusiones",
  4: "Bastoncitos de zanahoria",
  5: "Pickles (3 unidades)",
  6: "Berenjena en vinagre (2 rodajas)",
  7: "Morrón en vinagre (1/2 unidad)",
  8: "Pochoclos (1/2 taza)",
  9: "Almohaditas (1/2 taza)",
};

// Distribución de almuerzo/cena según día de la semana
const distribucionSemanal = {
  lunes: { almuerzo: "amarillo", cena: "rojo" },
  martes: { almuerzo: "rojo", cena: "amarillo" },
  miercoles: { almuerzo: "amarillo", cena: "rojo" },
  jueves: { almuerzo: "rojo", cena: "amarillo" },
  viernes: { almuerzo: "amarillo", cena: "rojo" },
  sabado: { almuerzo: "mixto", cena: "rojo" }, // mixto = puede ser rojo o amarillo
  domingo: { almuerzo: "rojo", cena: "rojo" },
};

// GET: Obtener la rutina de comidas para un día específico
router.get("/:usuarioId/:fecha", async (req, res) => {
  try {
    const { usuarioId, fecha } = req.params;

    // Parsear la fecha (formato: YYYY-MM-DD)
    const fechaObj = new Date(fecha);
    const diaSemana = [
      "domingo",
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado",
    ][fechaObj.getDay()];

    // Buscar si existe rutina para ese día
    let comidaDiaria = await ComidaDiaria.findOne({
      usuarioId,
      fecha: {
        $gte: new Date(fecha),
        $lt: new Date(new Date(fecha).getTime() + 24 * 60 * 60 * 1000),
      },
    });

    // Si no existe, crear una por defecto
    if (!comidaDiaria) {
      comidaDiaria = new ComidaDiaria({
        usuarioId,
        fecha: fechaObj,
        diaSemana,
        esEntrenamiento: false,
        desayuno: {
          opcion: 1,
          descripcion: opcionesDesayuno[1].descripcion,
        },
        colacion1: {
          opcion: 1,
          descripcion: colacion1Opciones[1],
          opcional: true,
        },
        merienda: {
          opcion: 1,
          descripcion: opcionesMerienda[1].descripcion,
        },
        colacion2: {
          opcion: 1,
          descripcion: colacion2Opciones[1],
          opcional: true,
        },
        almuerzo: {
          grupoAlimentos: {
            proteina: { tipo: "carne", cantidad: "160-180gr" },
            verdura: "Hoja fresca libre",
          },
          descripcion: "Selecciona una opción de proteína + verdura",
        },
        cena: {
          grupoAlimentos: {
            proteina: { tipo: "huevo", cantidad: "Hasta 3 claras" },
            verdura: "Hoja fresca libre",
          },
          descripcion: "Claras de huevo + verdura",
        },
      });

      await comidaDiaria.save();
    }

    res.json({
      success: true,
      data: comidaDiaria,
      distribucion: distribucionSemanal[diaSemana],
    });
  } catch (error) {
    console.error("Error al obtener rutina:", error);
    res
      .status(500)
      .json({ success: false, error: "Error al obtener la rutina" });
  }
});

// POST: Crear o actualizar rutina para un día
router.post("/", async (req, res) => {
  try {
    const {
      usuarioId,
      fecha,
      esEntrenamiento,
      horaEntrenamiento,
      desayunoOpcion,
      meriendaOpcion,
      colacion1,
      colacion2,
    } = req.body;

    const fechaObj = new Date(fecha);
    const diaSemana = [
      "domingo",
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado",
    ][fechaObj.getDay()];

    let comidaDiaria = await ComidaDiaria.findOneAndUpdate(
      {
        usuarioId,
        fecha: {
          $gte: new Date(fecha),
          $lt: new Date(new Date(fecha).getTime() + 24 * 60 * 60 * 1000),
        },
      },
      {
        usuarioId,
        fecha: fechaObj,
        diaSemana,
        esEntrenamiento,
        horaEntrenamiento,
        desayuno: {
          opcion: desayunoOpcion || 1,
          descripcion: opcionesDesayuno[desayunoOpcion || 1].descripcion,
        },
        merienda: {
          opcion: meriendaOpcion || 1,
          descripcion: opcionesMerienda[meriendaOpcion || 1].descripcion,
        },
        colacion1,
        colacion2,
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: "Rutina actualizada correctamente",
      data: comidaDiaria,
    });
  } catch (error) {
    console.error("Error al crear/actualizar rutina:", error);
    res.status(500).json({
      success: false,
      error: "Error al crear/actualizar la rutina",
    });
  }
});

// PATCH: Marcar una comida como consumida
router.patch("/:id/marcar-comida", async (req, res) => {
  try {
    const { id } = req.params;
    const { tipoComida, consumido } = req.body;

    const actualizacion = {
      [`${tipoComida}.consumido`]: consumido,
      updatedAt: new Date(),
    };

    const comidaDiaria = await ComidaDiaria.findByIdAndUpdate(id, actualizacion, {
      new: true,
    });

    if (!comidaDiaria) {
      return res
        .status(404)
        .json({ success: false, error: "Rutina no encontrada" });
    }

    // Calcular progreso
    let totalComidas = 0;
    let comidasConsumidas = 0;

    if (comidaDiaria.desayuno?.opcion) totalComidas++;
    if (comidaDiaria.desayuno?.consumido) comidasConsumidas++;

    if (comidaDiaria.merienda?.opcion) totalComidas++;
    if (comidaDiaria.merienda?.consumido) comidasConsumidas++;

    if (comidaDiaria.almuerzo?.grupoAlimentos) totalComidas++;
    if (comidaDiaria.almuerzo?.consumido) comidasConsumidas++;

    if (comidaDiaria.cena?.grupoAlimentos) totalComidas++;
    if (comidaDiaria.cena?.consumido) comidasConsumidas++;

    if (comidaDiaria.colacion1?.opcional === false) {
      totalComidas++;
      if (comidaDiaria.colacion1?.consumido) comidasConsumidas++;
    }

    if (comidaDiaria.colacion2?.opcional === false) {
      totalComidas++;
      if (comidaDiaria.colacion2?.consumido) comidasConsumidas++;
    }

    // Actualizar progreso diario
    const porcentajeComplecion = totalComidas > 0 ? (comidasConsumidas / totalComidas) * 100 : 0;

    await ProgresoDiario.findOneAndUpdate(
      {
        usuarioId: comidaDiaria.usuarioId,
        fecha: {
          $gte: comidaDiaria.fecha,
          $lt: new Date(comidaDiaria.fecha.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      {
        usuarioId: comidaDiaria.usuarioId,
        fecha: comidaDiaria.fecha,
        totalComidas,
        comidasConsumidas,
        porcentajeComplecion,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: `${tipoComida} marcada como ${consumido ? "consumida" : "no consumida"}`,
      data: comidaDiaria,
      progreso: {
        totalComidas,
        comidasConsumidas,
        porcentajeComplecion: porcentajeComplecion.toFixed(2) + "%",
      },
    });
  } catch (error) {
    console.error("Error al marcar comida:", error);
    res.status(500).json({
      success: false,
      error: "Error al marcar la comida",
    });
  }
});

// GET: Obtener progreso del día
router.get("/progreso/:usuarioId/:fecha", async (req, res) => {
  try {
    const { usuarioId, fecha } = req.params;

    const progreso = await ProgresoDiario.findOne({
      usuarioId,
      fecha: {
        $gte: new Date(fecha),
        $lt: new Date(new Date(fecha).getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (!progreso) {
      return res.json({
        success: true,
        data: {
          totalComidas: 0,
          comidasConsumidas: 0,
          porcentajeComplecion: 0,
        },
      });
    }

    res.json({ success: true, data: progreso });
  } catch (error) {
    console.error("Error al obtener progreso:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener el progreso",
    });
  }
});

// GET: Obtener progreso histórico (últimos 7 días)
router.get("/historial/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { dias = 7 } = req.query;

    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - parseInt(dias));

    const historial = await ProgresoDiario.find({
      usuarioId,
      fecha: { $gte: fechaInicio },
    }).sort({ fecha: -1 });

    const porcentajePromedio =
      historial.length > 0
        ? (
            historial.reduce((sum, dia) => sum + dia.porcentajeComplecion, 0) /
            historial.length
          ).toFixed(2)
        : 0;

    res.json({
      success: true,
      data: {
        historial,
        estadisticas: {
          diasRegistrados: historial.length,
          porcentajePromedio,
          diasCompletos: historial.filter((d) => d.porcentajeComplecion === 100)
            .length,
        },
      },
    });
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener el historial",
    });
  }
});

export default router;
