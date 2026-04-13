<template>
  <q-page padding class="bg-secondary">
    <div class="text-center q-pa-md q-mt-xs">
      <div class="text-h5 text-purple text-bold">
        {{ receta.nombreReceta }}
      </div>
    </div>
    <div class="q-mx-xs">
      <TablaDeIngredientes :ingredientes="receta.ingredientes" :maxHeight="'1000px'"></TablaDeIngredientes>
    </div>
    <div class="text-purple row justify-around text-bold text-h6 q-pa-xs q-mt-md">
      Descripción:
    </div>
    <div class="row justify-around">
      <div style="max-height: 400px; min-width: 100%; border: solid; border-color: purple"
        class="scroll text-black text-body1 q-pa-md text-justify">
        <pre wrap class="q-ma-none">{{ receta.descripcion }}
        </pre>
      </div>
    </div>
    <div class="row justify-center">
      <q-btn v-if="!receta.esProporcion" label="Calcular proporcion" class="q-ma-md q-mt-lg col-6"
        icon-right="calculate" color="primary" @click="propor = true" />
      <q-btn v-if="!receta.esProporcion" label="Editar receta" class="q-mx-md q-mb-lg col-6" icon-right="edit"
        color="primary" @click="editar = true" />
    </div>
    <ProporcionDialog v-model="propor" :recipe-name="receta.nombreReceta" :ingredients="receta.ingredientes"
      :options="opciones" />
    <EditarRecetaDialog v-model="editar" :recipe="receta" @saved="cargarReceta" />
  </q-page>
</template>

<script setup>
import { useRoute } from "vue-router";
import TablaDeIngredientes from "src/components/TablaDeIngredientes.vue";
import { ref, onMounted } from "vue";
import ProporcionDialog from "src/components/ProporcionDialog.vue";
import EditarRecetaDialog from "src/components/EditarRecetaDialog.vue";
import { API_URL } from 'src/config/api';

const route = useRoute();

const key = route.query.receta;
const receta = ref({ nombreReceta: "", ingredientes: [], descripcion: "" });
const propor = ref(false);
const editar = ref(false);
const opciones = ref([]);

// Cargar los datos de la receta
const cargarReceta = async () => {
  try {
    const response = await fetch(
      `${API_URL}/recetas/?nombreReceta=${key}`
    );
    const data = await response.json();
    receta.value = data;
    opciones.value = receta.value.ingredientes.map((item) => item.ingrediente);

  } catch (error) {
    console.error("Error al cargar la receta:", error);
  }
};

onMounted(async () => {
  await cargarReceta();
});

</script>
