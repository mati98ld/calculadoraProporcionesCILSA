<template>
  <q-page padding class="bg-secondary column">
    <q-btn
      v-if="keys.length > 1"
      flat
      round
      color="primary"
      icon="sort_by_alpha"
      size="15px"
      class="absolute-top-left q-mt-lg q-ml-md"
      @click="ordenar()"
    />
    <q-btn-dropdown
      flat
      round
      color="primary"
      icon="filter_list"
      size="15px"
      class="absolute-top-right q-mt-lg q-mr-xs"
    >
      <q-list separator class="shadow-3">
        <q-item
          clickable
          v-close-popup
          @click="todas()"
          class="bg-primary text-center"
        >
          <q-item-section>
            <q-item-label class="text-blue-grey-1 text-subtitle1"
              >Todas</q-item-label
            >
          </q-item-section>
        </q-item>
        <q-item
          clickable
          v-close-popup
          @click="favoritos()"
          class="bg-primary text-center"
        >
          <q-item-section>
            <q-item-label class="text-blue-grey-1 text-subtitle1"
              >Favoritas</q-item-label
            >
          </q-item-section>
        </q-item>
        <q-item
          clickable
          v-close-popup
          @click="originales()"
          class="bg-primary text-center"
        >
          <q-item-section>
            <q-item-label class="text-blue-grey-1 text-subtitle1"
              >Originales</q-item-label
            >
          </q-item-section>
        </q-item>
        <q-item
          clickable
          v-close-popup
          @click="proporciones()"
          class="bg-primary text-center"
        >
          <q-item-section>
            <q-item-label class="text-blue-grey-1 text-subtitle1"
              >Proporciones</q-item-label
            >
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
    <div class="row justify-center">
      <h5 class="text-bold text-purple q-ma-md">{{ titulo }}</h5>
    </div>
    <q-separator v-if="keys.length" class="q-mt-xs"></q-separator>
    <div v-if="loading" class="absolute-center">
      <q-spinner color="primary" size="50px" />
    </div>
    <div v-else>
      <q-list separator>
        <q-item v-for="receta in keys" :key="receta" class="q-pl-xs q-pr-xs">
          <q-item-section side>
            <q-checkbox
              size="lg"
              v-model="
                keys[
                  keys.findIndex((r) => r.nombreReceta === receta.nombreReceta)
                ].favorita
              "
              checked-icon="star"
              unchecked-icon="star_border"
              indeterminate-icon="help"
              @click="favorita(receta.nombreReceta)"
            />
          </q-item-section>
          <q-item-section>
            <h6 class="text-bold text-purple q-ma-xs">
              · {{ receta.nombreReceta }}
            </h6>
          </q-item-section>

          <q-item-section avatar>
            <q-fab
              color="primary"
              icon="keyboard_arrow_left"
              push
              round
              dense
              direction="left"
              padding="sm"
            >
              <q-fab-action
                v-if="!receta.esProporcion"
                push
                color="primary"
                round
                icon="calculate"
                dense
                @click.stop="
                  async () => {
                    await obtenerReceta(receta.nombreReceta);
                    propor = true;
                  }
                "
              />
              <q-fab-action
                push
                color="primary"
                round
                icon="visibility"
                dense
                @click.stop="
                  async () => {
                    await obtenerReceta(receta.nombreReceta);
                    mostrar = true;
                  }
                "
              />
              <q-fab-action
                v-if="!receta.esProporcion"
                push
                color="primary"
                round
                icon="edit"
                dense
                @click.stop="
                  async () => {
                    await obtenerReceta(receta.nombreReceta);
                    editar = true;
                  }
                "
              />
              <q-fab-action
                push
                color="primary"
                round
                icon="delete"
                dense
                @click.stop="eliminarReceta(receta.nombreReceta)"
              />
            </q-fab>
          </q-item-section>
        </q-item>
      </q-list>
      <q-dialog v-model="mostrar">
        <q-card class="bg-primary">
          <q-card-section class="q-pl-sm q-pr-sm q-pb-sm">
            <q-btn
              icon="close"
              flat
              round
              dense
              v-close-popup
              padding="none"
              class="float-right"
            />
            <div class="text-h5 text-secondary text-bold text-center">
              {{ $receta.nombreReceta }}
            </div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <TablaDeIngredientes
              :ingredientes="$receta.ingredientes"
            ></TablaDeIngredientes>
          </q-card-section>
          <div
            class="bg-secondary q-pa-xs q-ml-md q-mr-md"
            style="border-radius: 10px"
          >
            <div class="text-black row justify-around text-bold text-h6">
              Descripción:
            </div>
            <div class="row justify-around">
              <q-card-section
                style="max-height: 300px"
                class="scroll text-black text-body1 text-center text-justify"
              >
                <pre wrap class="q-ma-none">{{ $receta.descripcion }} </pre>
              </q-card-section>
            </div>
          </div>
          <q-card-section class="text-center">
            <q-btn
              v-if="!$receta.esProporcion"
              label="Calcular proporcion"
              icon-right="calculate"
              text-color="purple"
              color="secondary"
              style="width: 100%"
              @click="propor = true"
            />
          </q-card-section>
        </q-card>
      </q-dialog>
      <q-dialog v-model="propor">
        <q-card class="bg-primary">
          <q-card-section class="row q-pb-none">
            <div class="text-h5 q-pl-md text-black text-bold">
              En proporcion a..
            </div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>
          <q-card-section>
            <q-form
              @submit.prevent="
                calcular($receta.nombreReceta, ingrediente, cantidad)
              "
            >
              <q-select
                class="q-pa-none bg-secondary q-mb-lg q-mt-xs"
                outlined
                clearable
                label="Ingrediente"
                v-model="ingrediente"
                :options="opciones"
                :rules="[
                  (val) => (val && val.length > 0) || 'Este campo está vacío',
                ]"
              ></q-select>
              <q-input
                class="q-pa-none bg-secondary q-mb-lg q-mt-xs"
                outlined
                type="text"
                label="Cantidad"
                v-model="cantidad"
                lazy-rules
                :rules="[
                  (val) =>
                    (val && !isNaN(val)) ||
                    'Por favor, ingresa un número válido',
                  (val) => (val && val.length > 0) || 'Este campo está vacío',
                ]"
              ></q-input>
              <q-btn
                label="Calcular"
                icon-right="calculate"
                text-color="purple"
                color="secondary"
                style="width: 100%"
                type="submit"
                class="q-mt-xs"
              />
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>
      <q-dialog v-model="editar">
        <q-card class="bg-secondary">
          <q-card-section class="row q-pb-none">
            <div class="text-h6 text-black text-bold">Editar receta</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>
          <q-card-section>
            <div class="row justify-around text-bold text-h7 text-primary">
              Nombre de la receta:
            </div>
            <q-input
              class="text-h5"
              v-model="edit_nombreReceta"
              outlined
              autogrow
              style="min-width: 300px"
            ></q-input>
          </q-card-section>
          <q-card-section style="padding-top: 0">
            <div class="row justify-around text-bold text-h7 text-primary">
              Ingredientes:
            </div>
            <TablaDeIngredientes
              :ingredientes="$receta.ingredientes"
              :editable="true"
              :addIng="true"
            ></TablaDeIngredientes>
          </q-card-section>
          <div class="bg-secondary q-pa-xs" style="border-radius: 10px">
            <div class="row justify-around text-bold text-h7 text-primary">
              Descripción:
            </div>
            <div class="row justify-around">
              <q-card-section
                style="max-height: 300px; padding: 0"
                class="scroll text-black text-body1 text-center text-justify"
              >
                <q-input
                  filled
                  v-model="edit_descripcion"
                  autogrow
                  style="min-width: 300px"
                >
                </q-input>
              </q-card-section>
            </div>
          </div>
          <q-card-section class="text-center">
            <q-btn
              label="Guardar"
              icon-right="save"
              color="primary"
              style="width: 100%"
              @click="guardarEdit()"
            />
          </q-card-section>
        </q-card>
      </q-dialog>
      <div v-if="!keys.length" class="absolute-center text-center no-recetas">
        <q-icon name="sentiment_dissatisfied" size="90px" color="primary" />
        <div class="text-h5 text-primary">No hay recetas para mostrar</div>
      </div>

      <q-page-sticky
        :position="keys.length > 10 ? 'bottom-center' : 'bottom'"
        :offset="[0, 30]"
      >
        <q-btn
          round
          color="primary"
          icon="add"
          to="/newrecipe"
          size="17px"
          class="q-ma-none"
        />
      </q-page-sticky>
      <q-page-sticky position="top-right" :offset="[15, 25]"> </q-page-sticky>
    </div>
  </q-page>
</template>

<script setup>
import { useQuasar } from "quasar";
import TablaDeIngredientes from "src/components/TablaDeIngredientes.vue";
import { ref } from "vue";
import { onMounted } from "vue";
import { API_URL } from 'src/config/api';

const $q = useQuasar();
const mostrar = ref(false);
const $receta = ref();
const opciones = ref();
const propor = ref(false);
const cantidad = ref(null);
const ingrediente = ref(null);
const edit_descripcion = ref();
const editar = ref(false);
const edit_nombreReceta = ref();
const loading = ref(false);
const titulo = ref("Todas las recetas");

// obtener todas las recetas guardadas (se cambio de localStorage a peticion a la API)

const fetchRecetas = async () => {
  await fetch(`${API_URL}/recetas/todas`)
    .then((response) => response.json())
    .then((data) => (keys.value = data))
    .catch((error) => console.error("Error:", error));
  // ordenar();
};

const keys = ref(fetchRecetas());

// ordenar por orden alfabetico, y cuando se ejecuta de nuevo debe invertir el orden

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

// obtener receta seleccionada para mostrarla (se cambio de localStorage a peticion a la API)
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
      edit_descripcion.value = $receta.value.descripcion;
      edit_nombreReceta.value = $receta.value.nombreReceta;
    })
    .catch((error) => console.error("Error:", error));
};

// eliminar receta seleccionada (se cambio de localStorage a peticion a la API)
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

const todas = async () => {
  await fetchRecetas();
  titulo.value = "Todas las recetas";
};

const favoritos = async () => {
  await fetchRecetas();
  titulo.value = "Recetas favoritas";
  keys.value = keys.value.filter((receta) => receta.favorita);
};

const originales = async () => {
  await fetchRecetas();
  titulo.value = "Recetas originales";
  keys.value = keys.value.filter((receta) => !receta.esProporcion);
};

const proporciones = async () => {
  await fetchRecetas();
  titulo.value = "Recetas en proporción";
  keys.value = keys.value.filter((receta) => receta.esProporcion);
};

// guardar receta editada (se cambio de localStorage a peticion a la API)
const guardarEdit = async () => {
  $q.dialog({
    title: "Guardar cambios",
    message: "¿Desea guardar la receta editada?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    let recetaEdit;
    recetaEdit = {
      nombreReceta: edit_nombreReceta.value,
      ingredientes: $receta.value.ingredientes,
      descripcion: edit_descripcion.value,
    };

    await fetch(
      `${API_URL}/recetas/?nombreReceta=` + $receta.value.nombreReceta,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recetaEdit),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    editar.value = false;
    await fetchRecetas();

    $q.notify({
      message: "Receta editada correctamente",
      type: "positive",
    });
  });
};

onMounted(async () => {
  loading.value = true;
  await fetchRecetas().then(() => {
    loading.value = false;
  });
});
</script>

<style lang="scss">
.no-recetas {
  opacity: 0.7;
}
</style>

<script>
export default {
  methods: {
    calcular(name, ingre, cant) {
      // Navegar a la página de la calculadora con parámetros
      this.$router.push({
        path: "/calcu",
        query: { receta: name, ingrediente: ingre, cantidad: cant },
      });
    },
  },
};
</script>
