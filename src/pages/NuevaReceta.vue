<template>
  <q-page padding class="bg-secondary">
    <q-form @submit.prevent="crearReceta">
      <h6 class="row justify-around text-bold text-purple q-ma-xs">
        Nombre de la receta:
      </h6>
      <q-input outlined v-model="recetaName" style="text-align: center" lazy-rules
        :rules="[(val) => (val && val.length > 0) || 'Este campo está vacío']" padding input-style="align-item:"
        text-center>
      </q-input>
      <q-separator></q-separator>
      <h6 class="row justify-around text-bold text-purple q-ma-xs">
        Agrega los ingredientes de la receta
      </h6>
      <q-form @submit.prevent="agregarIngrediente" @reset="reset" class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-4">
          <q-input class="q-pa-xs" outlined label="Ingrediente" v-model="ingrediente" lazy-rules :rules="[
            (val) => (val && val.length > 0) || 'Este campo está vacío',
          ]"></q-input>
        </div>
        <div class="col-12 col-sm-4">
          <q-input class="q-pa-xs" outlined type="text" label="Cantidad" v-model="cantidad" lazy-rules :rules="[
            (val) =>
              (val && !isNaN(val)) || 'Por favor, ingresa un número válido',
            (val) => (val && val.length > 0) || 'Este campo está vacío',
          ]"></q-input>
        </div>
        <div class="col-12 col-sm-4">
          <q-select class="q-pa-xs" outlined clearable label="Unidad" v-model="unidad" :options="opciones"
            selected="ud(s)"></q-select>
        </div>
        <div class="row col-12 justify-end q-pt-xs q-mb-md">
          <q-btn label="Agregar" color="primary" type="submit" />
          <q-btn label="Borrar" color="primary" outline class="q-ml-sm" type="reset" />
        </div>
      </q-form>
      <TablaDeIngredientes :ingredientes="ingredientes" :editable="true" />
      <div class="q-mt-md">
        <h6 class="text-bold text-purple q-ma-xs">Descripción:</h6>
        <q-input v-model="descripcion" type="textarea" filled />
      </div>
      <div class="row justify-center">
        <q-btn :loading="loading" label="Crear receta" color="primary" class="q-ma-md col-6" type="submit"></q-btn>
      </div>
    </q-form>
  </q-page>
</template>

<script setup>
import TablaDeIngredientes from "src/components/TablaDeIngredientes.vue";
import { ref } from "vue";
import { useQuasar } from "quasar";
import { useRoute, useRouter } from "vue-router";
import { API_URL } from 'src/config/api';
import { utils } from 'src/js/utils';

const $q = useQuasar();
const ingrediente = ref(null);
const unidad = ref(null);
const cantidad = ref(null);
const opciones = ref(["cc", "ml", "g", "cda", "cdita", "taza", "ud"]);
const recetaName = ref(null);
const descripcion = ref("");
const receta = ref();
const ingredientes = ref([]);
const loading = ref(false);

const agregarIngrediente = () => {
  if (
    ingredientes.value.some(
      (i) => i.ingrediente.toLowerCase() === ingrediente.value.toLowerCase()
    )
  ) {
    $q.notify({
      type: "warning",
      message: "El ingrediente ya existe",
    });
  } else {
    ingredientes.value = [
      ...ingredientes.value,
      {
        ingrediente: ingrediente.value.trim(),
        cantidad: cantidad.value,
        unidad: unidad.value == null ? "ud" : unidad.value,
      },
    ];
    reset();
  }
};

const router = useRouter();
const goToMisRecetas = () => {
  router.push("/misrecetas");
};

const crearReceta = async () => {
  // deshabilitar botón de crear receta mientras se verifica si existe la receta y meter un loader
  loading.value = true;
  if (ingredientes.value.length < 1) {
    $q.notify({
      type: "warning",
      message: "La receta debe tener al menos un ingrediente",
    });
    loading.value = false;
  } else if (await utils.existeLaReceta(recetaName.value)) {
    $q.notify({
      type: "negative",
      message: "Ya existe la receta " + recetaName.value.toString().trim(),
    });
    loading.value = false;
  } else {
    receta.value = {
      // Eliminar espacios en blanco al inicio y al final del nombre de la receta
      nombreReceta: recetaName.value.trim(),
      ingredientes: ingredientes.value,
      descripcion: descripcion.value,
    };
    try {
      fetch(`${API_URL}/recetas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(receta.value),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Success:", data);
          descripcion.value = "";
          recetaName.value = null;
          ingredientes.value = [];
        })
        .catch((error) => {
          console.error("Error:", error);
        })
        .finally(() => {
          loading.value = false;
        });

      $q.notify({
        type: "positive",
        message: "Receta creada exitosamente",
      });
      goToMisRecetas();
    } catch (error) {
      $q.notify({
        type: "negative",
        message: "Error al guardar la receta",
      });
    }
  }
};

const reset = () => {
  ingrediente.value = null;
  unidad.value = null;
  cantidad.value = null;
};
</script>
