<template>
  <q-page padding class="mi-rutina-page bg-secondary">
    <!-- PANTALLA 1: SELECCIÓN DE PERFIL -->
    <div v-if="!nombreActivo" class="profile-selection-container q-py-xl">
      <div class="text-center q-mb-xl">
        <h4 class="text-bold text-purple q-my-none">¿Quién ingresa hoy?</h4>
        <p class="text-subtitle1 text-grey-8 q-mt-sm">
          Seleccioná tu perfil para ver tu rutina personalizada o creá uno nuevo.
        </p>
      </div>

      <!-- Spinner mientras cargan los perfiles -->
      <div v-if="loadingPerfiles" class="row justify-center q-my-xl">
        <q-spinner color="primary" size="50px" />
      </div>

      <!-- Cuadrícula de perfiles -->
      <div v-else class="row justify-center q-col-gutter-lg">
        <!-- Tarjeta de cada perfil existente -->
        <div
          v-for="perfil in perfiles"
          :key="perfil"
          class="col-12 col-sm-6 col-md-4 col-lg-3"
        >
          <q-card class="profile-card q-pa-md text-center shadow-2" @click="seleccionarPerfil(perfil)">
            <q-card-section class="column items-center">
              <q-avatar size="80px" class="profile-avatar-gradient q-mb-md">
                {{ perfil.charAt(0).toUpperCase() }}
              </q-avatar>
              <div class="text-h6 text-bold text-grey-9">{{ perfil }}</div>
              <div class="text-caption text-grey-6 q-mt-xs">Ver rutina diaria</div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Tarjeta para crear nuevo perfil -->
        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
          <q-card
            class="profile-card new-profile-card q-pa-md text-center shadow-2"
            @click="abrirCrearPerfil"
          >
            <q-card-section class="column items-center justify-center style-dashed" style="height: 100%; min-height: 140px;">
              <q-icon name="person_add" size="44px" class="q-mb-md" />
              <div class="text-h6 text-bold">Nuevo Perfil</div>
              <div class="text-caption">Crear configuración</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

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

          <div class="row q-gutter-sm">
            <q-btn
              outline
              color="primary"
              icon="edit"
              label="Configurar Perfil"
              class="animated-btn"
              @click="abrirEditarPerfil"
            />
            <q-btn
              outline
              color="grey-7"
              icon="logout"
              label="Cambiar de perfil"
              class="animated-btn"
              @click="cerrarSesionPerfil"
            />
          </div>
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <!-- Barra lateral izquierda (Progreso, Estado del día, Historial) -->
        <div class="col-12 col-lg-4">
          <!-- Tarjeta de progreso -->
          <q-card class="shadow-3 progress-header">
            <q-card-section>
              <div class="text-h6 text-purple text-bold">Estado del día</div>
              <div class="q-mt-md">
                <div class="row items-center justify-between q-mb-xs">
                  <span class="text-body2 text-grey-8">Actividades obligatorias</span>
                  <span class="text-body2 text-bold">
                    {{ progreso.comidasConsumidas }}/{{ progreso.totalComidas }}
                  </span>
                </div>
                <q-linear-progress
                  :value="progressValue"
                  color="primary"
                  track-color="grey-3"
                  rounded
                  size="14px"
                />
                <div class="text-caption text-grey-7 q-mt-xs">
                  {{ progressText }}
                </div>
              </div>

              <q-separator class="q-my-md" />

              <div class="text-subtitle2 text-purple text-bold">Entrenamiento de hoy</div>
              <div class="text-body2 text-grey-8 q-mt-sm">
                {{ resumenEntrenamiento }}
              </div>
              <div class="text-caption text-grey-7 q-mt-xs">{{ resumenDia }}</div>
            </q-card-section>
          </q-card>

          <!-- Tarjeta de historial -->
          <q-card class="shadow-3 q-mt-md">
            <q-card-section>
              <div class="row items-center justify-between">
                <div class="text-subtitle1 text-purple text-bold">
                  Progreso de la semana
                </div>
                <q-btn
                  flat
                  dense
                  icon="sync"
                  color="primary"
                  :loading="historyLoading"
                  @click="cargarHistorial"
                />
              </div>

              <div v-if="historyLoading" class="row justify-center q-py-md">
                <q-spinner color="primary" size="32px" />
              </div>
              <div v-else-if="!historial.length" class="text-body2 text-grey-7 q-mt-sm">
                Todavía no hay progreso registrado para los días anteriores.
              </div>
              <div v-else class="q-mt-sm">
                <div
                  v-for="item in historial"
                  :key="item._id"
                  class="row items-center justify-between q-py-xs border-bottom-soft"
                >
                  <span class="text-body2">{{ formatearFecha(item.fecha) }}</span>
                  <span class="text-body2 text-bold">{{
                    formatearPorcentaje(item.porcentajeComplecion)
                  }}</span>
                </div>
              </div>
            </q-card-section>
          </q-card>
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
                  <q-card
                    :class="[
                      'meal-card',
                      meal.consumido ? 'meal-card--done' : '',
                    ]"
                    bordered
                  >
                    <q-card-section>
                      <div class="row items-start justify-between no-wrap">
                        <div>
                          <div class="text-subtitle1 text-purple text-bold">
                            {{ meal.label }}
                          </div>
                          <div class="text-caption text-grey-7 q-mb-xs">
                            {{ meal.helper }}
                          </div>
                        </div>
                        <q-toggle
                          :model-value="meal.consumido"
                          color="positive"
                          @update:model-value="
                            (value) => marcarComida(meal.key, value)
                          "
                        />
                      </div>

                      <!-- SELECTOR DE OPCIONES PARA DESAYUNO Y MERIENDA -->
                      <div v-if="meal.key === 'desayuno' || meal.key === 'merienda'" class="q-mb-md">
                        <q-select
                          v-model="selectedOptionModel[meal.key]"
                          :options="opcionesComidas ? opcionesComidas[meal.key] : []"
                          option-value="numero"
                          option-label="titulo"
                          emit-value
                          map-options
                          outlined
                          dense
                          label="Elegir qué vas a consumir"
                          class="q-mt-xs"
                          @update:model-value="(val) => cambiarOpcionComida(meal.key, val)"
                        >
                          <template v-slot:option="scope">
                            <q-item v-bind="scope.itemProps">
                              <q-item-section>
                                <q-item-label class="text-bold text-purple">
                                  {{ scope.opt.titulo }}
                                </q-item-label>
                                <q-item-label caption>
                                  {{ scope.opt.descripcion }}
                                </q-item-label>
                                <q-item-label caption class="text-orange" v-if="scope.opt.calorias">
                                  {{ scope.opt.calorias }} kcal
                                </q-item-label>
                              </q-item-section>
                            </q-item>
                          </template>
                        </q-select>
                      </div>

                      <div class="text-body2 text-grey-9 q-mb-sm">
                        {{ meal.descripcion || "Sin descripción disponible" }}
                      </div>

                      <q-list
                        v-if="meal.items.length"
                        dense
                        class="bg-grey-1 rounded-borders q-pa-xs"
                      >
                        <q-item
                          v-for="(item, index) in meal.items"
                          :key="`${meal.key}-${index}`"
                        >
                          <q-item-section avatar>
                            <q-icon name="restaurant" color="primary" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ item }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- DIÁLOGO PARA CREAR O EDITAR PERFIL DE USUARIO -->
    <q-dialog v-model="dialogNuevoPerfil" persistent>
      <q-card style="min-width: 350px; border-radius: 16px;" class="q-pa-md">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-purple text-bold">
            {{ nuevoPerfilForm.nombre === nombreActivo ? "Configurar Perfil" : "Crear Perfil Personal" }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit.prevent="guardarPerfilGeneral" class="q-gutter-md">
            <q-input
              v-model="nuevoPerfilForm.nombre"
              outlined
              dense
              label="Tu nombre"
              :rules="[(val) => !!val || 'El nombre es obligatorio']"
              :disable="nuevoPerfilForm.nombre === nombreActivo"
              hint="El nombre te identificará para entrar siempre a tu rutina."
            />

            <q-input
              v-model="nuevoPerfilForm.objetivo"
              outlined
              dense
              label="Objetivo"
              placeholder="Bajar grasa, ganar músculo, etc."
            />

            <q-select
              v-model="nuevoPerfilForm.diasEntrenamiento"
              :options="diasSemanaOptions"
              multiple
              use-chips
              outlined
              dense
              label="Días de gimnasio"
            />

            <q-select
              v-model="nuevoPerfilForm.horaEntrenamiento"
              :options="horaEntrenamientoOptions"
              emit-value
              map-options
              outlined
              dense
              label="Hora preferida de entrenamiento"
            />

            <div class="row justify-end q-mt-lg q-gutter-sm">
              <q-btn label="Cancelar" color="grey" flat v-close-popup />
              <q-btn
                :label="nuevoPerfilForm.nombre === nombreActivo ? 'Guardar Cambios' : 'Crear Perfil'"
                color="primary"
                type="submit"
                :loading="guardandoPerfil"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import { RUTINA_API_URL } from "src/config/api";

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
const nuevoPerfilForm = ref({
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

const todayLabel = new Date().toLocaleDateString("es-ES", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const diasSemanaOptions = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];

const horaEntrenamientoOptions = [
  { label: "Antes de las 17 hs", value: "antes17" },
  { label: "Después de las 18 hs", value: "despues18" },
  { label: "No entrena hoy", value: "ninguno" },
];

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

const progressValue = computed(() => {
  const percent = Number(progreso.value.porcentajeComplecion || 0);
  return Math.max(0, Math.min(1, percent / 100));
});

const progressText = computed(() => {
  const percent = Number(progreso.value.porcentajeComplecion || 0).toFixed(0);
  return `${progreso.value.comidasConsumidas}/${progreso.value.totalComidas} completados (${percent}%)`;
});

const getTodayISO = () => new Date().toISOString().split("T")[0];

const buildMealItems = (key, meal) => {
  if (meal.grupoAlimentos) {
    const items = [];
    if (
      meal.grupoAlimentos.proteina?.cantidad ||
      meal.grupoAlimentos.proteina?.tipo
    ) {
      items.push(
        `${meal.grupoAlimentos.proteina?.cantidad || ""} ${
          meal.grupoAlimentos.proteina?.tipo || ""
        }`.trim()
      );
    }
    if (meal.grupoAlimentos.verdura) items.push(meal.grupoAlimentos.verdura);
    if (meal.grupoAlimentos.adicional)
      items.push(meal.grupoAlimentos.adicional);
    return items.filter(Boolean);
  }

  if (key === "colacion1" || key === "colacion2") {
    return meal.opcional ? ["Opcional"] : [];
  }

  return [];
};

const formatearFecha = (value) =>
  new Date(value).toLocaleDateString("es-ES", {
    month: "short",
    day: "2-digit",
  });

const formatearPorcentaje = (value) => `${Number(value || 0).toFixed(0)}%`;

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
  nuevoPerfilForm.value = {
    nombre: "",
    diasEntrenamiento: [],
    horaEntrenamiento: "ninguno",
    objetivo: "",
  };
  dialogNuevoPerfil.value = true;
};

const abrirEditarPerfil = () => {
  nuevoPerfilForm.value = {
    nombre: nombreActivo.value,
    diasEntrenamiento: form.value.diasEntrenamiento,
    horaEntrenamiento: form.value.horaEntrenamiento,
    objetivo: form.value.objetivo,
  };
  dialogNuevoPerfil.value = true;
};

const guardarPerfilGeneral = async () => {
  const nombre = nuevoPerfilForm.value.nombre.trim();
  if (!nombre) return;

  guardandoPerfil.value = true;
  try {
    // 1. Guardar la configuración general
    const responseConfig = await fetch(`${RUTINA_API_URL}/rutina/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuarioId: nombre,
        objetivos: nuevoPerfilForm.value.objetivo,
        diasEntrenamiento: nuevoPerfilForm.value.diasEntrenamiento,
        horaPreferidaEntrenamiento: nuevoPerfilForm.value.horaEntrenamiento,
      }),
    });

    const dataConfig = await responseConfig.json();
    if (!responseConfig.ok || !dataConfig.success) {
      throw new Error(dataConfig.error || "Error al guardar el perfil");
    }

    $q.notify({ type: "positive", message: "Perfil guardado correctamente" });
    
    // Actualizar estados locales del perfil activo
    form.value.nombre = nombre;
    form.value.objetivo = nuevoPerfilForm.value.objetivo;
    form.value.diasEntrenamiento = nuevoPerfilForm.value.diasEntrenamiento;
    form.value.horaEntrenamiento = nuevoPerfilForm.value.horaEntrenamiento;
    nombreActivo.value = nombre;

    dialogNuevoPerfil.value = false;

    // Cargar rutina diaria actualizada
    await cargarRutina();
    await cargarPerfiles();
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

    recalcularProgreso(data.data);
    calcularResumen(data.data);
    await cargarHistorial();
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
    // Rollback visual
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

// Lifecycle
onMounted(() => {
  cargarPerfiles();
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

.profile-selection-container {
  max-width: 1000px;
  margin: 0 auto;
}

.profile-card {
  cursor: pointer;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid rgba(138, 90, 157, 0.1);
  background: #ffffff;
}

.profile-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 15px 30px rgba(138, 90, 157, 0.15);
  border-color: #8a5a9d;
}

.profile-avatar-gradient {
  background: linear-gradient(135deg, #8a5a9d 0%, #c18dfd 100%);
  color: white;
  font-weight: bold;
}

.new-profile-card {
  border: 2px dashed rgba(138, 90, 157, 0.3);
  background: rgba(248, 241, 251, 0.5);
  color: #8a5a9d;
}

.new-profile-card:hover {
  border-color: #8a5a9d;
  background: rgba(248, 241, 251, 0.8);
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

.progress-header {
  border-radius: 16px;
  background: #ffffff;
  border-left: 5px solid #8a5a9d;
}

.meal-card {
  border-radius: 16px;
  background: #ffffff;
  transition: all 0.3s ease;
}

.meal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

.meal-card--done {
  border-color: rgba(76, 175, 80, 0.3);
  background: linear-gradient(180deg, #f1fbf3 0%, #ffffff 100%);
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.05);
}

.border-bottom-soft {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.animated-btn {
  transition: all 0.2s ease;
}

.animated-btn:hover {
  transform: scale(1.03);
}

.style-dashed {
  border-radius: 12px;
}
</style>
