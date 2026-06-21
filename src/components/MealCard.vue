<template>
  <q-card
    :class="[
      'meal-card',
      meal.consumido ? 'meal-card--done' : '',
    ]"
    bordered
  >
    <q-card-section>
      <div class="row items-start justify-between no-wrap">
        <div>
          <div class="text-subtitle1 text-purple text-bold">
            {{ meal.label }}
          </div>
          <div class="text-caption text-grey-7 q-mb-xs">
            {{ meal.helper }}
          </div>
        </div>
        <q-toggle
          :model-value="meal.consumido"
          color="positive"
          @update:model-value="
            (value) => emit('marcar', value)
          "
        />
      </div>

      <!-- SELECTOR DE OPCIONES PARA DESAYUNO Y MERIENDA -->
      <div v-if="meal.key === 'desayuno' || meal.key === 'merienda'" class="q-mb-md">
        <q-select
          :model-value="selectedOption"
          :options="opcionesComidas ? opcionesComidas[meal.key] : []"
          option-value="numero"
          option-label="titulo"
          emit-value
          map-options
          outlined
          dense
          label="Elegir qué vas a consumir"
          class="q-mt-xs"
          @update:model-value="(val) => emit('cambiar-opcion', val)"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label class="text-bold text-purple">
                  {{ scope.opt.titulo }}
                </q-item-label>
                <q-item-label caption>
                  {{ scope.opt.descripcion }}
                </q-item-label>
                <q-item-label caption class="text-orange" v-if="scope.opt.calorias">
                  {{ scope.opt.calorias }} kcal
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>

      <!-- SELECTOR DE VINCULAR RECETA -->
      <div v-if="meal.key !== 'entrenamiento'" class="q-mb-md">
        <q-select
          :model-value="meal.recetaNombre"
          :options="recetasFiltradas"
          option-value="nombreReceta"
          option-label="nombreReceta"
          emit-value
          map-options
          outlined
          dense
          clearable
          label="Vincular con tu receta"
          class="q-mt-xs"
          @update:model-value="(val) => emit('vincular-receta', val)"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label class="text-bold text-purple">
                  {{ scope.opt.nombreReceta }}
                </q-item-label>
                <q-item-label caption v-if="scope.opt.tipoAlimento">
                  Categoría: {{ traducirTipoAlimento(scope.opt.tipoAlimento) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>

      <div class="text-body2 text-grey-9 q-mb-sm text-italic" v-if="meal.recetaNombre">
        <strong>Receta vinculada:</strong> {{ meal.descripcion }}
      </div>
      <div class="text-body2 text-grey-9 q-mb-sm" v-else>
        {{ meal.descripcion || "Sin descripción disponible" }}
      </div>

      <q-list
        v-if="meal.items && meal.items.length"
        dense
        class="bg-grey-1 rounded-borders q-pa-xs"
      >
        <q-item
          v-for="(item, index) in meal.items"
          :key="`${meal.key}-${index}`"
        >
          <q-item-section avatar>
            <q-icon name="restaurant" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ item }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  meal: {
    type: Object,
    required: true,
  },
  opcionesComidas: {
    type: Object,
    default: null,
  },
  recetas: {
    type: Array,
    default: () => [],
  },
  selectedOption: {
    type: Number,
    default: 1,
  },
});

const emit = defineEmits(["marcar", "cambiar-opcion", "vincular-receta"]);

const recetasFiltradas = computed(() => {
  if (!props.recetas) return [];
  const mealKey = props.meal.key;

  const coincideCategoria = (tipoAlimento) => {
    if (mealKey === "desayuno" || mealKey === "merienda") {
      return tipoAlimento === "desayuno_merienda";
    }
    if (mealKey === "almuerzo" || mealKey === "cena") {
      return ["proteina", "verdura", "carbohidrato", "mixto"].includes(tipoAlimento);
    }
    return false;
  };

  return [...props.recetas].sort((a, b) => {
    const matchA = coincideCategoria(a.tipoAlimento);
    const matchB = coincideCategoria(b.tipoAlimento);
    if (matchA && !matchB) return -1;
    if (!matchA && matchB) return 1;
    return a.nombreReceta.localeCompare(b.nombreReceta, "es");
  });
});

const traducirTipoAlimento = (tipo) => {
  const mapeo = {
    proteina: "Proteína",
    verdura: "Verdura",
    carbohidrato: "Carbohidrato",
    mixto: "Mixto (Prot + Verd)",
    desayuno_merienda: "Desayuno/Merienda",
  };
  return mapeo[tipo] || "General";
};
</script>

<style scoped>
.meal-card {
  border-radius: 16px;
  background: #ffffff;
  transition: all 0.3s ease;
}

.meal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

.meal-card--done {
  border-color: rgba(76, 175, 80, 0.3);
  background: linear-gradient(180deg, #f1fbf3 0%, #ffffff 100%);
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.05);
}
</style>
