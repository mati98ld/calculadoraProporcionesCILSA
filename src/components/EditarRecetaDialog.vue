<template>
  <q-dialog v-model="dialogOpen">
    <q-card class="bg-secondary">
      <q-card-section class="row q-pb-none">
        <div class="text-h6 text-black text-bold">
          {{ title }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div class="row justify-around text-bold text-h7 text-primary">
          Nombre de la receta:
        </div>
        <q-input v-model="editNombreReceta" class="text-h5" outlined autogrow style="min-width: 300px" />
      </q-card-section>
      <q-card-section style="padding-top: 0">
        <div class="row justify-around text-bold text-h7 text-primary q-mb-xs">
          Categoría:
        </div>
        <q-select
          v-model="editTipoAlimento"
          :options="tipoAlimentoOptions"
          emit-value
          map-options
          outlined
          dense
          label="Categoría"
          style="min-width: 300px"
          class="q-mb-md"
        />
      </q-card-section>
      <q-card-section style="padding-top: 0">
        <div class="row justify-around text-bold text-h7 text-primary">
          Ingredientes:
        </div>
        <TablaDeIngredientes :ingredientes="editIngredientes" :editable="true" :addIng="true" />
      </q-card-section>
      <div class="bg-secondary q-pa-xs" style="border-radius: 10px">
        <div class="row justify-around text-bold text-h7 text-primary">
          Descripción:
        </div>
        <div class="row justify-around">
          <q-card-section style="max-height: 300px; padding: 0"
            class="scroll text-black text-body1 text-center text-justify">
            <q-input v-model="editDescripcion" filled autogrow style="min-width: 300px" />
          </q-card-section>
        </div>
      </div>
      <q-card-section class="text-center">
        <q-btn label="Guardar" icon-right="save" color="primary" style="width: 100%" @click="handleSave"
          :loading="loading" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import TablaDeIngredientes from "src/components/TablaDeIngredientes.vue";
import { useQuasar } from "quasar";
import { API_URL } from "src/config/api";
import { utils } from "src/js/utils";
import { computed, ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  recipe: {
    type: Object,
    default: () => ({ nombreReceta: "", ingredientes: [], descripcion: "", tipoAlimento: "" }),
  },
  title: {
    type: String,
    default: "Editar receta",
  },
});

const emit = defineEmits(["update:modelValue", "saved"]);
const $q = useQuasar();

const editNombreReceta = ref("");
const editDescripcion = ref("");
const editIngredientes = ref([]);
const editTipoAlimento = ref("");
const originalName = ref("");
const loading = ref(false);

const tipoAlimentoOptions = [
  { label: "Proteína", value: "proteina" },
  { label: "Verdura", value: "verdura" },
  { label: "Carbohidrato", value: "carbohidrato" },
  { label: "Mixto (Proteína + Verdura)", value: "mixto" },
  { label: "Desayuno / Merienda", value: "desayuno_merienda" },
  { label: "Sin especificar", value: "" },
];

const dialogOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const syncFromRecipe = () => {
  editNombreReceta.value = props.recipe?.nombreReceta || "";
  editDescripcion.value = props.recipe?.descripcion || "";
  editIngredientes.value = JSON.parse(
    JSON.stringify(props.recipe?.ingredientes || [])
  );
  editTipoAlimento.value = props.recipe?.tipoAlimento || "";
  originalName.value = props.recipe?.nombreReceta || "";
};

const handleSave = async () => {
  loading.value = true;
  const recetaEdit = {
    nombreReceta: editNombreReceta.value.trim(),
    ingredientes: editIngredientes.value,
    descripcion: editDescripcion.value,
    tipoAlimento: editTipoAlimento.value,
  };

  $q.dialog({
    title: "Guardar cambios",
    message: "¿Desea guardar la receta editada?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    if (recetaEdit.ingredientes.length < 1) {
      $q.notify({
        type: "warning",
        message: "La receta debe tener al menos un ingrediente",
      });
      loading.value = false;
      return;
    }

    if (
      recetaEdit.nombreReceta !== originalName.value &&
      (await utils.existeLaReceta(recetaEdit.nombreReceta))
    ) {
      $q.notify({
        type: "negative",
        message: "Ya existe la receta " + recetaEdit.nombreReceta.toString().trim(),
      });
      loading.value = false;
      return;
    }

    await fetch(`${API_URL}/recetas/?nombreReceta=` + originalName.value, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recetaEdit),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        emit("saved", recetaEdit);
        dialogOpen.value = false;
      })
      .catch((error) => {
        console.error("Error:", error);
      })
      .finally(() => {
        setTimeout(() => {
          loading.value = false;
        }, 1000);
      });

    $q.notify({
      message: "Receta editada correctamente",
      type: "positive",
    });
  }).onCancel(() => {
    loading.value = false;
  });
};

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      syncFromRecipe();
    }
  }
);

watch(
  () => props.recipe,
  () => {
    if (props.modelValue) {
      syncFromRecipe();
    }
  },
  { deep: true }
);
</script>
