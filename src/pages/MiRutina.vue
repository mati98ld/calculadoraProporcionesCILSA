<template>
  <q-page padding class="mi-rutina-page bg-secondary">
    <!-- PANTALLA 1: SELECCIÓN DE PERFIL -->
    <PerfilSelector
      v-if="!nombreActivo"
      :perfiles="perfiles"
      :loading-perfiles="loadingPerfiles"
      @seleccionar="seleccionarPerfil"
      @crear-nuevo="abrirCrearPerfil"
    />

    <!-- PANTALLA 2: DASHBOARD DE RUTINA DIARIA -->
    <div v-else>
      <!-- Cabecera de usuario activo -->
      <div class="hero q-pa-md q-mb-md dashboard-header">
        <div class="row items-center justify-between q-col-gutter-md">
          <div>
            <div class="text-overline text-purple text-bold">Tu rutina personal</div>
            <div class="text-h4 text-purple text-bold">¡Hola, {{ nombreActivo }}!</div>
            <div class="text-body1 text-grey-8 q-mt-xs" v-if="form.objetivo">
              <strong>Objetivo principal:</strong> {{ form.objetivo }}
            </div>
          </div>
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <!-- Barra lateral izquierda (Progreso, Estado del día, Historial) -->
        <div class="col-12 col-lg-4">
          <ProgresoDiarioCard
            :progreso="progreso"
            :resumen-entrenamiento="resumenEntrenamiento"
            :resumen-dia="resumenDia"
            :historial="historial"
            :history-loading="historyLoading"
            @refresh-history="cargarHistorial"
          />
        </div>

        <!-- Columna derecha (Actividades de hoy) -->
        <div class="col-12 col-lg-8">
          <q-card class="shadow-3">
            <q-card-section class="row items-center justify-between">
              <div>
                <div class="text-h6 text-purple text-bold">Tus comidas y actividades</div>
                <div class="text-caption text-grey-7">{{ todayLabel }}</div>
              </div>

              <q-btn
                outline
                color="primary"
                icon="refresh"
                label="Actualizar"
                :loading="loadingRutina"
                @click="cargarRutina"
              />
            </q-card-section>

            <q-separator />

            <q-card-section v-if="loadingRutina" class="row justify-center q-py-xl">
              <q-spinner color="primary" size="44px" />
            </q-card-section>

            <q-card-section v-else-if="errorRutina">
              <q-banner rounded class="bg-red-1 text-negative">
                {{ errorRutina }}
              </q-banner>
            </q-card-section>

            <q-card-section v-else>
              <div v-if="!rutina" class="text-body1 text-grey-7 q-pa-md">
                No hay rutina cargada para hoy.
              </div>

              <div v-else class="row q-col-gutter-md">
                <div
                  v-for="meal in meals"
                  :key="meal.key"
                  class="col-12 col-md-6"
                >
                  <MealCard
                    :meal="meal"
                    :opciones-comidas="opcionesComidas"
                    :recetas="recetas"
                    :selected-option="selectedOptionModel[meal.key]"
                    @marcar="(val) => marcarComida(meal.key, val)"
                    @cambiar-opcion="(val) => cambiarOpcionComida(meal.key, val)"
                    @vincular-receta="(val) => vincularRecetaAMeal(meal.key, val)"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- DIÁLOGO PARA CREAR O EDITAR PERFIL DE USUARIO -->
    <PerfilDialog
      v-model="dialogNuevoPerfil"
      :perfil="perfilParaDialog"
      :is-edit="!!nombreActivo"
      :loading="guardandoPerfil"
      :perfiles-existentes="perfiles"
      @save="guardarPerfilGeneral"
    />

    <!-- MENU FLOTANTE DE OPCIONES DE PERFIL -->
    <q-page-sticky v-if="nombreActivo" position="bottom-right" :offset="[18, 18]">
      <q-fab
        icon="manage_accounts"
        active-icon="close"
        direction="up"
        color="primary"
        class="shadow-5"
      >
        <q-fab-action
          external-label
          label-position="left"
          label="Configurar Perfil"
          color="accent"
          icon="edit"
          @click="abrirEditarPerfil"
        />
        <q-fab-action
          external-label
          label-position="left"
          label="Cambiar de perfil"
          color="red"
          icon="logout"
          @click="cerrarSesionPerfil"
        />
      </q-fab>
    </q-page-sticky>
  </q-page>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import { RUTINA_API_URL } from "src/config/api";

// Importar componentes modulares
import PerfilSelector from "src/components/PerfilSelector.vue";
import PerfilDialog from "src/components/PerfilDialog.vue";
import ProgresoDiarioCard from "src/components/ProgresoDiarioCard.vue";
import MealCard from "src/components/MealCard.vue";

const $q = useQuasar();

// State principal
const form = ref({
  nombre: "",
  diasEntrenamiento: [],
  horaEntrenamiento: "ninguno",
  objetivo: "",
});

const rutina = ref(null);
const loadingRutina = ref(false);
const errorRutina = ref("");
const historial = ref([]);
const historyLoading = ref(false);

const progreso = ref({
  totalComidas: 0,
  comidasConsumidas: 0,
  porcentajeComplecion: 0,
});

const resumenEntrenamiento = ref("Todavía no cargaste una rutina.");
const resumenDia = ref("Escribí tu nombre para comenzar.");
const nombreActivo = ref("");

// Perfiles unificados
const perfiles = ref([]);
const loadingPerfiles = ref(false);

// Crear/Editar Perfil
const dialogNuevoPerfil = ref(false);
const guardandoPerfil = ref(false);
const perfilParaDialog = ref({
  nombre: "",
  diasEntrenamiento: [],
  horaEntrenamiento: "ninguno",
  objetivo: "",
});

// Opciones de comidas
const opcionesComidas = ref(null);
const selectedOptionModel = ref({
  desayuno: 1,
  merienda: 1,
});

const recetas = ref([]);
const selectedRecipeModel = ref({
  desayuno: null,
  colacion1: null,
  almuerzo: null,
  merienda: null,
  colacion2: null,
  cena: null,
});

const todayLabel = new Date().toLocaleDateString("es-ES", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const mealMeta = {
  desayuno: { label: "Desayuno", helper: "Primera comida del día" },
  colacion1: { label: "Colación 1", helper: "Opcional" },
  almuerzo: { label: "Almuerzo", helper: "Comida principal" },
  merienda: { label: "Merienda", helper: "Media tarde" },
  colacion2: { label: "Colación 2", helper: "Opcional" },
  cena: { label: "Cena", helper: "Última comida del día" },
};

// Computed properties
const meals = computed(() => {
  const source = rutina.value || {};
  const list = Object.keys(mealMeta).map((key) => {
    const meal = source[key] || {};

    return {
      key,
      label: mealMeta[key].label,
      helper: mealMeta[key].helper,
      descripcion:
        meal.descripcion || meal.grupoAlimentos?.proteina?.tipo || "",
      items: buildMealItems(key, meal),
      consumido: Boolean(meal.consumido),
      recetaNombre: meal.recetaNombre || null,
      recetaId: meal.recetaId || null,
      adicional: meal.grupoAlimentos?.adicional || null,
    };
  });

  // Si hoy es día de gimnasio, agregar tarjeta de entrenamiento
  if (source.entrenamiento?.requerido) {
    list.push({
      key: "entrenamiento",
      label: "Gimnasio",
      helper: "Actividad física del día",
      descripcion: source.entrenamiento.descripcion || "Ir al gimnasio",
      items: [],
      consumido: Boolean(source.entrenamiento.consumido),
    });
  }

  return list;
});

const getTodayISO = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const buildMealItems = (key, meal) => {
  if (meal.recetaNombre) {
    return [];
  }

  if (meal.grupoAlimentos) {
    const items = [];
    if (
      meal.grupoAlimentos.proteina?.cantidad ||
      meal.grupoAlimentos.proteina?.tipo
    ) {
      let pText = `${meal.grupoAlimentos.proteina?.cantidad || ""} ${
        meal.grupoAlimentos.proteina?.tipo || ""
      }`.trim();
      if (meal.grupoAlimentos.proteina?.tipo === "carne") {
        pText += " (Vaca, Pollo, Cerdo o Pescado)";
      }
      items.push(pText);
    }
    if (meal.grupoAlimentos.verdura) items.push(meal.grupoAlimentos.verdura);
    return items.filter(Boolean);
  }

  if (key === "colacion1" || key === "colacion2") {
    return meal.opcional ? ["Opcional"] : [];
  }

  return [];
};

const calcularResumen = (data) => {
  resumenEntrenamiento.value = data?.esEntrenamiento
    ? `Gimnasio programado: ${
        data?.horaEntrenamiento === "antes17"
          ? "Antes de las 17 hs"
          : "Después de las 18 hs"
      }`
    : "Hoy es día de descanso";

  resumenDia.value = data?.diaSemana
    ? `Día: ${data.diaSemana.charAt(0).toUpperCase() + data.diaSemana.slice(1)}`
    : "";
};

// Progreso alineado con el backend
const recalcularProgreso = (data) => {
  if (!data) return;
  let totalComidas = 0;
  let comidasConsumidas = 0;

  const sumarSiCorresponde = (incluida, consumida) => {
    if (!incluida) return;
    totalComidas++;
    if (consumida) comidasConsumidas++;
  };

  sumarSiCorresponde(Boolean(data.desayuno?.opcion), data.desayuno?.consumido);
  sumarSiCorresponde(Boolean(data.merienda?.opcion), data.merienda?.consumido);
  sumarSiCorresponde(Boolean(data.almuerzo?.grupoAlimentos), data.almuerzo?.consumido);
  sumarSiCorresponde(Boolean(data.cena?.grupoAlimentos), data.cena?.consumido);
  
  // Colaciones son opcionales y no se cuentan
  sumarSiCorresponde(data.colacion1?.opcional === false, data.colacion1?.consumido);
  sumarSiCorresponde(data.colacion2?.opcional === false, data.colacion2?.consumido);

  // Gimnasio obligatorio hoy si es requerido
  sumarSiCorresponde(Boolean(data.entrenamiento?.requerido), data.entrenamiento?.consumido);

  progreso.value.totalComidas = totalComidas;
  progreso.value.comidasConsumidas = comidasConsumidas;
  progreso.value.porcentajeComplecion = totalComidas > 0 ? (comidasConsumidas / totalComidas) * 100 : 0;
};

// Métodos de perfiles
const cargarPerfiles = async () => {
  loadingPerfiles.value = true;
  try {
    const response = await fetch(`${RUTINA_API_URL}/rutina/perfiles`);
    const data = await response.json();
    if (data.success) {
      perfiles.value = data.data || [];
    }
  } catch (error) {
    console.error("Error al cargar perfiles:", error);
    $q.notify({ type: "negative", message: "No se pudieron cargar los perfiles" });
  } finally {
    loadingPerfiles.value = false;
  }
};

const cargarConfigPerfil = async (nombre) => {
  try {
    const response = await fetch(`${RUTINA_API_URL}/rutina/config/${encodeURIComponent(nombre)}`);
    const data = await response.json();
    if (data.success && data.data) {
      form.value.objetivo = data.data.objetivos?.join(", ") || "";
      form.value.diasEntrenamiento = data.data.diasEntrenamiento || [];
      form.value.horaEntrenamiento = data.data.horaPreferidaEntrenamiento || "ninguno";
    } else {
      form.value.objetivo = "";
      form.value.diasEntrenamiento = [];
      form.value.horaEntrenamiento = "ninguno";
    }
  } catch (error) {
    console.error("Error al cargar config de perfil:", error);
  }
};

const seleccionarPerfil = async (nombre) => {
  form.value.nombre = nombre;
  nombreActivo.value = nombre;
  await cargarConfigPerfil(nombre);
  await cargarRutina();
  await cargarHistorial();
};

const cerrarSesionPerfil = () => {
  nombreActivo.value = "";
  rutina.value = null;
  historial.value = [];
  form.value.nombre = "";
  form.value.objetivo = "";
  form.value.diasEntrenamiento = [];
  form.value.horaEntrenamiento = "ninguno";
  cargarPerfiles();
};

const abrirCrearPerfil = () => {
  perfilParaDialog.value = {
    nombre: "",
    diasEntrenamiento: [],
    horaEntrenamiento: "ninguno",
    objetivo: "",
  };
  dialogNuevoPerfil.value = true;
};

const abrirEditarPerfil = () => {
  perfilParaDialog.value = {
    nombre: nombreActivo.value,
    diasEntrenamiento: form.value.diasEntrenamiento,
    horaEntrenamiento: form.value.horaEntrenamiento,
    objetivo: form.value.objetivo,
  };
  dialogNuevoPerfil.value = true;
};

const guardarPerfilGeneral = async (formData) => {
  const nombre = formData.nombre;
  guardandoPerfil.value = true;
  try {
    const responseConfig = await fetch(`${RUTINA_API_URL}/rutina/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuarioId: nombre,
        objetivos: formData.objetivo,
        diasEntrenamiento: formData.diasEntrenamiento,
        horaPreferidaEntrenamiento: formData.horaEntrenamiento,
      }),
    });

    const dataConfig = await responseConfig.json();
    if (!responseConfig.ok || !dataConfig.success) {
      throw new Error(dataConfig.error || "Error al guardar el perfil");
    }

    $q.notify({ type: "positive", message: "Perfil guardado correctamente" });
    
    // Actualizar estados locales del perfil activo
    form.value.nombre = nombre;
    form.value.objetivo = formData.objetivo;
    form.value.diasEntrenamiento = formData.diasEntrenamiento;
    form.value.horaEntrenamiento = formData.horaEntrenamiento;
    nombreActivo.value = nombre;

    dialogNuevoPerfil.value = false;

    // Cargar rutina diaria actualizada
    await cargarRutina();
    await cargarPerfiles();
    await cargarHistorial();
  } catch (error) {
    $q.notify({ type: "negative", message: error.message || "Error al guardar el perfil" });
  } finally {
    guardandoPerfil.value = false;
  }
};

const cargarRutina = async () => {
  const nombre = nombreActivo.value.trim();
  if (!nombre) return;

  loadingRutina.value = true;
  errorRutina.value = "";

  try {
    const response = await fetch(
      `${RUTINA_API_URL}/rutina/${encodeURIComponent(nombre)}/${getTodayISO()}`
    );
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "No se pudo cargar la rutina");
    }

    rutina.value = data.data;
    opcionesComidas.value = data.opciones;
    selectedOptionModel.value.desayuno = data.data.desayuno?.opcion || 1;
    selectedOptionModel.value.merienda = data.data.merienda?.opcion || 1;

    // Sincronizar recetas vinculadas
    selectedRecipeModel.value.desayuno = data.data.desayuno?.recetaNombre || null;
    selectedRecipeModel.value.colacion1 = data.data.colacion1?.recetaNombre || null;
    selectedRecipeModel.value.almuerzo = data.data.almuerzo?.recetaNombre || null;
    selectedRecipeModel.value.merienda = data.data.merienda?.recetaNombre || null;
    selectedRecipeModel.value.colacion2 = data.data.colacion2?.recetaNombre || null;
    selectedRecipeModel.value.cena = data.data.cena?.recetaNombre || null;

    recalcularProgreso(data.data);
    calcularResumen(data.data);
  } catch (error) {
    rutina.value = null;
    errorRutina.value = error.message || "No se pudo cargar la rutina";
  } finally {
    loadingRutina.value = false;
  }
};

const marcarComida = async (tipoComida, consumido) => {
  if (!rutina.value?._id) return;

  try {
    const response = await fetch(
      `${RUTINA_API_URL}/rutina/${rutina.value._id}/marcar-comida`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipoComida, consumido }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "No se pudo actualizar el estado");
    }

    rutina.value = data.data;
    recalcularProgreso(data.data);
    await cargarHistorial();

    $q.notify({
      type: "positive",
      message: `${
        tipoComida === "entrenamiento" ? "Gimnasio" : mealMeta[tipoComida]?.label || tipoComida
      } ${consumido ? "marcado" : "desmarcado"}`,
    });
  } catch (error) {
    $q.notify({
      type: "negative",
      message: error.message || "No se pudo actualizar el estado",
    });
  }
};

const cambiarOpcionComida = async (tipoComida, opcionNumero) => {
  if (!rutina.value?._id) return;

  try {
    const response = await fetch(
      `${RUTINA_API_URL}/rutina/${rutina.value._id}/actualizar-opcion`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipoComida, opcion: opcionNumero }),
      }
    );

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || "No se pudo actualizar la opción");
    }

    rutina.value = data.data;
    selectedOptionModel.value[tipoComida] = data.data[tipoComida]?.opcion || opcionNumero;
    recalcularProgreso(data.data);

    $q.notify({
      type: "positive",
      message: `Opción de ${mealMeta[tipoComida].label} actualizada correctamente`,
    });
  } catch (error) {
    $q.notify({
      type: "negative",
      message: error.message || "No se pudo actualizar la opción",
    });
    selectedOptionModel.value[tipoComida] = rutina.value[tipoComida]?.opcion || 1;
  }
};

const cargarHistorial = async () => {
  const nombre = nombreActivo.value.trim();
  if (!nombre) return;

  historyLoading.value = true;

  try {
    const response = await fetch(
      `${RUTINA_API_URL}/rutina/historial/${encodeURIComponent(nombre)}?dias=7`
    );
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "No se pudo cargar el historial");
    }

    historial.value = data.data?.historial || [];
  } catch {
    historial.value = [];
  } finally {
    historyLoading.value = false;
  }
};

const cargarRecetas = async () => {
  try {
    const response = await fetch(`${RUTINA_API_URL}/recetas/todas`);
    const data = await response.json();
    if (Array.isArray(data)) {
      recetas.value = data;
    }
  } catch (error) {
    console.error("Error al cargar recetas:", error);
  }
};

const vincularRecetaAMeal = async (tipoComida, recetaNombre) => {
  if (!rutina.value?._id) return;

  let recetaId = null;
  if (recetaNombre) {
    const found = recetas.value.find(
      (r) => r.nombreReceta.toLowerCase() === recetaNombre.toLowerCase()
    );
    if (found) recetaId = found._id;
  }

  try {
    const response = await fetch(
      `${RUTINA_API_URL}/rutina/${rutina.value._id}/vincular-receta`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipoComida, recetaId, recetaNombre }),
      }
    );
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || "No se pudo vincular la receta");
    }

    rutina.value = data.data;
    selectedRecipeModel.value[tipoComida] = recetaNombre;
    recalcularProgreso(data.data);

    $q.notify({
      type: "positive",
      message: recetaNombre
        ? `Receta '${recetaNombre}' vinculada a ${mealMeta[tipoComida]?.label || tipoComida}`
        : `Receta desvinculada de ${mealMeta[tipoComida]?.label || tipoComida}`,
    });
  } catch (error) {
    $q.notify({
      type: "negative",
      message: error.message || "Error al vincular la receta",
    });
    selectedRecipeModel.value[tipoComida] = rutina.value[tipoComida]?.recetaNombre || null;
  }
};

// Lifecycle
onMounted(() => {
  cargarPerfiles();
  cargarRecetas();
});
</script>

<script>
export default {
  name: "MiRutina",
};
</script>

<style scoped>
.mi-rutina-page {
  min-height: 100%;
}

.hero {
  border-radius: 18px;
  background: linear-gradient(135deg, #f8f1fb 0%, #eef7ff 100%);
  border: 1px solid rgba(138, 90, 157, 0.15);
}

.dashboard-header {
  border-radius: 16px;
  background: linear-gradient(135deg, #fbf7ff 0%, #f0f7ff 100%);
  border: 1px solid rgba(138, 90, 157, 0.15);
}
</style>
