<template>
  <q-page padding class="bg-secondary">
    <div class="text-center q-pa-md q-mt-xs">
      <div class="text-h5 text-purple text-bold">
        {{ proporcion.nombreReceta }}
      </div>
    </div>
    <div class="q-mx-xs">
      <TablaDeIngredientes :ingredientes="proporcion.ingredientes" :maxHeight="'1000px'"></TablaDeIngredientes>
    </div>
    <div class="text-purple row justify-around text-bold text-h6 q-pa-xs q-mt-md">
      Descripción:
    </div>
    <div class="row justify-around">
      <div style="max-height: 400px; min-width: 100%; border: solid; border-color: purple"
        class="scroll text-black text-body1 q-pa-md text-justify">
        <pre wrap class="q-ma-none">{{ recetaOriginal.descripcion }}
        </pre>
      </div>
    </div>
    <div class="row justify-center">
      <q-btn :disabled="seGuardo" label="Guardar proporcion" color="primary" class="q-ma-md col-6"
        @click="guardarProporcion"></q-btn>
    </div>
  </q-page>
</template>

<script setup>
import { useRoute } from "vue-router";
import { useQuasar } from "quasar";
import TablaDeIngredientes from "src/components/TablaDeIngredientes.vue";
import { ref, onMounted } from "vue";
import { API_URL } from 'src/config/api';

const route = useRoute();
const $q = useQuasar();

const key = route.query.receta;
const ingrediente = route.query.ingrediente;
const cantidad = route.query.cantidad;
const seGuardo = ref(false);

const recetaOriginal = ref({
  nombreReceta: "",
  ingredientes: [],
  descripcion: "",
});
const proporcion = ref({ nombreReceta: "", ingredientes: [], descripcion: "" });

// Cargar los datos de la receta
const cargarReceta = async () => {
  try {
    const response = await fetch(
      `${API_URL}/recetas/?nombreReceta=${key}`
    );
    const data = await response.json();
    recetaOriginal.value = data;

    // Calcular la proporción una vez que la receta está cargada
    const ingredienteOriginal = recetaOriginal.value.ingredientes.find(
      (ingredient) => ingredient.ingrediente === ingrediente
    );

    if (ingredienteOriginal) {
      proporcion.value = {
        ...recetaOriginal.value,
        nombreReceta: `${recetaOriginal.value.nombreReceta} en proporcion a ${cantidad} ${ingredienteOriginal.unidad} de ${ingrediente}`,
        ingredientes: recetaOriginal.value.ingredientes.map((item) => ({
          ...item,
          cantidad: parseFloat(
            ((cantidad * item.cantidad) / ingredienteOriginal.cantidad).toFixed(
              2
            )
          ),
        })),
      };
    } else {
      console.error("Ingrediente original no encontrado.");
    }
  } catch (error) {
    console.error("Error al cargar la receta:", error);
  }
};

onMounted(async () => {
  await cargarReceta();
});

// Guardar proporción
const guardarProporcion = async () => {
  if (!proporcion.value) return;

  try {
    //await fetch(`http://localhost:3000/recetas`, {
    await fetch(`${API_URL}/recetas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombreReceta: `${proporcion.value.nombreReceta}`,
        ingredientes: proporcion.value.ingredientes,
        descripcion: proporcion.value.descripcion,
        original: key,
        esProporcion: true,
      }),
    })
      .then((response) => {
        response.json();
      })
      .then((data) => {
        console.log("Success:", data);
        seGuardo.value = true;
        $q.notify({
          type: "positive",
          message: "Proporcion guardada exitosamente",
        });
      });
  } catch (error) {
    console.error("Error al guardar la receta:", error);
    $q.notify({
      type: "negative",
      message: "Error al guardar la receta",
    });
  }
};
</script>
