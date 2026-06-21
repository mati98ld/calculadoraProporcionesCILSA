<template>
  <div class="profile-selection-container q-py-xl">
    <div class="text-center q-mb-xl">
      <h4 class="text-bold text-purple q-my-none">¿Quién ingresa hoy?</h4>
      <p class="text-subtitle1 text-grey-8 q-mt-sm">
        Seleccioná tu perfil para ver tu rutina personalizada o creá uno nuevo.
      </p>
    </div>

    <!-- Spinner mientras cargan los perfiles -->
    <div v-if="loadingPerfiles" class="row justify-center q-my-xl">
      <q-spinner color="primary" size="50px" />
    </div>

    <!-- Cuadrícula de perfiles -->
    <div v-else class="row justify-center q-col-gutter-lg">
      <!-- Tarjeta de cada perfil existente -->
      <div
        v-for="perfil in perfiles"
        :key="perfil"
        class="col-12 col-sm-6 col-md-4 col-lg-3"
      >
        <q-card class="profile-card q-pa-md text-center shadow-2" @click="emit('seleccionar', perfil)">
          <q-card-section class="column items-center">
            <q-avatar size="80px" class="profile-avatar-gradient q-mb-md">
              {{ perfil.charAt(0).toUpperCase() }}
            </q-avatar>
            <div class="text-h6 text-bold text-grey-9">{{ perfil }}</div>
            <div class="text-caption text-grey-6 q-mt-xs">Ver rutina diaria</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Tarjeta para crear nuevo perfil -->
      <div class="col-12 col-sm-6 col-md-4 col-lg-3">
        <q-card
          class="profile-card new-profile-card q-pa-md text-center shadow-2"
          @click="emit('crear-nuevo')"
        >
          <q-card-section class="column items-center justify-center style-dashed" style="height: 100%; min-height: 140px;">
            <q-icon name="person_add" size="44px" class="q-mb-md" />
            <div class="text-h6 text-bold">Nuevo Perfil</div>
            <div class="text-caption">Crear configuración</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  perfiles: {
    type: Array,
    required: true,
  },
  loadingPerfiles: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["seleccionar", "crear-nuevo"]);
</script>

<style scoped>
.profile-selection-container {
  max-width: 1000px;
  margin: 0 auto;
}

.profile-card {
  cursor: pointer;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid rgba(138, 90, 157, 0.1);
  background: #ffffff;
}

.profile-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 15px 30px rgba(138, 90, 157, 0.15);
  border-color: #8a5a9d;
}

.profile-avatar-gradient {
  background: linear-gradient(135deg, #8a5a9d 0%, #c18dfd 100%);
  color: white;
  font-weight: bold;
}

.new-profile-card {
  border: 2px dashed rgba(138, 90, 157, 0.3);
  background: rgba(248, 241, 251, 0.5);
  color: #8a5a9d;
}

.new-profile-card:hover {
  border-color: #8a5a9d;
  background: rgba(248, 241, 251, 0.8);
}

.style-dashed {
  border-radius: 12px;
}
</style>
