<template>
  <q-card
    :class="[
      'meal-card',
      meal.consumido ? 'meal-card--done' : '',
      meal.esAhora && !meal.consumido ? 'meal-card--now' : '',
    ]"
    bordered
  >
    <q-card-section>
      <div class="row items-start justify-between no-wrap">
        <div>
          <div class="row items-center q-gutter-x-sm">
            <div class="text-subtitle1 text-purple text-bold">
              {{ meal.label }}
            </div>
            <q-badge v-if="meal.esAhora && !meal.consumido" color="deep-purple-5" rounded>
              Ahora toca
            </q-badge>
          </div>
          <div class="text-caption text-grey-7 q-mb-xs">
            {{ meal.helper }}
            <span v-if="meal.horario" class="meal-time">
              <q-icon name="schedule" size="14px" class="q-mx-xs" />{{ meal.horario }}
            </span>
          </div>
        </div>
        <q-toggle
          :model-value="meal.consumido"
          color="positive"
          @update:model-value="(value) => emit('marcar', value)"
        />
      </div>

      <!-- GRUPOS DE ALIMENTOS (ALMUERZO / CENA) -->
      <div v-if="meal.proteina" class="q-mb-md">
        <div class="row q-gutter-xs q-mb-sm">
          <q-chip
            :color="colorProteina.bg"
            :text-color="colorProteina.text"
            :icon="colorProteina.icon"
            size="md"
            class="q-ma-none"
          >
            {{ meal.proteina.cantidad }}
          </q-chip>
          <q-chip color="green-7" text-color="white" icon="eco" size="md" class="q-ma-none">
            {{ meal.verdura || "1 plato hondo al ras" }}
          </q-chip>
        </div>

        <div v-if="meal.proteina.opciones.length" class="q-mb-xs">
          <div class="text-caption text-grey-8 q-mb-xs">
            ¿Qué proteína elegiste? (tocá otra vez para quitarla)
          </div>
          <div class="row q-gutter-xs">
            <q-chip
              v-for="op in meal.proteina.opciones"
              :key="op.value"
              clickable
              :outline="meal.proteina.eleccion !== op.value"
              :color="op.value === 'vaca' && op.bloqueada ? 'grey-5' : 'purple'"
              text-color="white"
              :disable="op.bloqueada"
              size="md"
              class="q-ma-none"
              @click="elegirProteina(op.value)"
            >
              {{ op.label }}
              <q-tooltip v-if="op.bloqueada">{{ op.motivo }}</q-tooltip>
            </q-chip>
          </div>
          <div v-if="meal.proteina.avisoVaca" class="text-caption text-grey-7 q-mt-xs">
            <q-icon name="info" size="14px" /> {{ meal.proteina.avisoVaca }}
          </div>
        </div>
      </div>

      <!-- SELECTOR DE OPCIONES (DESAYUNO, MERIENDA Y COLACIONES) -->
      <div v-if="opcionesDisponibles.length" class="q-mb-md">
        <q-select
          :model-value="selectedOption"
          :options="opcionesDisponibles"
          option-value="numero"
          :option-label="etiquetaOpcion"
          emit-value
          map-options
          outlined
          dense
          :label="esColacion ? 'Elegir colación (opcional)' : 'Elegir qué vas a consumir'"
          class="q-mt-xs"
          @update:model-value="(val) => emit('cambiar-opcion', val)"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label class="text-bold text-purple">
                  {{ etiquetaOpcion(scope.opt) }}
                </q-item-label>
                <q-item-label v-if="scope.opt.titulo" caption>
                  {{ scope.opt.descripcion }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <!-- Detalle de la opción elegida según el plan -->
        <q-expansion-item
          v-if="!meal.recetaNombre && opcionActual && opcionActual.componentes"
          dense
          dense-toggle
          icon="list_alt"
          label="Ver composición y porciones"
          header-class="text-purple text-caption"
          class="q-mt-xs detalle-opcion"
        >
          <q-list dense class="q-pb-xs">
            <q-item v-for="(c, i) in opcionActual.componentes" :key="`c-${i}`" class="q-px-sm">
              <q-item-section avatar style="min-width: 28px">
                <q-icon name="check_circle_outline" color="positive" size="18px" />
              </q-item-section>
              <q-item-section class="text-body2">{{ c }}</q-item-section>
            </q-item>
            <q-item v-for="(n, i) in opcionActual.notas || []" :key="`n-${i}`" class="q-px-sm">
              <q-item-section avatar style="min-width: 28px">
                <q-icon name="info_outline" color="orange-8" size="18px" />
              </q-item-section>
              <q-item-section class="text-caption text-grey-8">{{ n }}</q-item-section>
            </q-item>
            <q-item v-if="opcionActual.recetaPlan" class="q-px-sm">
              <q-item-section>
                <q-btn
                  flat
                  dense
                  no-caps
                  color="purple"
                  icon="menu_book"
                  :label="`Receta: ${opcionActual.recetaPlan}`"
                  align="left"
                  @click="irARecetaPlan(opcionActual.recetaPlan)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
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

      <div class="text-body2 text-grey-9 q-mb-sm" v-if="meal.recetaNombre">
        <div
          class="row items-center justify-between bg-purple-1 q-pa-md rounded-borders shadow-1"
          style="border: 1px solid rgba(138, 90, 157, 0.25)"
        >
          <div class="row items-center">
            <q-icon name="restaurant_menu" color="purple" class="q-mr-sm" size="sm" />
            <span class="text-bold text-purple text-subtitle1">{{ meal.recetaNombre }}</span>
          </div>
          <q-btn
            color="purple"
            flat
            dense
            icon="visibility"
            label="Ver Receta"
            class="q-px-sm bg-white shadow-1"
            @click="verReceta"
          />
        </div>
      </div>
      <div class="text-body2 text-grey-9 q-mb-sm" v-else>
        {{ meal.descripcion || "Sin descripción disponible" }}
      </div>

      <q-list
        v-if="meal.items && meal.items.length"
        dense
        class="bg-grey-1 rounded-borders q-pa-xs"
      >
        <q-item v-for="(item, index) in meal.items" :key="`${meal.key}-${index}`">
          <q-item-section avatar>
            <q-icon name="restaurant" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ item }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- CALDO OPCIONAL (ALMUERZO / CENA) -->
      <div v-if="meal.caldo" class="text-caption text-grey-7 q-mt-sm">
        <q-icon name="soup_kitchen" size="14px" class="q-mr-xs" />{{ meal.caldo }}
      </div>

      <!-- EXTRAS POR ENTRENAMIENTO -->
      <div
        v-if="meal.extras || meal.adicional"
        class="q-mt-md q-pa-md bg-purple-1 text-purple-9 rounded-borders shadow-1"
        style="border: 1px solid rgba(138, 90, 157, 0.25)"
      >
        <div class="row items-center q-gutter-x-xs q-mb-xs">
          <q-icon name="fitness_center" color="purple" size="sm" class="q-mr-xs" />
          <span class="text-bold text-subtitle2 text-purple">Día de gimnasio – Carbohidratos extra</span>
        </div>

        <template v-if="meal.extras">
          <div class="text-body2 text-bold q-mb-xs">{{ meal.extras.titulo }}</div>
          <ul class="extras-list">
            <li v-for="(o, i) in meal.extras.opciones" :key="`e-${i}`">{{ o }}</li>
          </ul>
          <div class="text-caption q-mt-xs">{{ meal.extras.opcional }}</div>
          <div v-if="meal.extras.milanesas" class="text-caption q-mt-xs text-bold">
            {{ meal.extras.milanesas }}
          </div>
        </template>
        <div v-else class="text-body2 text-purple-10" style="line-height: 1.4">
          {{ meal.adicional }}
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

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

const emit = defineEmits([
  "marcar",
  "cambiar-opcion",
  "vincular-receta",
  "elegir-proteina",
]);

const verReceta = () => {
  if (props.meal.recetaNombre) {
    router.push({
      path: "/receta",
      query: { receta: props.meal.recetaNombre },
    });
  }
};

const irARecetaPlan = (nombre) => {
  router.push({ path: "/mi-plan", query: { tab: "recetas", receta: nombre } });
};

const esColacion = computed(
  () => props.meal.key === "colacion1" || props.meal.key === "colacion2"
);

const opcionesDisponibles = computed(() => {
  const lista = props.opcionesComidas?.[props.meal.key];
  return Array.isArray(lista) ? lista : [];
});

const opcionActual = computed(() =>
  opcionesDisponibles.value.find((o) => o.numero === props.selectedOption)
);

const etiquetaOpcion = (opt) => opt?.titulo || opt?.descripcion || "";

const colorProteina = computed(() => {
  const color = props.meal.proteina?.color;
  if (color === "amarillo") {
    return { bg: "yellow-7", text: "black", icon: "egg_alt" };
  }
  if (color === "mixto") {
    return { bg: "orange-6", text: "white", icon: "restaurant" };
  }
  return { bg: "red-7", text: "white", icon: "set_meal" };
});

const elegirProteina = (valor) => {
  const actual = props.meal.proteina?.eleccion;
  emit("elegir-proteina", actual === valor ? null : valor);
};

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

.meal-card--now {
  border-color: rgba(103, 58, 183, 0.55);
  box-shadow: 0 6px 20px rgba(103, 58, 183, 0.15);
}

.meal-time {
  display: inline-flex;
  align-items: center;
  margin-left: 6px;
  padding: 0 8px;
  border-radius: 10px;
  background: rgba(138, 90, 157, 0.1);
  color: #6a3f7c;
  font-weight: 600;
}

.detalle-opcion {
  border-radius: 8px;
  background: #faf7fc;
}

.extras-list {
  margin: 0;
  padding-left: 18px;
  font-size: 0.875rem;
  line-height: 1.5;
}
</style>
