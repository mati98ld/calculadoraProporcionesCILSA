<template>
  <q-page padding class="mi-plan-page bg-secondary">
    <div class="hero q-pa-md q-mb-md">
      <div class="text-overline text-purple text-bold">Plan de alimentación</div>
      <div class="text-h5 text-purple text-bold">Mi plan: reglas, horarios y recetas</div>
      <div class="text-body2 text-grey-8 q-mt-xs">
        Todo lo que necesitás tener a mano para seguir tu plan día a día.
      </div>
    </div>

    <div v-if="loading" class="row justify-center q-py-xl">
      <q-spinner color="primary" size="44px" />
    </div>

    <q-banner v-else-if="error" rounded class="bg-red-1 text-negative">
      {{ error }}
      <template v-slot:action>
        <q-btn flat color="negative" label="Reintentar" @click="cargarGuia" />
      </template>
    </q-banner>

    <q-card v-else-if="guia" class="shadow-3 plan-card">
      <q-tabs
        v-model="tab"
        dense
        class="text-grey-8"
        active-color="purple"
        indicator-color="purple"
        align="justify"
        narrow-indicator
        mobile-arrows
        outside-arrows
      >
        <q-tab name="resumen" icon="checklist" label="Consejos" no-caps />
        <q-tab name="reglas" icon="rule" label="Reglas" no-caps />
        <q-tab name="entrenamiento" icon="fitness_center" label="Entrenamiento" no-caps />
        <q-tab name="recetas" icon="menu_book" label="Recetas" no-caps />
      </q-tabs>
      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <!-- CONSEJOS Y HORARIOS -->
        <q-tab-panel name="resumen">
          <div class="text-subtitle1 text-purple text-bold q-mb-sm">Para lograr tus metas</div>
          <q-list>
            <q-item v-for="(c, i) in guia.consejos" :key="`c-${i}`">
              <q-item-section avatar>
                <q-icon name="task_alt" color="positive" />
              </q-item-section>
              <q-item-section>{{ c }}</q-item-section>
            </q-item>
          </q-list>

          <q-separator class="q-my-md" />

          <div class="text-subtitle1 text-purple text-bold q-mb-sm">Diario alimentario ideal</div>
          <q-markup-table flat dense bordered class="rounded-borders">
            <thead>
              <tr>
                <th class="text-left">Comida</th>
                <th class="text-left">Horario</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="fila in filasHorario" :key="fila.key">
                <td>{{ fila.nombre }}</td>
                <td>{{ fila.label }}</td>
              </tr>
            </tbody>
          </q-markup-table>
          <div class="text-caption text-grey-7 q-mt-sm">{{ guia.notaHorarios }}</div>
        </q-tab-panel>

        <!-- REGLAS DE ALIMENTOS -->
        <q-tab-panel name="reglas">
          <div class="text-subtitle1 text-purple text-bold q-mb-sm">
            Almuerzo y cena: semáforo del plan
          </div>
          <div class="row q-gutter-sm q-mb-md">
            <q-chip color="red-7" text-color="white" icon="set_meal">
              Rojo: carne {{ guia.reglasProteina.carne.porcion }}
            </q-chip>
            <q-chip color="yellow-7" text-color="black" icon="egg_alt">
              Amarillo: {{ guia.reglasProteina.huevo.porcion }}
            </q-chip>
            <q-chip color="green-7" text-color="white" icon="eco">
              Verde: {{ guia.reglasProteina.verdura.porcion }}
            </q-chip>
          </div>

          <q-markup-table flat dense bordered class="q-mb-md rounded-borders">
            <thead>
              <tr>
                <th class="text-left">Día</th>
                <th class="text-center">Almuerzo</th>
                <th class="text-center">Cena</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(d, nombre) in guia.semana" :key="nombre">
                <td class="text-capitalize">{{ nombre === "miercoles" ? "miércoles" : nombre === "sabado" ? "sábado" : nombre }}</td>
                <td class="text-center">
                  <span class="swatch" :class="`swatch--${d.almuerzo}`" />
                  <span class="text-caption text-grey-7 q-ml-xs">+ verde</span>
                </td>
                <td class="text-center">
                  <span class="swatch" :class="`swatch--${d.cena}`" />
                  <span class="text-caption text-grey-7 q-ml-xs">+ verde</span>
                </td>
              </tr>
            </tbody>
          </q-markup-table>

          <q-banner rounded class="bg-orange-1 text-orange-10 q-mb-md">
            <template v-slot:avatar><q-icon name="warning_amber" color="orange-8" /></template>
            {{ guia.reglasProteina.carne.vaca }} El sábado, el almuerzo es verde + (carne o huevo).
          </q-banner>

          <q-list bordered separator class="rounded-borders">
            <q-expansion-item icon="set_meal" label="Carnes permitidas" header-class="text-weight-medium">
              <q-card>
                <q-card-section class="text-body2">
                  <div v-for="(p, key) in guia.proteinas" :key="key" class="q-mb-sm">
                    <strong>{{ p.label }}:</strong> {{ p.cortes.join(", ") }}.
                  </div>
                  <div class="text-grey-8 q-mt-sm">
                    <strong>Preparación:</strong> {{ guia.reglasProteina.carne.preparacion }}
                  </div>
                  <div class="text-grey-8 q-mt-sm">
                    <strong>Huevo:</strong> {{ guia.reglasProteina.huevo.preparacion }}
                  </div>
                </q-card-section>
              </q-card>
            </q-expansion-item>

            <q-expansion-item icon="eco" label="Hortalizas permitidas" header-class="text-weight-medium">
              <q-card>
                <q-card-section class="text-body2">
                  <div class="q-mb-sm">{{ guia.reglasProteina.verdura.permitidas.join(", ") }}.</div>
                  <div class="text-grey-8">
                    <strong>Preparación:</strong> {{ guia.reglasProteina.verdura.preparacion }}
                  </div>
                </q-card-section>
              </q-card>
            </q-expansion-item>

            <q-expansion-item icon="apple" label="Frutas" header-class="text-weight-medium">
              <q-card>
                <q-card-section class="text-body2">
                  <div>{{ guia.frutas.cantidad }}.</div>
                  <div class="q-my-xs">{{ guia.frutas.formas }}</div>
                  <div>Permitidas: {{ guia.frutas.permitidas.join(", ") }}.</div>
                  <div class="text-bold q-mt-xs">{{ guia.frutas.notaEspecial }}</div>
                </q-card-section>
              </q-card>
            </q-expansion-item>

            <q-expansion-item icon="coffee" label="Colaciones" header-class="text-weight-medium">
              <q-card>
                <q-card-section class="text-body2">{{ guia.notaColaciones }}</q-card-section>
              </q-card>
            </q-expansion-item>

            <q-expansion-item icon="soup_kitchen" label="Caldo casero (opcional)" header-class="text-weight-medium">
              <q-card>
                <q-card-section class="text-body2">{{ guia.caldoOpcional }}</q-card-section>
              </q-card>
            </q-expansion-item>
          </q-list>
        </q-tab-panel>

        <!-- ENTRENAMIENTO -->
        <q-tab-panel name="entrenamiento">
          <div class="text-subtitle1 text-purple text-bold q-mb-sm">
            Carbohidratos extra los días de gimnasio
          </div>

          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="text-subtitle2 text-bold">
                <q-icon name="wb_sunny" color="orange" /> {{ guia.extrasEntrenamiento.almuerzo.titulo }}
              </div>
              <ul class="lista">
                <li v-for="(o, i) in guia.extrasEntrenamiento.almuerzo.opciones" :key="`a-${i}`">{{ o }}</li>
              </ul>
            </q-card-section>
          </q-card>

          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="text-subtitle2 text-bold">
                <q-icon name="nights_stay" color="deep-purple" /> {{ guia.extrasEntrenamiento.cena.titulo }}
              </div>
              <ul class="lista">
                <li v-for="(o, i) in guia.extrasEntrenamiento.cena.opciones" :key="`c-${i}`">{{ o }}</li>
              </ul>
            </q-card-section>
          </q-card>

          <q-banner rounded class="bg-purple-1 text-purple-10 q-mb-sm">
            {{ guia.extrasEntrenamiento.opcional }}
          </q-banner>
          <q-banner rounded class="bg-cyan-1 text-cyan-10">
            {{ guia.extrasEntrenamiento.milanesas }}
          </q-banner>
        </q-tab-panel>

        <!-- RECETAS DEL PLAN -->
        <q-tab-panel name="recetas">
          <q-list bordered separator class="rounded-borders">
            <q-expansion-item
              v-for="r in guia.recetasPlan"
              :key="r.nombre"
              :model-value="recetaAbierta === r.nombre"
              icon="cake"
              :label="r.nombre"
              :caption="r.porciones"
              header-class="text-purple text-weight-medium"
              @update:model-value="(v) => (recetaAbierta = v ? r.nombre : '')"
            >
              <q-card>
                <q-card-section>
                  <div class="text-subtitle2 text-bold">Ingredientes</div>
                  <ul class="lista">
                    <li v-for="(ing, i) in r.ingredientes" :key="`i-${i}`">{{ ing }}</li>
                  </ul>
                  <div class="text-subtitle2 text-bold q-mt-sm">Preparación</div>
                  <ol class="lista">
                    <li v-for="(p, i) in r.pasos" :key="`p-${i}`">{{ p }}</li>
                  </ol>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-list>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { RUTINA_API_URL } from "src/config/api";

const route = useRoute();

const guia = ref(null);
const loading = ref(false);
const error = ref("");
const tab = ref(["resumen", "reglas", "entrenamiento", "recetas"].includes(route.query.tab) ? route.query.tab : "resumen");
const recetaAbierta = ref(typeof route.query.receta === "string" ? route.query.receta : "");

const nombresComida = {
  desayuno: "Desayuno",
  colacion1: "Colación 1",
  almuerzo: "Almuerzo",
  merienda: "Merienda",
  entrenamiento: "Ejercicio",
  colacion2: "Colación 2",
  cena: "Cena",
};

const filasHorario = computed(() =>
  Object.entries(guia.value?.horarios || {}).map(([key, h]) => ({
    key,
    nombre: nombresComida[key] || key,
    label: h.label,
  }))
);

const cargarGuia = async () => {
  loading.value = true;
  error.value = "";
  try {
    const response = await fetch(`${RUTINA_API_URL}/rutina/plan`);
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || "No se pudo cargar el plan");
    }
    guia.value = data.data;
  } catch (e) {
    error.value = e.message || "No se pudo cargar el plan. Probá de nuevo en unos minutos.";
  } finally {
    loading.value = false;
  }
};

onMounted(cargarGuia);
</script>

<script>
export default {
  name: "MiPlan",
};
</script>

<style scoped>
.hero {
  border-radius: 16px;
  background: linear-gradient(135deg, #fbf7ff 0%, #f0f7ff 100%);
  border: 1px solid rgba(138, 90, 157, 0.15);
}
.plan-card {
  border-radius: 16px;
}
.lista {
  margin: 4px 0 0;
  padding-left: 20px;
  line-height: 1.6;
}
.swatch {
  display: inline-block;
  width: 30px;
  height: 14px;
  border-radius: 5px;
  vertical-align: middle;
}
.swatch--rojo {
  background: #e53935;
}
.swatch--amarillo {
  background: #fdd835;
}
.swatch--mixto {
  background: linear-gradient(90deg, #e53935 50%, #fdd835 50%);
}
</style>
