<template>
  <div>
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
            @click="emit('refresh-history')"
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
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  progreso: {
    type: Object,
    required: true,
  },
  resumenEntrenamiento: {
    type: String,
    default: "",
  },
  resumenDia: {
    type: String,
    default: "",
  },
  historial: {
    type: Array,
    default: () => [],
  },
  historyLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["refresh-history"]);

const progressValue = computed(() => {
  const percent = Number(props.progreso.porcentajeComplecion || 0);
  return Math.max(0, Math.min(1, percent / 100));
});

const progressText = computed(() => {
  const percent = Number(props.progreso.porcentajeComplecion || 0).toFixed(0);
  return `${props.progreso.comidasConsumidas}/${props.progreso.totalComidas} completados (${percent}%)`;
});

const formatearFecha = (value) =>
  new Date(value).toLocaleDateString("es-ES", {
    month: "short",
    day: "2-digit",
    timeZone: "UTC",
  });

const formatearPorcentaje = (value) => `${Number(value || 0).toFixed(0)}%`;
</script>

<style scoped>
.progress-header {
  border-radius: 16px;
  background: #ffffff;
  border-left: 5px solid #8a5a9d;
}

.border-bottom-soft {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
</style>
