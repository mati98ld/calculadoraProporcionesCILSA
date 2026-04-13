<template>
  <q-table :style="{ maxHeight: maxHeight || '300px' }" no-data-label="No hay ingredientes añadidos" :columns="columns"
    :rows="ingredientes" class="bg-secondary my-sticky-virtscroll-table" :hide-bottom="!(ingredientes[0] == null)"
    :selection="seleccion" exact v-model:selected="selected" row-key="ingrediente" virtual-scroll
    :pagination="pagination" :rows-per-page-options="[0]">
  </q-table>
  <div v-show="editable" class="row justify-end q-mt-sm">
    <q-btn v-show="seleccion == 'single'" color="purple" outline @click="cancelar"
      class="q-pa-sm q-mr-sm">cancelar</q-btn>
    <q-btn v-if="addIng && seleccion == 'none'" icon="add" round color="primary" class="q-mr-xl"
      @click="agregarIng = true" :disable="seleccion == 'single'"></q-btn>
    <q-btn v-if="!(ingredientes[0] == null) && selected[0] == null" label="Eliminar un ingrediente" color="primary"
      @click="seccionEliminar" :disable="seleccion == 'single'"></q-btn>
    <q-btn v-else-if="!(ingredientes[0] == null)" label="Eliminar" color="primary"
      @click="eliminarIngrediente(ingredientes)"></q-btn>
  </div>

  <q-dialog v-model="agregarIng" @hide="reset()">
    <q-card class="bg-primary">
      <q-card-section class="row q-pb-none">
        <div class="text-h5 q-pl-md text-black text-bold">
          Agregar ingrediente
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <q-form @submit.prevent="agregar(ingredientes)">
          <q-input class="q-pa-none bg-secondary q-mb-md" outlined type="text" label="Ingrediente" v-model="ingrediente"
            lazy-rules :rules="[
              (val) => (val && val.length > 0) || 'Este campo está vacío',
            ]"></q-input>
          <q-input class="q-pa-none bg-secondary q-mb-md" outlined type="text" label="Cantidad" v-model="cantidad"
            lazy-rules :rules="[
              (val) =>
                (val && !isNaN(val)) || 'Por favor, ingresa un número válido',
              (val) => (val && val.length > 0) || 'Este campo está vacío',
            ]"></q-input>
          <q-select class="q-pa-none bg-secondary q-mb-md" outlined clearable label="Unidad" v-model="unidad"
            :options="opciones"></q-select>
          <q-btn label="Agregar" text-color="purple" color="secondary" style="width: 100%" type="submit" />
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from "vue";
import { useQuasar } from "quasar";

const $q = useQuasar();
const agregarIng = ref(false);
const opciones = ref(["cc", "ml", "g", "cda", "cdita", "taza", "ud"]);
const unidad = ref();
const cantidad = ref();
const ingrediente = ref();

const formatCantidadDisplay = (valor) => {
  const numero = typeof valor === "number" ? valor : parseFloat(valor);

  if (Number.isNaN(numero)) {
    return valor;
  }

  if (Math.abs(numero - 0.25) < 0.0000001) return "1/4";
  if (Math.abs(numero - 0.5) < 0.0000001) return "1/2";
  if (Math.abs(numero - 0.75) < 0.0000001) return "3/4";

  return valor;
};

const columns = [
  {
    name: "ingrediente",
    label: "Ingrediente",
    align: "left",
    field: "ingrediente",
    sortable: true,
  },
  {
    name: "cantidad",
    label: "Cantidad",
    align: "right",
    field: "cantidad",
    format: (val) => formatCantidadDisplay(val),
  },
  {
    name: "unidad",
    label: "Unidad",
    align: "left",
    field: "unidad",
    sortable: true,
  },
];

const selected = ref([]);

const cancelar = () => {
  seleccion.value = "none";
  selected.value = [];
};

const index = (arr, ele) => {
  let busqueda = JSON.stringify(ele[0]);
  return arr.findIndex(
    (ingredienteSelected) => JSON.stringify(ingredienteSelected) === busqueda
  );
};

const eliminarIngrediente = (array) => {
  $q.dialog({
    title: "Eliminar ingrediente",
    message: "¿Desea eliminar el ingrediente seleccionado?",
    cancel: true,
    persistent: true,
  }).onOk(() => {
    array.splice(index(array, selected.value), 1);
    selected.value = [];
    seleccion.value = "none";
    $q.notify({
      message: "Ingrediente eliminado correctamente",
      type: "positive",
    });
  });
};

const seleccion = ref("none");

const seccionEliminar = () => {
  seleccion.value = "single";
};

const pagination = { rowsPerPage: 0 };

const agregar = (ing) => {
  if (
    ing.some(
      (i) => i.ingrediente.toLowerCase() === ingrediente.value.toLowerCase()
    )
  ) {
    $q.notify({
      type: "warning",
      message: "El ingrediente ya existe",
    });
  } else {
    ing.push({
      ingrediente: ingrediente.value,
      cantidad: cantidad.value,
      unidad: unidad.value == null ? "ud" : unidad.value,
    });
    reset();
  }
};

const reset = () => {
  agregarIng.value = false;
  ingrediente.value = "";
  cantidad.value = "";
  unidad.value = null;
};
</script>

<script>
export default {
  props: {
    ingredientes: Array,
    editable: Boolean,
    addIng: Boolean,
    maxHeight: String,
  },
};
</script>

<style lang="scss">
.my-sticky-virtscroll-table {
  /* height or max-height is important */
  max-height: 300px;

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th {
    /* bg color is important for th; just specify one */
    background-color: #f5d8f0;
  }

  thead tr th {
    position: sticky;
    z-index: 1;
  }

  /* this will be the loading indicator */
  thead tr:last-child th {
    /* height of all previous header rows */
    top: 48px;
  }

  thead tr:first-child th {
    top: 0;
  }

  /* prevent scrolling behind sticky top row on focus */
  tbody {
    /* height of all previous header rows */
    scroll-margin-top: 48px;
  }
}
</style>
