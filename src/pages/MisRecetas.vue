<template>
  <q-page padding class="bg-secondary column">
    <q-btn v-if="keys.length > 1" flat round color="primary" icon="sort_by_alpha" size="15px"
      class="absolute-top-left q-mt-lg q-ml-md" @click="ordenar()" />
    <q-btn-dropdown flat round color="primary" icon="filter_list" size="14px" class="absolute-top-right q-mt-lg q-mr-xs"
      v-if="mounted">
      <q-list separator class="shadow-3">
        <q-item clickable v-close-popup @click="todas()" class="bg-primary text-center">
          <q-item-section>
            <q-item-label class="text-blue-grey-1 text-subtitle1">Todas</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="favoritos()" class="bg-primary text-center">
          <q-item-section>
            <q-item-label class="text-blue-grey-1 text-subtitle1">Favoritas</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="originales()" class="bg-primary text-center">
          <q-item-section>
            <q-item-label class="text-blue-grey-1 text-subtitle1">Originales</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="proporciones()" class="bg-primary text-center">
          <q-item-section>
            <q-item-label class="text-blue-grey-1 text-subtitle1">Proporciones</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
    <div class="row justify-center" v-if="mounted">
      <q-input rounded outlined v-model="text" clearable placeholder="Buscar receta" class="q-mt-md q-mb-md"
        @update:model-value="search">
        <template v-slot:prepend></template>
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>
    <q-separator v-if="keys.length" class="q-mt-xs"></q-separator>
    <div v-if="!loading" class="row justify-center">
      <h6 class="text-bold text-purple q-ma-md text-center">{{ titulo }}</h6>
    </div>
    <q-separator v-if="keys.length" class="q-mt-xs"></q-separator>
    <div v-if="loading" class="absolute-center">
      <q-spinner color="primary" size="50px" />
    </div>
    <div v-else>
      <q-list separator>
        <q-item v-for="receta in keys" :key="receta" class="q-pl-xs q-pr-xs">
          <q-item-section side>
            <q-checkbox size="lg" v-model="keys[
              keys.findIndex((r) => r.nombreReceta === receta.nombreReceta)
            ].favorita
              " checked-icon="star" unchecked-icon="star_border" indeterminate-icon="help"
              @click="favorita(receta.nombreReceta)" />
          </q-item-section>
          <q-item-section>
            <h6 class="text-bold text-purple q-ma-xs">
              · {{ receta.nombreReceta }}
            </h6>
          </q-item-section>

          <q-item-section avatar>
            <q-fab :model-value="fabAbierto === receta.nombreReceta" @update:model-value="(abierto) => {
              fabAbierto = abierto ? receta.nombreReceta : null;
            }" color="primary" icon="keyboard_arrow_left" push round dense direction="left" padding="xs">
              <q-fab-action v-if="!receta.esProporcion" push color="primary" round icon="calculate" dense @click.stop="
                async () => {
                  await obtenerReceta(receta.nombreReceta);
                  propor = true;
                }
              " />
              <q-fab-action push color="primary" round icon="visibility" dense @click.stop="
                async () => {
                  await obtenerReceta(receta.nombreReceta);
                  mostrar = true;
                }
              " />
              <q-fab-action v-if="!receta.esProporcion" push color="primary" round icon="edit" dense @click.stop="
                async () => {
                  await obtenerReceta(receta.nombreReceta);
                  editar = true;
                }
              " />
              <q-fab-action push color="primary" round icon="delete" dense
                @click.stop="eliminarReceta(receta.nombreReceta)" />
            </q-fab>
          </q-item-section>
        </q-item>
      </q-list>
      <q-dialog v-model="mostrar">
        <q-card class="bg-primary">
          <q-card-section class="q-pl-sm q-pr-sm q-pb-sm">
            <q-btn icon="close" flat round dense v-close-popup padding="none" class="float-right" />
            <div class="text-h5 text-secondary text-bold text-center">
              {{ $receta.nombreReceta }}
            </div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <TablaDeIngredientes :ingredientes="$receta.ingredientes"></TablaDeIngredientes>
          </q-card-section>
          <div class="bg-secondary q-pa-xs q-ml-md q-mr-md" style="border-radius: 10px">
            <div class="text-black row justify-around text-bold text-h6">
              Descripción:
            </div>
            <div class="row justify-around">
              <q-card-section style="max-height: 300px" class="scroll text-black text-body1 text-center text-justify">
                <pre wrap class="q-ma-none">{{ $receta.descripcion }} </pre>
              </q-card-section>
            </div>
          </div>
          <q-card-section class="text-center">
            <q-btn v-if="!$receta.esProporcion" label="Ir a la receta" icon-right="menu_book" text-color="purple"
              color="secondary" style="width: 100%" @click="verReceta" />
            <q-btn v-if="!$receta.esProporcion" label="Calcular proporcion" class="q-mt-md" icon-right="calculate"
              text-color="purple" color="secondary" style="width: 100%" @click="propor = true" />
          </q-card-section>
        </q-card>
      </q-dialog>
      <template v-if="$receta">
        <ProporcionDialog v-model="propor" :recipe-name="$receta.nombreReceta" :ingredients="$receta.ingredientes"
          :options="opciones" />
        <EditarRecetaDialog v-model="editar" :recipe="$receta" @saved="fetchRecetas" />
      </template>
      <div v-if="!keys.length" class="absolute-center text-center no-recetas">
        <q-icon name="sentiment_dissatisfied" size="90px" color="primary" />
        <div class="text-h5 text-primary">No hay recetas para mostrar</div>
      </div>

      <q-page-sticky :position="keys.length > 10 ? 'bottom-center' : 'bottom'" :offset="[0, 30]">
        <q-btn round color="primary" icon="add" to="/newrecipe" size="17px" class="q-ma-none" />
      </q-page-sticky>
      <q-page-sticky position="top-right" :offset="[15, 25]"> </q-page-sticky>
    </div>
  </q-page>
</template>

<script setup>
import { useQuasar } from "quasar";
import TablaDeIngredientes from "src/components/TablaDeIngredientes.vue";
import EditarRecetaDialog from "src/components/EditarRecetaDialog.vue";
import ProporcionDialog from "src/components/ProporcionDialog.vue";
import { ref } from "vue";
import { onMounted } from "vue";
import { API_URL } from 'src/config/api';
import { useRouter } from "vue-router";

const $q = useQuasar();
const mostrar = ref(false);
const $receta = ref();
const opciones = ref([]);
const propor = ref(false);
const editar = ref(false);
const loading = ref(false);
const titulo = ref("Todas las recetas");
const text = ref("");
const recetasCache = ref([]);
const keys = ref([]);
const fabAbierto = ref(null);
const router = useRouter();

const mounted = ref(false);

const fetchRecetas = async () => {
  loading.value = true;
  await fetch(`${API_URL}/recetas/todas`)
    .then((response) => response.json())
    .then((data) => (
      recetasCache.value = data,
      keys.value = data,
      loading.value = false,
      mounted.value = true
    ))
    .catch((error) => console.error("Error:", error));
  // ordenar();
};

const ordenar = () => {
  estaOrdenadoAlfabeticamente(keys.value)
    ? keys.value.reverse()
    : keys.value.sort((a, b) => {
      if (a.nombreReceta < b.nombreReceta) {
        return -1;
      }
      if (a.nombreReceta > b.nombreReceta) {
        return 1;
      }
      return 0;
    });
};

const estaOrdenadoAlfabeticamente = (array) => {
  for (let i = 0; i < array.length - 1; i++) {
    if (array[i].nombreReceta > array[i + 1].nombreReceta) {
      return false;
    }
  }
  return true;
};

const obtenerReceta = async (key) => {
  await fetch(`${API_URL}/recetas/?nombreReceta=` + key)
    .then((response) => response.json())
    .then((data) => {
      $receta.value = data;
      console.log($receta.value);
      opciones.value = [];
      for (let i = 0; i < $receta.value.ingredientes.length; i++) {
        opciones.value.push($receta.value.ingredientes[i].ingrediente);
      }
    })
    .catch((error) => console.error("Error:", error));
};

const eliminarReceta = (key) => {
  $q.dialog({
    title: "Eliminar receta",
    message: "¿Desea eliminar la receta '" + key + "'?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await fetch(`${API_URL}/recetas/?nombreReceta=` + key, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(() => {
        let index = keys.value.findIndex(
          (receta) => receta.nombreReceta === key
        );
        keys.value.splice(index, 1);
        $q.notify({
          message: "Receta eliminada correctamente",
          type: "positive",
        });
      })
      .catch((error) => console.error("Error:", error));
  });
};

const favorita = async (receta) => {
  let index = keys.value.findIndex((r) => r.nombreReceta === receta);
  await fetch(
    `${API_URL}/recetas/fav/?nombreReceta=` + receta,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      fetchRecetas();
      $q.notify({
        message: keys.value[index].favorita
          ? "Receta añadida a favoritos"
          : "Receta eliminada de favoritos",
        type: "positive",
      });
    })
    .catch((error) => console.error("Error:", error));
};

const resetKeys = () => {
  if (recetasCache.value.length > 0) {
    keys.value = recetasCache.value;
  } else {
    fetchRecetas();
  }
};

const todas = async () => {
  resetKeys();
  text.value = "";
  titulo.value = "Todas las recetas";
};

const favoritos = async () => {
  resetKeys();
  text.value = "";
  titulo.value = "Recetas favoritas";
  keys.value = keys.value.filter((receta) => receta.favorita);
};

const originales = async () => {
  resetKeys();
  text.value = "";
  titulo.value = "Recetas originales";
  keys.value = keys.value.filter((receta) => !receta.esProporcion);
};

const proporciones = async () => {
  resetKeys();
  text.value = "";
  titulo.value = "Recetas en proporción";
  keys.value = keys.value.filter((receta) => receta.esProporcion);
};

const search = async () => {
  resetKeys();
  if (text.value === null || text.value.trim() === "") {
    titulo.value = "Todas las recetas";
  } else {
    keys.value = keys.value.filter((receta) =>
      receta.nombreReceta.toLowerCase().includes(text.value.toLowerCase())
    );
    titulo.value = "Resultados de búsqueda para '" + text.value + "'";
  }
};

const verReceta = () => {
  router.push({
    path: "/receta",
    query: {
      receta: $receta.value.nombreReceta,
    },
  });
};

onMounted(async () => {
  loading.value = true;
  await fetchRecetas().then(() => {
    loading.value = false;
    mounted.value = true;
  });
});
</script>

<style lang="scss">
.no-recetas {
  opacity: 0.7;
}
</style>
