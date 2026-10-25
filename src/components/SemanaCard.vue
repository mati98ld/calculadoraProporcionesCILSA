<template>
  <q-card class="shadow-3 q-mt-md semana-card">
    <q-card-section>
      <div class="row items-center justify-between">
        <div class="text-subtitle1 text-purple text-bold">Tu semana en el plan</div>
        <q-btn flat dense icon="sync" color="primary" :loading="loading" @click="emit('refresh')" />
      </div>

      <div v-if="!semana" class="text-body2 text-grey-7 q-mt-sm">
        {{ loading ? "Cargando..." : "No se pudo cargar el resumen de la semana." }}
      </div>

      <template v-else>
        <!-- Carne vacuna -->
        <div class="q-mt-sm">
          <div class="row items-center justify-between q-mb-xs">
            <span class="text-body2 text-grey-8">
              <q-icon name="set_meal" color="red-7" size="18px" /> Carne vacuna (máx.
              {{ semana.vaca.maxima }}/semana, nunca en la cena)
            </span>
            <span class="text-body2 text-bold" :class="vacaAgotada ? 'text-negative' : ''">
              {{ semana.vaca.usada }}/{{ semana.vaca.maxima }}
            </span>
          </div>
          <q-linear-progress
            :value="Math.min(1, semana.vaca.usada / semana.vaca.maxima)"
            :color="vacaAgotada ? 'negative' : 'red-4'"
            track-color="grey-3"
            rounded
            size="10px"
          />
        </div>

        <q-separator class="q-my-md" />

        <!-- Distribución por día -->
        <div class="text-caption text-grey-7 q-mb-xs">
          Almuerzo / Cena de cada día
        </div>
        <div
          v-for="d in semana.dias"
          :key="d.dia"
          :class="['row items-center no-wrap q-py-xs dia-row', d.fecha === hoy ? 'dia-row--hoy' : '']"
        >
          <div class="dia-nombre text-body2" :class="d.fecha === hoy ? 'text-bold text-purple' : ''">
            {{ nombreDia(d.dia) }}
          </div>
          <div class="row items-center q-gutter-xs col">
            <span class="swatch" :class="`swatch--${d.distribucion.almuerzo}`">
              <q-tooltip>Almuerzo: {{ textoColor(d.distribucion.almuerzo) }}</q-tooltip>
            </span>
            <span class="text-grey-6">/</span>
            <span class="swatch" :class="`swatch--${d.distribucion.cena}`">
              <q-tooltip>Cena: {{ textoColor(d.distribucion.cena) }}</q-tooltip>
            </span>
            <q-icon v-if="d.esEntrenamiento" name="fitness_center" color="purple" size="16px" />
          </div>
          <div class="text-caption text-grey-7 dia-pct">
            {{ d.registrado ? `${d.porcentaje}%` : "–" }}
          </div>
        </div>

        <div class="row q-gutter-sm q-mt-sm text-caption text-grey-7">
          <span><span class="swatch swatch--rojo" /> Carne 160-180 g</span>
          <span><span class="swatch swatch--amarillo" /> Huevo (hasta 3 claras)</span>
          <span><span class="swatch swatch--mixto" /> Carne o huevo</span>
        </div>
      </template>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  semana: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  hoy: { type: String, default: "" },
});

const emit = defineEmits(["refresh"]);

const vacaAgotada = computed(
  () => props.semana && props.semana.vaca.usada >= props.semana.vaca.maxima
);

const nombres = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sábado",
  domingo: "Domingo",
};
const nombreDia = (d) => nombres[d] || d;

const textoColor = (c) =>
  ({ rojo: "carne", amarillo: "huevo", mixto: "carne o huevo" })[c] || c;
</script>

<style scoped>
.semana-card {
  border-radius: 16px;
}
.dia-row {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 6px;
}
.dia-row--hoy {
  background: rgba(138, 90, 157, 0.08);
}
.dia-nombre {
  width: 84px;
  padding-left: 4px;
}
.dia-pct {
  width: 40px;
  text-align: right;
  padding-right: 4px;
}
.swatch {
  display: inline-block;
  width: 26px;
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
