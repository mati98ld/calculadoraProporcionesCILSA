import express from "express";
import { ComidaDiaria } from "../models/ComidaDiaria.js";
import { ProgresoDiario } from "../models/ProgresoDiario.js";
import { Rutina } from "../models/Rutina.js";
import { Receta } from "../models/Receta.js";

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

const opcionesDesayunoLista = Object.entries(opcionesDesayuno).map(
  ([numero, opcion]) => ({
    numero: Number(numero),
    ...opcion,
  })
);

const opcionesMeriendaLista = Object.entries(opcionesMerienda).map(
  ([numero, opcion]) => ({
    numero: Number(numero),
    ...opcion,
  })
);

const colacion1OpcionesLista = Object.entries(colacion1Opciones).map(
  ([numero, descripcion]) => ({
    numero: Number(numero),
    descripcion,
  })
);

const colacion2OpcionesLista = Object.entries(colacion2Opciones).map(
  ([numero, descripcion]) => ({
    numero: Number(numero),
    descripcion,
  })
);

const opcionesRutina = {
  desayuno: opcionesDesayunoLista,
  merienda: opcionesMeriendaLista,
  colacion1: colacion1OpcionesLista,
  colacion2: colacion2OpcionesLista,
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

const obtenerCarbsEntrenamiento = (diaSemana, horaEntrenamiento, tipoComida) => {
  if (horaEntrenamiento === "ninguno") return undefined;

  const distribucion = distribucionSemanal[diaSemana] || {};
  const tipoProteina = distribucion[tipoComida];
  const esCarne = tipoProteina === "rojo" || tipoProteina === "mixto";

  if (tipoComida === "almuerzo" && horaEntrenamiento === "antes17") {
    let base = "Extra por entrenamiento: 1/2 taza legumbres/arroz integral/choclo, 1 porción tarta (pollo y espinaca), 1 cuadradito pastel de papas, 1 hamburguesa vegana, 1 papa o 1 batata.";
    if (esCarne) {
      base += " Opcional: Milanesas al horno (reemplaza carbohidratos extras) o NO consumir carne hoy (comida diferente).";
    } else {
      base += " Opcional: NO consumir huevo hoy (comida diferente).";
    }
    return base;
  }

  if (tipoComida === "cena" && horaEntrenamiento === "despues18") {
    let base = "Extra por entrenamiento: 1/2 taza legumbres/arroz integral, o 1 hamburguesa vegana.";
    if (esCarne) {
      base += " Opcional: Milanesas al horno (reemplaza carbohidratos extras) o NO consumir carne hoy (comida diferente).";
    } else {
      base += " Opcional: NO consumir huevo hoy (comida diferente).";
    }
    return base;
  }

  return undefined;
};

const obtenerProteinaPorDefecto = (tipoDist) => {
  if (tipoDist === "amarillo") {
    return { tipo: "huevo", cantidad: "Hasta 3 claras y 1 yema" };
  } else if (tipoDist === "rojo") {
    return { tipo: "carne", cantidad: "160-180gr" };
  } else if (tipoDist === "mixto") {
    return { tipo: "mixto", cantidad: "Flexible (Carne 160-180g o Huevo)" };
  }
  return { tipo: "carne", cantidad: "160-180gr" };
};

const calcularProgreso = (comidaDiaria) => {
  let totalComidas = 0;
  let comidasConsumidas = 0;

  const sumarSiCorresponde = (incluida, consumida) => {
    if (!incluida) return;
    totalComidas++;
    if (consumida) comidasConsumidas++;
  };

  sumarSiCorresponde(Boolean(comidaDiaria.desayuno?.opcion), comidaDiaria.desayuno?.consumido);
  sumarSiCorresponde(Boolean(comidaDiaria.merienda?.opcion), comidaDiaria.merienda?.consumido);
  sumarSiCorresponde(Boolean(comidaDiaria.almuerzo?.grupoAlimentos), comidaDiaria.almuerzo?.consumido);
  sumarSiCorresponde(Boolean(comidaDiaria.cena?.grupoAlimentos), comidaDiaria.cena?.consumido);
  sumarSiCorresponde(comidaDiaria.colacion1?.opcional === false, comidaDiaria.colacion1?.consumido);
  sumarSiCorresponde(comidaDiaria.colacion2?.opcional === false, comidaDiaria.colacion2?.consumido);
  sumarSiCorresponde(Boolean(comidaDiaria.entrenamiento?.requerido), comidaDiaria.entrenamiento?.consumido);

  const porcentajeComplecion =
    totalComidas > 0 ? (comidasConsumidas / totalComidas) * 100 : 0;

  return { totalComidas, comidasConsumidas, porcentajeComplecion };
};

const crearEntrenamiento = (requerido) => ({
  requerido: Boolean(requerido),
  consumido: false,
  descripcion: requerido ? "Ir al gimnasio" : "",
});

router.get("/perfiles", async (_req, res) => {
  try {
    const docsRutinas = await Rutina.find().select("usuarioId").lean();
    const docsComidas = await ComidaDiaria.find().select("usuarioId").lean();

    const perfilesRutinas = docsRutinas.map(r => r.usuarioId).filter(Boolean);
    const perfilesComidas = docsComidas.map(c => c.usuarioId).filter(Boolean);

    const todosPerfiles = Array.from(new Set([...perfilesRutinas, ...perfilesComidas]));

    res.json({
      success: true,
      data: todosPerfiles.sort((a, b) => a.localeCompare(b, "es")),
    });
  } catch (error) {
    console.error("Error al obtener perfiles:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener los perfiles: " + error.message,
      stack: error.stack,
    });
  }
});

// GET: Obtener la configuración general de rutina
router.get("/config/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const rutinaConfig = await Rutina.findOne({ usuarioId });
    res.json({
      success: true,
      data: rutinaConfig
    });
  } catch (error) {
    console.error("Error al obtener config de rutina:", error);
    res.status(500).json({ success: false, error: "Error al obtener la configuración" });
  }
});

// POST: Crear/Actualizar la configuración general de rutina del usuario
router.post("/config", async (req, res) => {
  try {
    const { usuarioId, objetivos, diasEntrenamiento, horaPreferidaEntrenamiento } = req.body;

    const objetivosArray = Array.isArray(objetivos)
      ? objetivos
      : typeof objetivos === "string"
        ? objetivos.split(",").map(s => s.trim()).filter(Boolean)
        : [];

    const rutinaConfig = await Rutina.findOneAndUpdate(
      { usuarioId },
      {
        usuarioId,
        nombre: usuarioId,
        objetivos: objetivosArray,
        diasEntrenamiento: Array.isArray(diasEntrenamiento) ? diasEntrenamiento : [],
        horaPreferidaEntrenamiento: horaPreferidaEntrenamiento || "ninguno",
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Si hoy hay un registro de ComidaDiaria creado, actualizar si es entrenamiento o no
    const localDateString = new Date().toLocaleString("en-US", { timeZone: "America/Buenos_Aires" });
    const hoyLocal = new Date(localDateString);
    const diaSemana = [
      "domingo",
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado",
    ][hoyLocal.getDay()];

    const fechaInicioHoy = new Date(Date.UTC(hoyLocal.getFullYear(), hoyLocal.getMonth(), hoyLocal.getDate()));
    const comidaDiaria = await ComidaDiaria.findOne({
      usuarioId,
      fecha: {
        $gte: fechaInicioHoy,
        $lt: new Date(fechaInicioHoy.getTime() + 24 * 60 * 60 * 1000),
      }
    });

    if (comidaDiaria) {
      const esEntrenamientoHoy = (diasEntrenamiento || []).includes(diaSemana);
      comidaDiaria.esEntrenamiento = esEntrenamientoHoy;
      comidaDiaria.entrenamiento = crearEntrenamiento(esEntrenamientoHoy);
      const horaEntrenamientoHoy = esEntrenamientoHoy ? (horaPreferidaEntrenamiento || "ninguno") : "ninguno";
      comidaDiaria.horaEntrenamiento = horaEntrenamientoHoy;

      // Actualizar carbohidratos adicionales
      if (comidaDiaria.almuerzo && comidaDiaria.almuerzo.grupoAlimentos) {
        comidaDiaria.almuerzo.grupoAlimentos.adicional = obtenerCarbsEntrenamiento(
          diaSemana,
          horaEntrenamientoHoy,
          "almuerzo"
        );
      }
      if (comidaDiaria.cena && comidaDiaria.cena.grupoAlimentos) {
        comidaDiaria.cena.grupoAlimentos.adicional = obtenerCarbsEntrenamiento(
          diaSemana,
          horaEntrenamientoHoy,
          "cena"
        );
      }

      await comidaDiaria.save();

      // Recalcular progreso
      const progresoCalculado = calcularProgreso(comidaDiaria);
      await ProgresoDiario.findOneAndUpdate(
        {
          usuarioId,
          fecha: {
            $gte: comidaDiaria.fecha,
            $lt: new Date(comidaDiaria.fecha.getTime() + 24 * 60 * 60 * 1000),
          },
        },
        {
          usuarioId,
          fecha: comidaDiaria.fecha,
          totalComidas: progresoCalculado.totalComidas,
          comidasConsumidas: progresoCalculado.comidasConsumidas,
          porcentajeComplecion: progresoCalculado.porcentajeComplecion,
          updatedAt: new Date(),
        },
        { upsert: true }
      );
    }

    res.json({
      success: true,
      message: "Configuración de rutina guardada correctamente",
      data: rutinaConfig
    });
  } catch (error) {
    console.error("Error al guardar config de rutina:", error);
    res.status(500).json({ success: false, error: "Error al guardar la configuración" });
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
    ][fechaObj.getUTCDay()];

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
      // Buscar si el usuario tiene una configuración general de rutina
      const configGeneral = await Rutina.findOne({ usuarioId });

      let esEntrenamientoHoy = false;
      let horaEntrenamientoHoy = "ninguno";

      if (configGeneral) {
        esEntrenamientoHoy = Array.isArray(configGeneral.diasEntrenamiento) && configGeneral.diasEntrenamiento.includes(diaSemana);
        horaEntrenamientoHoy = esEntrenamientoHoy ? (configGeneral.horaPreferidaEntrenamiento || "ninguno") : "ninguno";
      }

      // Definir carbohidratos extras de entrenamiento según el horario y día
      const almuerzoAdicional = obtenerCarbsEntrenamiento(diaSemana, horaEntrenamientoHoy, "almuerzo");
      const cenaAdicional = obtenerCarbsEntrenamiento(diaSemana, horaEntrenamientoHoy, "cena");

      const distHoy = distribucionSemanal[diaSemana] || { almuerzo: "rojo", cena: "amarillo" };
      const protAlmuerzo = obtenerProteinaPorDefecto(distHoy.almuerzo);
      const protCena = obtenerProteinaPorDefecto(distHoy.cena);

      comidaDiaria = new ComidaDiaria({
        usuarioId,
        fecha: fechaObj,
        diaSemana,
        esEntrenamiento: esEntrenamientoHoy,
        entrenamiento: crearEntrenamiento(esEntrenamientoHoy),
        horaEntrenamiento: horaEntrenamientoHoy,
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
            proteina: protAlmuerzo,
            verdura: "Hoja fresca libre",
            adicional: almuerzoAdicional,
          },
          descripcion: distHoy.almuerzo === "mixto" ? "Opción flexible (carne o huevo) + verdura" : `${protAlmuerzo.tipo === "carne" ? "Carne" : "Huevo"} + verdura`,
        },
        cena: {
          grupoAlimentos: {
            proteina: protCena,
            verdura: "Hoja fresca libre",
            adicional: cenaAdicional,
          },
          descripcion: `${protCena.tipo === "carne" ? "Carne" : "Huevo"} + verdura`,
        },
      });

      await comidaDiaria.save();
    } else {
      // Sincronizar dinámicamente si ya existe comidaDiaria pero la configuración general cambió o faltan los adicionales
      const configGeneral = await Rutina.findOne({ usuarioId });
      if (configGeneral) {
        const esEntrenamientoHoy = Array.isArray(configGeneral.diasEntrenamiento) && configGeneral.diasEntrenamiento.includes(diaSemana);
        const horaEntrenamientoHoy = esEntrenamientoHoy ? (configGeneral.horaPreferidaEntrenamiento || "ninguno") : "ninguno";

        const almuerzoAdicional = obtenerCarbsEntrenamiento(diaSemana, horaEntrenamientoHoy, "almuerzo");
        const cenaAdicional = obtenerCarbsEntrenamiento(diaSemana, horaEntrenamientoHoy, "cena");

        let necesitaGuardar = false;

        if (comidaDiaria.esEntrenamiento !== esEntrenamientoHoy) {
          comidaDiaria.esEntrenamiento = esEntrenamientoHoy;
          comidaDiaria.entrenamiento = crearEntrenamiento(esEntrenamientoHoy);
          necesitaGuardar = true;
        }

        if (comidaDiaria.horaEntrenamiento !== horaEntrenamientoHoy) {
          comidaDiaria.horaEntrenamiento = horaEntrenamientoHoy;
          necesitaGuardar = true;
        }

        if (comidaDiaria.almuerzo) {
          if (!comidaDiaria.almuerzo.grupoAlimentos) {
            comidaDiaria.almuerzo.grupoAlimentos = {};
          }
          if (comidaDiaria.almuerzo.grupoAlimentos.adicional !== almuerzoAdicional) {
            comidaDiaria.almuerzo.grupoAlimentos.adicional = almuerzoAdicional;
            necesitaGuardar = true;
          }
        }

        if (comidaDiaria.cena) {
          if (!comidaDiaria.cena.grupoAlimentos) {
            comidaDiaria.cena.grupoAlimentos = {};
          }
          if (comidaDiaria.cena.grupoAlimentos.adicional !== cenaAdicional) {
            comidaDiaria.cena.grupoAlimentos.adicional = cenaAdicional;
            necesitaGuardar = true;
          }
        }

        if (necesitaGuardar) {
          comidaDiaria.updatedAt = new Date();
          await comidaDiaria.save();

          // Recalcular progreso diario
          const progresoCalculado = calcularProgreso(comidaDiaria);
          await ProgresoDiario.findOneAndUpdate(
            {
              usuarioId,
              fecha: {
                $gte: comidaDiaria.fecha,
                $lt: new Date(comidaDiaria.fecha.getTime() + 24 * 60 * 60 * 1000),
              },
            },
            {
              usuarioId,
              fecha: comidaDiaria.fecha,
              totalComidas: progresoCalculado.totalComidas,
              comidasConsumidas: progresoCalculado.comidasConsumidas,
              porcentajeComplecion: progresoCalculado.porcentajeComplecion,
              updatedAt: new Date(),
            },
            { upsert: true }
          );
        }
      }
    }

    res.json({
      success: true,
      data: comidaDiaria,
      opciones: opcionesRutina,
      colacionesOpcionales: {
        colacion1: true,
        colacion2: true,
      },
      distribucion: distribucionSemanal[diaSemana],
    });
  } catch (error) {
    console.error("Error al obtener rutina:", error);
    res
      .status(500)
      .json({ success: false, error: "Error al obtener la rutina: " + error.message, stack: error.stack });
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
      colacion1Opcion,
      colacion2Opcion,
      incluirColacion1 = false,
      incluirColacion2 = false,
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
    ][fechaObj.getUTCDay()];

    let comidaDiaria = await ComidaDiaria.findOne({
      usuarioId,
      fecha: {
        $gte: new Date(fecha),
        $lt: new Date(new Date(fecha).getTime() + 24 * 60 * 60 * 1000),
      },
    });

    const horaEntrenamientoReal = esEntrenamiento ? (horaEntrenamiento || "ninguno") : "ninguno";
    const almuerzoAdicional = obtenerCarbsEntrenamiento(diaSemana, horaEntrenamientoReal, "almuerzo");
    const cenaAdicional = obtenerCarbsEntrenamiento(diaSemana, horaEntrenamientoReal, "cena");

    if (!comidaDiaria) {
      const distHoy = distribucionSemanal[diaSemana] || { almuerzo: "rojo", cena: "amarillo" };
      const protAlmuerzo = obtenerProteinaPorDefecto(distHoy.almuerzo);
      const protCena = obtenerProteinaPorDefecto(distHoy.cena);

      comidaDiaria = new ComidaDiaria({
        usuarioId,
        fecha: fechaObj,
        diaSemana,
        esEntrenamiento,
        horaEntrenamiento: horaEntrenamientoReal,
        entrenamiento: crearEntrenamiento(esEntrenamiento),
        desayuno: {
          opcion: desayunoOpcion || 1,
          descripcion: opcionesDesayuno[desayunoOpcion || 1].descripcion,
        },
        merienda: {
          opcion: meriendaOpcion || 1,
          descripcion: opcionesMerienda[meriendaOpcion || 1].descripcion,
        },
        colacion1: colacion1 || (incluirColacion1 && colacion1Opcion
          ? { opcion: colacion1Opcion, descripcion: colacion1Opciones[colacion1Opcion], opcional: false }
          : { opcional: true }),
        colacion2: colacion2 || (incluirColacion2 && colacion2Opcion
          ? { opcion: colacion2Opcion, descripcion: colacion2Opciones[colacion2Opcion], opcional: false }
          : { opcional: true }),
        almuerzo: {
          grupoAlimentos: {
            proteina: protAlmuerzo,
            verdura: "Hoja fresca libre",
            adicional: almuerzoAdicional,
          },
          descripcion: distHoy.almuerzo === "mixto" ? "Opción flexible (carne o huevo) + verdura" : `${protAlmuerzo.tipo === "carne" ? "Carne" : "Huevo"} + verdura`,
        },
        cena: {
          grupoAlimentos: {
            proteina: protCena,
            verdura: "Hoja fresca libre",
            adicional: cenaAdicional,
          },
          descripcion: `${protCena.tipo === "carne" ? "Carne" : "Huevo"} + verdura`,
        },
      });
      await comidaDiaria.save();
    } else {
      comidaDiaria.esEntrenamiento = esEntrenamiento;
      comidaDiaria.horaEntrenamiento = horaEntrenamientoReal;
      comidaDiaria.entrenamiento = crearEntrenamiento(esEntrenamiento);
      comidaDiaria.desayuno = {
        opcion: desayunoOpcion || 1,
        descripcion: opcionesDesayuno[desayunoOpcion || 1].descripcion,
      };
      comidaDiaria.merienda = {
        opcion: meriendaOpcion || 1,
        descripcion: opcionesMerienda[meriendaOpcion || 1].descripcion,
      };
      if (colacion1) {
        comidaDiaria.colacion1 = colacion1;
      } else if (incluirColacion1 && colacion1Opcion) {
        comidaDiaria.colacion1 = { opcion: colacion1Opcion, descripcion: colacion1Opciones[colacion1Opcion], opcional: false };
      } else {
        comidaDiaria.colacion1 = { opcional: true };
      }

      if (colacion2) {
        comidaDiaria.colacion2 = colacion2;
      } else if (incluirColacion2 && colacion2Opcion) {
        comidaDiaria.colacion2 = { opcion: colacion2Opcion, descripcion: colacion2Opciones[colacion2Opcion], opcional: false };
      } else {
        comidaDiaria.colacion2 = { opcional: true };
      }

      // Actualizar carbohidratos adicionales
      if (comidaDiaria.almuerzo && comidaDiaria.almuerzo.grupoAlimentos) {
        comidaDiaria.almuerzo.grupoAlimentos.adicional = almuerzoAdicional;
      }
      if (comidaDiaria.cena && comidaDiaria.cena.grupoAlimentos) {
        comidaDiaria.cena.grupoAlimentos.adicional = cenaAdicional;
      }

      await comidaDiaria.save();
    }

    res.json({
      success: true,
      message: "Rutina actualizada correctamente",
      data: comidaDiaria,
      opciones: opcionesRutina,
      colacionesOpcionales: {
        colacion1: true,
        colacion2: true,
      },
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

    const progresoCalculado = calcularProgreso(comidaDiaria);

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
        totalComidas: progresoCalculado.totalComidas,
        comidasConsumidas: progresoCalculado.comidasConsumidas,
        porcentajeComplecion: progresoCalculado.porcentajeComplecion,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: `${tipoComida} marcada como ${consumido ? "consumida" : "no consumida"}`,
      data: comidaDiaria,
      progreso: {
        totalComidas: progresoCalculado.totalComidas,
        comidasConsumidas: progresoCalculado.comidasConsumidas,
        porcentajeComplecion: progresoCalculado.porcentajeComplecion.toFixed(2) + "%",
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



// PATCH: Cambiar opción de comida (desayuno, merienda, etc.) y recalcular progreso
router.patch("/:id/actualizar-opcion", async (req, res) => {
  try {
    const { id } = req.params;
    const { tipoComida, opcion } = req.body; // tipoComida: "desayuno" | "merienda", opcion: número

    let descripcion = "";
    if (tipoComida === "desayuno") {
      if (!opcionesDesayuno[opcion]) {
        return res.status(400).json({ success: false, error: "Opción de desayuno inválida" });
      }
      descripcion = opcionesDesayuno[opcion].descripcion;
    } else if (tipoComida === "merienda") {
      if (!opcionesMerienda[opcion]) {
        return res.status(400).json({ success: false, error: "Opción de merienda inválida" });
      }
      descripcion = opcionesMerienda[opcion].descripcion;
    } else {
      return res.status(400).json({ success: false, error: "Tipo de comida no soportado para cambiar de opción" });
    }

    const actualizacion = {
      [`${tipoComida}.opcion`]: opcion,
      [`${tipoComida}.descripcion`]: descripcion,
      updatedAt: new Date(),
    };

    const comidaDiaria = await ComidaDiaria.findByIdAndUpdate(id, actualizacion, {
      new: true,
    });

    if (!comidaDiaria) {
      return res.status(404).json({ success: false, error: "Rutina no encontrada" });
    }

    const progresoCalculado = calcularProgreso(comidaDiaria);

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
        totalComidas: progresoCalculado.totalComidas,
        comidasConsumidas: progresoCalculado.comidasConsumidas,
        porcentajeComplecion: progresoCalculado.porcentajeComplecion,
        updatedAt: new Date(),
      },
      { upsert: true }
    );

    res.json({
      success: true,
      message: `Opción de ${tipoComida} actualizada correctamente`,
      data: comidaDiaria,
      progreso: {
        totalComidas: progresoCalculado.totalComidas,
        comidasConsumidas: progresoCalculado.comidasConsumidas,
        porcentajeComplecion: progresoCalculado.porcentajeComplecion.toFixed(2) + "%",
      },
    });
  } catch (error) {
    console.error("Error al actualizar opción de comida:", error);
    res.status(500).json({ success: false, error: "Error al actualizar la opción" });
  }
});

// PATCH: Vincular una receta a una comida y actualizar la descripción
router.patch("/:id/vincular-receta", async (req, res) => {
  try {
    const { id } = req.params;
    const { tipoComida, recetaId, recetaNombre } = req.body;

    const validComidas = ["desayuno", "colacion1", "almuerzo", "merienda", "colacion2", "cena"];
    if (!validComidas.includes(tipoComida)) {
      return res.status(400).json({ success: false, error: "Tipo de comida no válido" });
    }

    const actualizacion = {
      [`${tipoComida}.recetaId`]: recetaId || null,
      [`${tipoComida}.recetaNombre`]: recetaNombre || null,
      updatedAt: new Date(),
    };

    if (recetaNombre) {
      actualizacion[`${tipoComida}.descripcion`] = recetaNombre;
    } else {
      // Si desvinculamos, restauramos la descripción por defecto según la comida
      if (tipoComida === "desayuno") {
        actualizacion[`${tipoComida}.descripcion`] = opcionesDesayuno[1].descripcion;
        actualizacion[`${tipoComida}.opcion`] = 1;
      } else if (tipoComida === "merienda") {
        actualizacion[`${tipoComida}.descripcion`] = opcionesMerienda[1].descripcion;
        actualizacion[`${tipoComida}.opcion`] = 1;
      } else if (tipoComida === "colacion1") {
        actualizacion[`${tipoComida}.descripcion`] = colacion1Opciones[1];
        actualizacion[`${tipoComida}.opcion`] = 1;
      } else if (tipoComida === "colacion2") {
        actualizacion[`${tipoComida}.descripcion`] = colacion2Opciones[1];
        actualizacion[`${tipoComida}.opcion`] = 1;
      } else if (tipoComida === "almuerzo" || tipoComida === "cena") {
        // Buscar el día para saber qué día de la semana es y restaurar la descripción correcta
        const cd = await ComidaDiaria.findById(id);
        if (cd) {
          const distHoy = distribucionSemanal[cd.diaSemana] || { almuerzo: "rojo", cena: "amarillo" };
          if (tipoComida === "almuerzo") {
            const protAlmuerzo = obtenerProteinaPorDefecto(distHoy.almuerzo);
            actualizacion[`${tipoComida}.descripcion`] = distHoy.almuerzo === "mixto" ? "Opción flexible (carne o huevo) + verdura" : `${protAlmuerzo.tipo === "carne" ? "Carne" : "Huevo"} + verdura`;
          } else {
            const protCena = obtenerProteinaPorDefecto(distHoy.cena);
            actualizacion[`${tipoComida}.descripcion`] = `${protCena.tipo === "carne" ? "Carne" : "Huevo"} + verdura`;
          }
        } else {
          actualizacion[`${tipoComida}.descripcion`] = tipoComida === "almuerzo" ? "Carne + verdura" : "Huevo + verdura";
        }
      }
    }

    const comidaDiaria = await ComidaDiaria.findByIdAndUpdate(id, actualizacion, {
      new: true,
    });

    if (!comidaDiaria) {
      return res.status(404).json({ success: false, error: "Rutina no encontrada" });
    }

    res.json({
      success: true,
      message: recetaNombre ? `Receta '${recetaNombre}' vinculada correctamente` : "Receta desvinculada",
      data: comidaDiaria,
    });
  } catch (error) {
    console.error("Error al vincular receta:", error);
    res.status(500).json({ success: false, error: "Error al vincular la receta" });
  }
});

export default router;
