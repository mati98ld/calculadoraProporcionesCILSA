<template>
  <q-page padding class="mi-rutina-page bg-secondary">
    <div class="hero q-pa-md q-mb-md">
      <div class="row items-center q-col-gutter-md">
        <div class="col-12 col-md-8">
          <div class="text-overline text-purple text-bold">Rutina personal</div>
          <div class="text-h4 text-purple text-bold">Mi rutina</div>
          <div class="text-body1 text-grey-8 q-mt-sm">
            Escribí tu nombre, cargá tu rutina y marcá qué comidas consumiste.
            Cada persona usa su propio nombre como identificador.
          </div>
        </div>

        <div class="col-12 col-md-4">
          <q-card class="profile-summary bg-white">
            <q-card-section>
              <div class="text-caption text-grey-7">Identidad activa</div>
              <div class="text-h6 text-purple text-bold">
                {{ nombreActivo || "Sin nombre" }}
              </div>
              <div class="text-body2 text-grey-8">
                {{
                  nombreActivo
                    ? "Rutina cargada por nombre"
                    : "Ingresá tu nombre para comenzar"
                }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-lg-4">
        <q-card class="shadow-3">
          <q-card-section>
            <div class="text-h6 text-purple text-bold q-mb-xs">
              Cargar rutina
            </div>
            <div class="text-caption text-grey-7 q-mb-md">
              El nombre se usa como clave en la API.
            </div>

            <q-form class="q-gutter-sm" @submit.prevent="cargarRutina">
              <q-input
                v-model="form.nombre"
                outlined
                dense
                label="Tu nombre"
                hint="Debe ser único"
                :rules="[(val) => !!val || 'El nombre es obligatorio']"
              />

              <q-input
                v-model="form.objetivo"
                outlined
                dense
                label="Objetivo"
                placeholder="Bajar grasa, ganar músculo, mejorar energía"
              />

              <q-select
                v-model="form.diasEntrenamiento"
                :options="diasSemanaOptions"
                multiple
                use-chips
                outlined
                dense
                label="Días de gimnasio"
              />

              <q-select
                v-model="form.horaEntrenamiento"
                :options="horaEntrenamientoOptions"
                emit-value
                map-options
                outlined
                dense
                label="Hora de entrenamiento"
              />

              <div class="row q-col-gutter-sm q-mt-xs">
                <div class="col-12 col-sm-6">
                  <q-btn
                    label="Cargar rutina"
                    color="primary"
                    class="full-width"
                    type="submit"
                    :loading="loadingRutina"
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-btn
                    outline
                    color="primary"
                    class="full-width"
                    label="Crear/actualizar"
                    :disable="!form.nombre.trim()"
                    @click="guardarRutina"
                  />
                </div>
              </div>
            </q-form>

            <q-separator class="q-my-md" />

            <div class="text-subtitle2 text-purple text-bold">
              Objetivos diarios
            </div>
            <div class="q-mt-sm">
              <div
                v-for="item in goalChecks"
                :key="item.label"
                class="row items-center q-py-xs"
              >
                <q-icon
                  :name="item.done ? 'check_circle' : 'radio_button_unchecked'"
                  :color="item.done ? 'positive' : 'grey-5'"
                  size="18px"
                  class="q-mr-sm"
                />
                <span class="text-body2">{{ item.label }}</span>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="shadow-3 q-mt-md">
          <q-card-section>
            <div class="text-h6 text-purple text-bold">Estado del día</div>
            <div class="q-mt-sm">
              <div class="row items-center justify-between q-mb-xs">
                <span class="text-body2 text-grey-8">Comidas consumidas</span>
                <span class="text-body2 text-bold"
                  >{{ progreso.comidasConsumidas }}/{{
                    progreso.totalComidas
                  }}</span
                >
              </div>
              <q-linear-progress
                :value="progressValue"
                color="primary"
                track-color="grey-3"
                rounded
                size="12px"
              />
              <div class="text-caption text-grey-7 q-mt-xs">
                {{ progressText }}
              </div>
            </div>

            <q-separator class="q-my-md" />

            <div class="text-subtitle2 text-purple text-bold">Hoy toca</div>
            <div class="text-body2 text-grey-8 q-mt-sm">
              {{ resumenEntrenamiento }}
            </div>
            <div class="text-caption text-grey-7 q-mt-xs">{{ resumenDia }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-8">
        <q-card class="shadow-3">
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-h6 text-purple text-bold">Rutina de hoy</div>
              <div class="text-caption text-grey-7">{{ todayLabel }}</div>
            </div>

            <q-btn
              outline
              color="primary"
              icon="refresh"
              label="Recargar"
              :disable="!nombreActivo"
              :loading="loadingRutina"
              @click="cargarRutina"
            />
          </q-card-section>

          <q-separator />

          <q-card-section v-if="!nombreActivo">
            <q-banner rounded class="bg-purple-1 text-purple">
              Ingresá tu nombre y cargá la rutina para ver tus comidas.
            </q-banner>
          </q-card-section>

          <q-card-section
            v-else-if="loadingRutina"
            class="row justify-center q-py-xl"
          >
            <q-spinner color="primary" size="44px" />
          </q-card-section>

          <q-card-section v-else-if="errorRutina">
            <q-banner rounded class="bg-red-1 text-negative">{{
              errorRutina
            }}</q-banner>
          </q-card-section>

          <q-card-section v-else>
            <div v-if="!rutina" class="text-body1 text-grey-7 q-pa-md">
              No hay rutina cargada todavía. Tocá
              <strong>Cargar rutina</strong> para traer la información desde la
              API.
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
                        <div class="text-caption text-grey-7 q-mb-sm">
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

            <q-separator class="q-my-lg" />

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-card bordered>
                  <q-card-section>
                    <div class="text-subtitle1 text-purple text-bold">
                      Resumen de entrenamiento
                    </div>
                    <div class="text-body2 q-mt-sm">
                      {{ resumenEntrenamiento }}
                    </div>
                    <div class="text-body2 q-mt-xs text-grey-7">
                      {{ resumenDia }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-md-6">
                <q-card bordered>
                  <q-card-section>
                    <div class="row items-center justify-between">
                      <div class="text-subtitle1 text-purple text-bold">
                        Historial reciente
                      </div>
                      <q-btn
                        flat
                        dense
                        icon="sync"
                        color="primary"
                        :disable="!nombreActivo"
                        @click="cargarHistorial"
                      />
                    </div>

                    <div
                      v-if="historyLoading"
                      class="row justify-center q-py-md"
                    >
                      <q-spinner color="primary" size="32px" />
                    </div>
                    <div
                      v-else-if="!historial.length"
                      class="text-body2 text-grey-7 q-mt-sm"
                    >
                      Todavía no hay progreso registrado.
                    </div>
                    <div v-else class="q-mt-sm">
                      <div
                        v-for="item in historial"
                        :key="item._id"
                        class="row items-center justify-between q-py-xs"
                      >
                        <span class="text-body2">{{
                          formatearFecha(item.fecha)
                        }}</span>
                        <span class="text-body2 text-bold">{{
                          formatearPorcentaje(item.porcentajeComplecion)
                        }}</span>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref } from "vue";
import { useQuasar } from "quasar";
import { RUTINA_API_URL } from "src/config/api";

const $q = useQuasar();

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

const meals = computed(() => {
  const source = rutina.value || {};

  return Object.keys(mealMeta).map((key) => {
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
});

const progressValue = computed(() => {
  const percent = Number(progreso.value.porcentajeComplecion || 0);
  return Math.max(0, Math.min(1, percent / 100));
});

const progressText = computed(() => {
  const percent = Number(progreso.value.porcentajeComplecion || 0).toFixed(0);
  return `${progreso.value.comidasConsumidas}/${progreso.value.totalComidas} comidas completadas (${percent}%)`;
});

const goalChecks = computed(() => [
  { label: "Nombre cargado", done: Boolean(nombreActivo.value) },
  { label: "Rutina cargada", done: Boolean(rutina.value?._id) },
  {
    label: "Al menos una comida marcada",
    done: (progreso.value.comidasConsumidas || 0) > 0,
  },
  { label: "Objetivo escrito", done: Boolean(form.value.objetivo?.trim()) },
]);

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

  if (meal.opcion) return [`Opción ${meal.opcion}`];

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
    ? `Entrenamiento ${
        data?.horaEntrenamiento === "antes17"
          ? "antes de las 17 hs"
          : "después de las 18 hs"
      }`
    : "Hoy no figura entrenamiento en la rutina";

  resumenDia.value = data?.diaSemana
    ? `Día asignado: ${data.diaSemana}`
    : "Rutina sin día asignado";
};

const recalcularProgreso = (data) => {
  const comidasReales = [
    "desayuno",
    "colacion1",
    "almuerzo",
    "merienda",
    "colacion2",
    "cena",
  ].filter((key) => Boolean(data?.[key]));
  const consumidas = comidasReales.filter((key) =>
    Boolean(data?.[key]?.consumido)
  ).length;

  progreso.value.totalComidas = comidasReales.length;
  progreso.value.comidasConsumidas = consumidas;
  progreso.value.porcentajeComplecion = comidasReales.length
    ? Number(((consumidas / comidasReales.length) * 100).toFixed(2))
    : 0;
};

const cargarRutina = async () => {
  const nombre = form.value.nombre.trim();

  if (!nombre) {
    $q.notify({ type: "warning", message: "El nombre es obligatorio" });
    return;
  }

  nombreActivo.value = nombre;
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

const guardarRutina = async () => {
  const nombre = form.value.nombre.trim();

  if (!nombre) {
    $q.notify({ type: "warning", message: "El nombre es obligatorio" });
    return;
  }

  try {
    const response = await fetch(`${RUTINA_API_URL}/rutina`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuarioId: nombre,
        fecha: getTodayISO(),
        esEntrenamiento: form.value.horaEntrenamiento !== "ninguno",
        horaEntrenamiento: form.value.horaEntrenamiento,
        desayunoOpcion: 1,
        meriendaOpcion: 1,
        objetivos: form.value.objetivo,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "No se pudo guardar la rutina");
    }

    $q.notify({ type: "positive", message: "Rutina guardada correctamente" });
    rutina.value = data.data;
    recalcularProgreso(data.data);
    calcularResumen(data.data);
  } catch (error) {
    $q.notify({
      type: "negative",
      message: error.message || "No se pudo guardar la rutina",
    });
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
      throw new Error(data.error || "No se pudo actualizar la comida");
    }

    rutina.value = data.data;
    recalcularProgreso(data.data);

    $q.notify({
      type: "positive",
      message: `${mealMeta[tipoComida].label} ${
        consumido ? "marcado" : "desmarcado"
      }`,
    });
  } catch (error) {
    $q.notify({
      type: "negative",
      message: error.message || "No se pudo actualizar la comida",
    });
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

.profile-summary {
  border-left: 4px solid #8a5a9d;
}

.meal-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.meal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

.meal-card--done {
  border-color: rgba(76, 175, 80, 0.55);
  background: linear-gradient(
    180deg,
    rgba(232, 245, 233, 0.8) 0%,
    #ffffff 100%
  );
}
</style>
