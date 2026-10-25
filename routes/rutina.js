import express from "express";
import { ComidaDiaria } from "../models/ComidaDiaria.js";
import { ProgresoDiario } from "../models/ProgresoDiario.js";
import { Rutina } from "../models/Rutina.js";
import { Receta } from "../models/Receta.js";
import {
  horarios,
  opcionesDesayuno,
  opcionesMerienda,
  notasDesayuno,
  notasMerienda,
  colacion1Opciones,
  colacion2Opciones,
  notaColaciones,
  distribucionSemanal,
  DIAS_ORDENADOS,
  proteinas,
  ELECCIONES_VALIDAS,
  MAX_VACA_SEMANAL,
  extrasEntrenamiento,
  caldoOpcional,
  construirGuia,
} from "../data/planAlimentario.js";

const router = express.Router();

// Mapeos de las opciones según el plan de alimentación (ver data/planAlimentario.js)
const toLista = (obj) =>
  Object.entries(obj).map(([numero, opcion]) => ({
    numero: Number(numero),
    ...(typeof opcion === "string" ? { descripcion: opcion } : opcion),
  }));

const opcionesDesayunoLista = toLista(opcionesDesayuno).map((o) => ({
  ...o,
  notas: [...(o.notas || []), ...notasDesayuno],
}));
const opcionesMeriendaLista = toLista(opcionesMerienda).map((o) => ({
  ...o,
  notas: [...(o.notas || []), ...notasMerienda],
}));
const colacion1OpcionesLista = toLista(colacion1Opciones);
const colacion2OpcionesLista = toLista(colacion2Opciones);

const opcionesRutina = {
  desayuno: opcionesDesayunoLista,
  merienda: opcionesMeriendaLista,
  colacion1: colacion1OpcionesLista,
  colacion2: colacion2OpcionesLista,
};

const formatearExtras = (extras) => {
  if (!extras) return undefined;
  const partes = [
    `${extras.titulo}: ${extras.opciones.join(", ")}.`,
    extras.opcional,
  ];
  if (extras.milanesas) partes.push(extras.milanesas);
  return partes.filter(Boolean).join(" ");
};

// Extras estructurados (según horario de entrenamiento) para almuerzo / cena
const obtenerExtrasEntrenamiento = (diaSemana, horaEntrenamiento, tipoComida) => {
  const aplica =
    (tipoComida === "almuerzo" && horaEntrenamiento === "antes17") ||
    (tipoComida === "cena" && horaEntrenamiento === "despues18");
  if (!aplica) return null;

  const dist = (distribucionSemanal[diaSemana] || {})[tipoComida];
  const base = extrasEntrenamiento[tipoComida];
  const esCarne = dist === "rojo" || dist === "mixto";
  const quien = dist === "mixto" ? "la CARNE o el HUEVO" : esCarne ? "la CARNE" : "el HUEVO";

  return {
    titulo: base.titulo,
    opciones: base.opciones,
    opcional: `Opcional: el día que sumás estos alimentos podés NO consumir ${quien}.`,
    milanesas: esCarne ? extrasEntrenamiento.milanesas : null,
  };
};

const obtenerCarbsEntrenamiento = (diaSemana, horaEntrenamiento, tipoComida) => {
  if (horaEntrenamiento === "ninguno") return undefined;
  return formatearExtras(obtenerExtrasEntrenamiento(diaSemana, horaEntrenamiento, tipoComida));
};

const obtenerProteinaPorDefecto = (tipoDist) => {
  if (tipoDist === "amarillo") {
    return { tipo: "huevo", cantidad: "Hasta 3 claras (solo 1 yema por día)", eleccion: "huevo" };
  } else if (tipoDist === "rojo") {
    return { tipo: "carne", cantidad: "160-180gr" };
  } else if (tipoDist === "mixto") {
    return { tipo: "mixto", cantidad: "Flexible (Carne 160-180g o Huevo)" };
  }
  return { tipo: "carne", cantidad: "160-180gr" };
};

// Datos del plan que acompañan a las respuestas de rutina diaria
const datosPlanDelDia = (comidaDiaria) => ({
  horarios,
  extras: {
    almuerzo: obtenerExtrasEntrenamiento(comidaDiaria.diaSemana, comidaDiaria.horaEntrenamiento, "almuerzo"),
    cena: obtenerExtrasEntrenamiento(comidaDiaria.diaSemana, comidaDiaria.horaEntrenamiento, "cena"),
  },
  caldoOpcional,
  notaColaciones,
});

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

// GET: Guía completa del plan de alimentación (consejos, horarios, reglas, recetas)
router.get("/plan", (_req, res) => {
  res.json({ success: true, data: construirGuia() });
});

// GET: Obtener progreso del día (debe declararse antes de "/:usuarioId/:fecha")

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

// Devuelve el lunes (UTC) de la semana de una fecha
const inicioDeSemana = (fecha) => {
  const f = new Date(fecha);
  const base = new Date(Date.UTC(f.getUTCFullYear(), f.getUTCMonth(), f.getUTCDate()));
  const diff = (base.getUTCDay() + 6) % 7; // lunes = 0
  return new Date(base.getTime() - diff * 24 * 60 * 60 * 1000);
};

const eleccionDe = (comida) => comida?.grupoAlimentos?.proteina?.eleccion || null;

// Cuenta las comidas con carne vacuna elegidas en la semana (opcionalmente excluyendo una comida)
const contarVacaSemana = async (usuarioId, fecha, excluir = null) => {
  const lunes = inicioDeSemana(fecha);
  const dias = await ComidaDiaria.find({
    usuarioId,
    fecha: { $gte: lunes, $lt: new Date(lunes.getTime() + 7 * 24 * 60 * 60 * 1000) },
  });
  let total = 0;
  for (const d of dias) {
    for (const tipo of ["almuerzo", "cena"]) {
      if (excluir && String(d._id) === String(excluir.id) && tipo === excluir.tipoComida) continue;
      if (eleccionDe(d[tipo]) === "vaca") total++;
    }
  }
  return total;
};

// GET: Resumen de la semana (distribución almuerzo/cena + control de carne vacuna)
router.get("/semana/:usuarioId/:fecha", async (req, res) => {
  try {
    const { usuarioId, fecha } = req.params;
    const lunes = inicioDeSemana(fecha);
    const registros = await ComidaDiaria.find({
      usuarioId,
      fecha: { $gte: lunes, $lt: new Date(lunes.getTime() + 7 * 24 * 60 * 60 * 1000) },
    });

    let vacaUsada = 0;
    const dias = DIAS_ORDENADOS.map((dia, i) => {
      const fechaDia = new Date(lunes.getTime() + i * 24 * 60 * 60 * 1000);
      const registro = registros.find((r) => r.diaSemana === dia);
      const almuerzoEleccion = eleccionDe(registro?.almuerzo);
      const cenaEleccion = eleccionDe(registro?.cena);
      if (almuerzoEleccion === "vaca") vacaUsada++;
      if (cenaEleccion === "vaca") vacaUsada++;
      const progreso = registro ? calcularProgreso(registro) : null;
      return {
        dia,
        fecha: fechaDia.toISOString().slice(0, 10),
        distribucion: distribucionSemanal[dia],
        esEntrenamiento: Boolean(registro?.esEntrenamiento),
        registrado: Boolean(registro),
        porcentaje: progreso ? Math.round(progreso.porcentajeComplecion) : 0,
        almuerzoEleccion,
        cenaEleccion,
      };
    });

    res.json({
      success: true,
      data: {
        desde: lunes.toISOString().slice(0, 10),
        dias,
        vaca: { usada: vacaUsada, maxima: MAX_VACA_SEMANAL },
      },
    });
  } catch (error) {
    console.error("Error al obtener resumen semanal:", error);
    res.status(500).json({ success: false, error: "Error al obtener el resumen semanal" });
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
      plan: datosPlanDelDia(comidaDiaria),
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
      plan: datosPlanDelDia(comidaDiaria),
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

    const tiposValidos = ["desayuno", "colacion1", "almuerzo", "merienda", "colacion2", "cena", "entrenamiento"];
    if (!tiposValidos.includes(tipoComida)) {
      return res.status(400).json({ success: false, error: "Tipo de comida no válido" });
    }

    const actualizacion = {
      [`${tipoComida}.consumido`]: Boolean(consumido),
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




// PATCH: Cambiar opción de comida (desayuno, merienda, etc.) y recalcular progreso
router.patch("/:id/actualizar-opcion", async (req, res) => {
  try {
    const { id } = req.params;
    const { tipoComida, opcion } = req.body; // tipoComida: "desayuno" | "merienda" | "colacion1" | "colacion2", opcion: número

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
    } else if (tipoComida === "colacion1" || tipoComida === "colacion2") {
      const catalogo = tipoComida === "colacion1" ? colacion1Opciones : colacion2Opciones;
      if (!catalogo[opcion]) {
        return res.status(400).json({ success: false, error: "Opción de colación inválida" });
      }
      descripcion = catalogo[opcion];
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

// PATCH: Elegir el tipo de proteína de almuerzo/cena respetando las reglas del plan
router.patch("/:id/elegir-proteina", async (req, res) => {
  try {
    const { id } = req.params;
    const { tipoComida, eleccion } = req.body;

    if (!["almuerzo", "cena"].includes(tipoComida)) {
      return res.status(400).json({ success: false, error: "Solo se puede elegir proteína en almuerzo o cena" });
    }
    if (eleccion && !ELECCIONES_VALIDAS.includes(eleccion)) {
      return res.status(400).json({ success: false, error: "Proteína no válida" });
    }

    const actual = await ComidaDiaria.findById(id);
    if (!actual) {
      return res.status(404).json({ success: false, error: "Rutina no encontrada" });
    }

    if (eleccion) {
      const dist = distribucionSemanal[actual.diaSemana]?.[tipoComida];
      if (dist === "amarillo" && eleccion !== "huevo") {
        return res.status(400).json({ success: false, error: "Esta comida corresponde a huevo (amarillo) según tu plan" });
      }
      if (dist === "rojo" && eleccion === "huevo") {
        return res.status(400).json({ success: false, error: "Esta comida corresponde a carne (rojo) según tu plan" });
      }
      if (eleccion === "vaca") {
        if (tipoComida === "cena") {
          return res.status(400).json({ success: false, error: "La carne vacuna no está permitida en la cena" });
        }
        const usadas = await contarVacaSemana(actual.usuarioId, actual.fecha, { id, tipoComida });
        if (usadas >= MAX_VACA_SEMANAL) {
          return res.status(400).json({
            success: false,
            error: `Ya usaste las ${MAX_VACA_SEMANAL} comidas de carne vacuna de esta semana`,
          });
        }
      }
    }

    const actualizacion = {
      [`${tipoComida}.grupoAlimentos.proteina.eleccion`]: eleccion || null,
      updatedAt: new Date(),
    };
    if (!actual[tipoComida]?.recetaNombre) {
      const etiqueta = eleccion ? proteinas[eleccion].label : null;
      if (etiqueta) {
        actualizacion[`${tipoComida}.descripcion`] = `${etiqueta} + verdura`;
      }
    }

    const comidaDiaria = await ComidaDiaria.findByIdAndUpdate(id, actualizacion, { new: true });
    res.json({
      success: true,
      message: eleccion ? `Proteína elegida: ${proteinas[eleccion].label}` : "Proteína desmarcada",
      data: comidaDiaria,
    });
  } catch (error) {
    console.error("Error al elegir proteína:", error);
    res.status(500).json({ success: false, error: "Error al elegir la proteína" });
  }
});

// PATCH: Guardar las notas del día (diario alimentario / registro del ejercicio)
router.patch("/:id/notas", async (req, res) => {
  try {
    const { id } = req.params;
    const notas = typeof req.body.notas === "string" ? req.body.notas.slice(0, 2000) : "";
    const comidaDiaria = await ComidaDiaria.findByIdAndUpdate(
      id,
      { notasUsuario: notas, updatedAt: new Date() },
      { new: true }
    );
    if (!comidaDiaria) {
      return res.status(404).json({ success: false, error: "Rutina no encontrada" });
    }
    res.json({ success: true, message: "Notas guardadas", data: comidaDiaria });
  } catch (error) {
    console.error("Error al guardar notas:", error);
    res.status(500).json({ success: false, error: "Error al guardar las notas" });
  }
});


export default router;
