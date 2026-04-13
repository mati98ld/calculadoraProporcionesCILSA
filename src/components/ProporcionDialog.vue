<template>
  <q-dialog v-model="dialogOpen">
    <q-card class="bg-primary">
      <q-card-section class="row q-pb-none">
        <div class="text-h5 q-pl-md text-black text-bold">
          {{ title }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <q-form @submit.prevent="handleSubmit">
          <q-select v-model="selectedIngredient" class="q-pa-none bg-secondary q-mb-lg q-mt-xs" outlined clearable
            label="Ingrediente" :options="options"
            :rules="[(val) => (val && val.length > 0) || 'Este campo está vacío']" />
          <div v-if="selectedIngredient != null" class="text-center q-mt-md q-mb-xs bg-secondary text-purple"
            style="padding: 3px; ">
            Cantidad en la receta original: {{ cantidadOriginal }}
          </div>
          <q-input v-model="quantity" class="q-pa-none bg-secondary q-mb-lg q-mt-xs" outlined type="text"
            label="Cantidad" lazy-rules :rules="[
              (val) => (val && !isNaN(val)) || 'Por favor, ingresa un número válido',
              (val) => (val && val.length > 0) || 'Este campo está vacío',
            ]" />
          <q-btn label="Calcular" icon-right="calculate" text-color="purple" color="secondary" style="width: 100%"
            type="submit" class="q-mt-xs" :loading="submitting" :disable="submitting" />
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  recipeName: {
    type: String,
    default: "",
  },
  ingredients: {
    type: Array,
    default: () => [],
  },
  options: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: "En proporcion a..",
  },
});

const emit = defineEmits(["update:modelValue", "submit"]);
const router = useRouter();

const selectedIngredient = ref(null);
const quantity = ref(null);
const submitting = ref(false);

const dialogOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const resetForm = () => {
  selectedIngredient.value = null;
  quantity.value = null;
};

const cantidadOriginal = computed(() => {
  const ingredient = props.ingredients.find(
    (item) => item.ingrediente === selectedIngredient.value
  );

  if (!ingredient) {
    return "";
  }

  return `${ingredient.cantidad} ${ingredient.unidad}`;
});

const handleSubmit = async () => {
  if (submitting.value) {
    return;
  }

  submitting.value = true;

  const payload = {
    ingrediente: selectedIngredient.value,
    cantidad: quantity.value,
  };

  try {
    emit("submit", payload);

    await router.push({
      path: "/calcu",
      query: {
        receta: props.recipeName,
        ingrediente: payload.ingrediente,
        cantidad: payload.cantidad,
      },
    });

    dialogOpen.value = false;
    resetForm();
  } finally {
    submitting.value = false;
  }
};

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      resetForm();
    }
  }
);
</script>
