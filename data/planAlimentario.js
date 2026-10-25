// Datos estructurados del Plan de Alimentación (Método Mura).
// Fuente: PDF "Plan de Alimentación" - Lic. Mariano Muracciole.
// Todo lo que muestra la app como "regla del plan" sale de este archivo.

export const horarios = {
  desayuno: { desde: "07:00", hasta: "08:00", label: "7 hs – 8 hs" },
  colacion1: { desde: "09:00", hasta: "10:00", label: "9 hs – 10 hs" },
  almuerzo: { desde: "12:00", hasta: "13:00", label: "12 hs – 13 hs" },
  merienda: { desde: "15:00", hasta: "16:00", label: "15 hs – 16 hs" },
  entrenamiento: { desde: "17:00", hasta: "17:00", label: "17 hs" },
  colacion2: { desde: "19:00", hasta: "19:00", label: "19 hs" },
  cena: { desde: "20:00", hasta: "21:00", label: "20 hs – 21 hs" },
};

export const notaHorarios =
  "Las colaciones no son obligatorias. La estructura básica del Diario Alimentario Ideal se puede modificar de acuerdo a tus horarios laborales y de ejercicio físico.";

export const opcionesDesayuno = {
  1: {
    titulo: "Yogur con semillas y frutas secas",
    descripcion: "Yogur descremado + 14 almendras o 7 nueces + 1 cda semillas",
    componentes: [
      "Yogur descremado o parcialmente descremado (firme o batido). Sin colchón de frutas, sin cereales",
      "Frutas secas: 14 almendras o 7 nueces mariposa (enteras o pisadas)",
      "Semillas: 1 cda sopera de lino, chía y/o sésamo (sin triturar ni procesar)",
    ],
  },
  2: {
    titulo: "Leche/yogur con mix de frutas",
    descripcion: "Leche/yogur + 1 fruta fresca + 14 almendras o 7 nueces",
    componentes: [
      "Leche o yogur descremado (sin colchón de frutas ni cereales)",
      "1 fruta fresca (manzana, pera o durazno)",
      "Frutas secas: 14 almendras o 7 nueces mariposa (enteras o pisadas)",
      "Opcional: 1 cda sopera de semillas",
    ],
    notas: ["Equivalencia: 1 taza de leche fluida = 25 g de leche en polvo (5 sobres o 2 cdas soperas)."],
  },
  3: {
    titulo: "Infusión con omelet",
    descripcion: "Café o mate cebado + Omelet (1 huevo + queso port salut)",
    componentes: [
      "Infusión: café o mate cebado",
      "Omelet salado: 1 huevo + 1 bastoncito de queso port salut (o 1 feta de queso de máquina)",
    ],
  },
  4: {
    titulo: "Yogur con omelet (dulce)",
    descripcion: "Yogur + Omelet (1 huevo + salvado/avena + ½ banana)",
    componentes: [
      "Yogur descremado o parcialmente descremado (sin colchón de frutas ni cereales)",
      "Omelet dulce: 1 huevo + 2 cdas soperas (20 g) de salvado de trigo o avena + ½ banana pisada",
      "Podés agregar 1 cdita de esencia de vainilla. Batir y cocinar",
    ],
  },
  5: {
    titulo: "Infusión con pan nube",
    descripcion: "Café/mate/té + Pan nube + queso/mermelada/jamón",
    componentes: [
      "Infusión: café, mate cocido o té (amargo o con edulcorante)",
      "Pan nube (ver receta)",
      "Podés untarlo con queso untable descremado y/o mermelada light",
      "Salado: 1 feta de jamón o lomito",
    ],
    recetaPlan: "Pan nube",
  },
  6: {
    titulo: "Opción Libre",
    descripcion: "Consultalo con tu nutricionista",
    componentes: ["Consultalo con tu nutricionista antes de elegirla"],
  },
};

export const opcionesMerienda = {
  1: {
    titulo: "Yogur con cereales y frutas secas",
    descripcion: "Yogur + ¾ taza copos de maíz + 12 almendras o 7 nueces",
    componentes: [
      "Yogur descremado o parcialmente descremado (sin colchón de frutas, con cereales)",
      "Cereales: ¾ taza de copos de maíz (sin azúcar)",
      "Frutas secas: 12 almendras o 7 nueces mariposa (enteras o pisadas)",
      "Opcional: 1 cda sopera de semillas de lino, chía y/o sésamo",
    ],
  },
  2: {
    titulo: "Yogur con pan integral",
    descripcion: "Yogur descremado + 2 rodajas pan integral + queso opcional",
    componentes: [
      "Yogur descremado o parcialmente descremado (sin colchón de frutas, sin cereales)",
      "Pan integral: 2 rodajas",
      "Opcional: untadas con queso descremado",
    ],
  },
  3: {
    titulo: "Infusión con budín integral",
    descripcion: "Café/mate/té cortado con leche + 1-2 rebanadas de budín",
    componentes: [
      "Infusión: café, mate cocido o té cortado con leche descremada o parcialmente descremada (20% infusión – 80% leche)",
      "Budín integral: 1-2 rebanadas (ver receta)",
    ],
    recetaPlan: "Budín integral de mandarinas",
  },
  4: {
    titulo: "Infusión con tostadas untadas",
    descripcion: "Café/mate/té + 2 tostadas + queso descremado/mermelada light",
    componentes: [
      "Infusión: café, mate cocido o té cortado con leche descremada (20% – 80%)",
      "Tostadas: 2 unidades",
      "Queso untable descremado: 1 cdita de té por unidad",
      "Opcional: mermelada o dulce de leche light (1 cdita de té por unidad)",
    ],
  },
  5: {
    titulo: "Infusión con pan nube",
    descripcion: "Café/mate/té + ¾ taza leche + pan nube untado",
    componentes: [
      "Infusión: café, mate cocido o té",
      "Leche descremada o parcialmente descremada: ¾ de taza",
      "Pan nube (ver receta), untado con queso untable descremado, mermelada light y/o pasta de maní",
    ],
    recetaPlan: "Pan nube",
  },
};

export const notasMerienda = [
  "Cada opción podés consumirla en su totalidad o parcialmente. Si te parece demasiada cantidad, podés consumir lo que sobre como Colación.",
];
export const notasDesayuno = ["Infusiones: endulzar con edulcorante. No azúcar."];

export const colacion1Opciones = {
  1: "Café, té o mate (amargo o endulzado con edulcorante)",
  2: "Frutas secas (hasta 10 unidades)",
  3: "Palta (½ unidad)",
  4: "Gelatina light",
  5: "Caldos (caseros o comerciales)",
  6: "Huevo (1 unidad) en omelet o hervido",
  7: "Rollito de lomito y queso (1 feta de cada uno)",
  8: "Aceitunas (3 unidades)",
  9: "Bastoncitos de pechuga de pollo",
  10: "Lo que no consumiste del Desayuno",
};

export const colacion2Opciones = {
  1: "Fruta fresca (2-3 por día)",
  2: "Yogur (1 vaso o pote)",
  3: "Leche para 'cortar' infusiones",
  4: "Bastoncitos de zanahoria",
  5: "Pickles (3 unidades)",
  6: "Berenjena en vinagre (2 rodajas)",
  7: "Morrón en vinagre (½ unidad)",
  8: "Pochoclos (½ taza)",
  9: "Almohaditas (½ taza)",
};

// Regla común a ambas colaciones
export const notaColaciones =
  "Las colaciones son un recurso para cuando tengas hambre. No son obligatorias y podés consumir cualquier opción propuesta.";

export const guiaFrutas = {
  formas: "En ensaladas, como postre o colación. NO licuados, NO exprimidos.",
  cantidad: "Fruta fresca: 2-3 por día",
  permitidas: ["ciruelas", "durazno", "manzana", "pera", "frutillas", "arándanos", "kiwi", "cítricos"],
  notaEspecial: "La banana solo después de hacer ejercicio.",
};

// Distribución de almuerzo/cena según día de la semana.
// rojo = carne (160-180 g) | amarillo = huevo (hasta 3 claras, 1 yema/día) | verde = hortalizas
export const distribucionSemanal = {
  lunes: { almuerzo: "amarillo", cena: "rojo" },
  martes: { almuerzo: "rojo", cena: "amarillo" },
  miercoles: { almuerzo: "amarillo", cena: "rojo" },
  jueves: { almuerzo: "rojo", cena: "amarillo" },
  viernes: { almuerzo: "amarillo", cena: "rojo" },
  sabado: { almuerzo: "mixto", cena: "rojo" }, // mixto = verde + (rojo o amarillo)
  domingo: { almuerzo: "rojo", cena: "rojo" },
};

export const DIAS_SEMANA = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
export const DIAS_ORDENADOS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];

export const proteinas = {
  vaca: {
    label: "Vaca",
    cortes: ["peceto", "nalga", "lomo", "cuadril", "paleta", "vacío"],
  },
  pollo: { label: "Pollo", cortes: ["pechuga", "pata-muslo"] },
  cerdo: { label: "Cerdo", cortes: ["lomo", "nalga", "paleta"] },
  pescado: {
    label: "Pescado",
    cortes: ["anchoa", "atún", "bacalao", "brótola", "corvina", "salmón", "merluza", "lenguado", "pejerrey", "pollo del mar"],
  },
  huevo: { label: "Huevo", cortes: ["huevo de gallina (solo clara)"] },
};

export const ELECCIONES_CARNE = ["vaca", "pollo", "cerdo", "pescado"];
export const ELECCIONES_VALIDAS = [...ELECCIONES_CARNE, "huevo"];

export const MAX_VACA_SEMANAL = 3;

export const reglasProteina = {
  carne: {
    porcion: "160 g – 180 g",
    preparacion:
      "Al horno, asada, a la plancha, parrilla, wok, microondas, vapor o cacerola. También en cazuelas, guisos, budines, albóndigas, hamburguesas caseras, rellenas con vegetales y chop suey.",
    vaca: `Carne vacuna: hasta ${MAX_VACA_SEMANAL} comidas por semana y NO en la cena.`,
  },
  huevo: {
    porcion: "Hasta 3 claras (solo 1 yema por día)",
    preparacion: "Siempre cocido: en omelet, hervido o a la plancha.",
  },
  verdura: {
    porcion: "1 plato hondo al ras (hoja fresca libre)",
    preparacion:
      "Bien cocidas y lavadas. Al vapor, hervidas, al horno, parrilla, salsas, salpicones, soufflés, purés, revueltos, rellenas, omelet, budines, sopas, pucheros, tortillas.",
    permitidas: [
      "acelga", "achicoria", "ají", "berenjena", "brócoli", "calabaza", "cebolla", "verdeo", "coliflor",
      "escarola", "espinaca", "lechuga", "nabo", "pepino", "rábano", "repollo", "puerro", "radicheta",
      "remolacha", "rúcula", "tomate", "zapallito", "zanahoria",
    ],
  },
};

export const caldoOpcional =
  "Opcional: 1 taza de caldo casero antes del almuerzo y/o cena (apio, cebolla de verdeo, hinojo, perejil y, en lo posible, algún trozo de carne). Una vez cocido, colar y procesar.";

// Extras permitidos los días de entrenamiento
export const extrasEntrenamiento = {
  almuerzo: {
    // Entrena antes de las 17 hs
    titulo: "Entrenás antes de las 17 hs: podés sumar al almuerzo",
    opciones: [
      "Legumbres (½ taza cocida)",
      "Arroz integral (½ taza cocida)",
      "Choclo (½ taza cocido)",
      "1 porción de tarta (pollo y espinaca)",
      "1 cuadradito (10 cm × 10 cm aprox.) de pastel de papas",
      "1 hamburguesa vegana",
      "1 batata o 1 papa (tamaño mano)",
    ],
  },
  cena: {
    // Entrena después de las 18 hs
    titulo: "Entrenás después de las 18 hs: podés sumar a la cena",
    opciones: ["Legumbres (½ taza cocida)", "Arroz integral (½ taza cocida)", "1 hamburguesa vegana"],
  },
  opcional:
    "El día que sumás estos alimentos podés NO consumir la CARNE o el HUEVO, según corresponda al día.",
  milanesas:
    "Milanesas (al horno): podés consumirlas los días que hacés ejercicio y coincida con la ingesta de CARNE (en reemplazo de papa, batata, arroz integral y legumbres).",
};

export const recetasPlan = [
  {
    nombre: "Pan nube",
    porciones: "2 porciones",
    ingredientes: [
      "1 huevo",
      "1 cda sopera de polvo de hornear",
      "6 cdas soperas de leche en polvo (descremada)",
      "Sal (también podés saborizarlos: orégano o queso rallado)",
    ],
    pasos: [
      "Preparar los ingredientes y precalentar el horno a temperatura media-baja (140 °C).",
      "En un bol, batir el huevo con el polvo de hornear hasta espumar.",
      "Agregar la leche en polvo.",
      "Formar dos bollos.",
      "Aceitar la fuente y llevar al horno.",
      "Cocinar de 10 a 15 minutos.",
    ],
  },
  {
    nombre: "Budín integral de mandarinas",
    porciones: "1 budín",
    ingredientes: [
      "2 mandarinas",
      "2 tazas de harina integral",
      "1 taza de azúcar (mascabo o blanca)",
      "1 huevo",
      "80 ml de aceite de girasol",
      "1 cdita de esencia de vainilla",
      "½ taza de leche descremada",
      "1 cda de polvo de hornear",
      "1 cda de semillas de amapola",
      "Azúcar impalpable (cantidad necesaria)",
    ],
    pasos: [
      "Exprimir el jugo de una mandarina y tirar la cáscara.",
      "Colocar el jugo y la pulpa en una licuadora.",
      "Cortar en cuatro la otra mandarina (con cáscara), quitar las semillas.",
      "Agregarla a la licuadora y licuar.",
      "Añadir el huevo, el aceite, la leche y la vainilla y licuar hasta una preparación homogénea.",
      "En un bowl, integrar la harina, el azúcar, el polvo de hornear y las semillas.",
      "Agregar de a poco lo licuado hasta obtener una preparación homogénea y cremosa.",
      "Colocar en un molde rociado con rocío vegetal y hornear a 180 °C aprox. unos 45 minutos.",
      "Pinchar con un palito: debe salir limpio.",
      "Dejar enfriar, desmoldar y espolvorear con azúcar impalpable.",
    ],
  },
];

export const consejos = [
  "Respetá los grupos de alimentos asignados a cada comida.",
  "Controlá las porciones propuestas.",
  "Establecé los horarios de las ingestas previamente.",
  "Organizá el Diario Alimentario para cada una de las comidas.",
  "Llevá un registro por escrito, tanto de la alimentación como del ejercicio físico.",
];

// Guía completa que consume el frontend (pantalla "Mi plan")
export const construirGuia = () => ({
  consejos,
  horarios,
  notaHorarios,
  notaColaciones,
  desayuno: { notas: notasDesayuno },
  merienda: { notas: notasMerienda },
  semana: distribucionSemanal,
  proteinas,
  reglasProteina,
  maxVacaSemanal: MAX_VACA_SEMANAL,
  frutas: guiaFrutas,
  caldoOpcional,
  extrasEntrenamiento,
  recetasPlan,
});
