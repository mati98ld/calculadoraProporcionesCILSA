<template>
  <q-dialog v-model="dialogOpen" persistent>
    <q-card style="min-width: 350px; border-radius: 16px;" class="q-pa-md">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-purple text-bold">
          {{ isEdit ? "Configurar Perfil" : "Crear Perfil Personal" }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
          <q-input
            v-model="localForm.nombre"
            outlined
            dense
            label="Tu nombre"
            :rules="[(val) => !!val || 'El nombre es obligatorio']"
            :disable="isEdit"
            hint="El nombre te identificará para entrar siempre a tu rutina."
          />

          <q-input
            v-model="localForm.objetivo"
            outlined
            dense
            label="Objetivo"
            placeholder="Bajar grasa, ganar músculo, etc."
          />

          <q-select
            v-model="localForm.diasEntrenamiento"
            :options="diasSemanaOptions"
            multiple
            use-chips
            outlined
            dense
            label="Días de gimnasio"
          />

          <q-select
            v-model="localForm.horaEntrenamiento"
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
              :label="isEdit ? 'Guardar Cambios' : 'Crear Perfil'"
              color="primary"
              type="submit"
              :loading="loading"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useQuasar } from "quasar";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  perfil: {
    type: Object,
    default: () => ({
      nombre: "",
      objetivo: "",
      diasEntrenamiento: [],
      horaEntrenamiento: "ninguno",
    }),
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  perfilesExistentes: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue", "save"]);
const $q = useQuasar();

const dialogOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const localForm = ref({
  nombre: "",
  objetivo: "",
  diasEntrenamiento: [],
  horaEntrenamiento: "ninguno",
});

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      localForm.value = {
        nombre: props.perfil.nombre || "",
        objetivo: props.perfil.objetivo || "",
        diasEntrenamiento: [...(props.perfil.diasEntrenamiento || [])],
        horaEntrenamiento: props.perfil.horaEntrenamiento || "ninguno",
      };
    }
  },
  { immediate: true }
);

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

const handleSubmit = () => {
  const nombre = localForm.value.nombre.trim();
  if (!nombre) return;

  if (!props.isEdit) {
    const existe = props.perfilesExistentes.some(
      (p) => p.toLowerCase() === nombre.toLowerCase()
    );
    if (existe) {
      $q.notify({
        type: "warning",
        message: `El nombre "${nombre}" ya está en uso. Por favor, elegí otro nombre.`,
      });
      return;
    }
  }

  emit("save", { ...localForm.value, nombre });
};
</script>
