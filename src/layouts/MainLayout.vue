<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> Calculadora de proporciones </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :width="200"
      :breakpoint="500"
      bordered
      :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
    >
      <q-scroll-area class="fit bg-secondary">
        <img
          src="../assets/LogoApp.png"
          alt="appLogo"
          class="drawer-img q-mb-md q-mt-md"
        />
        <q-separator></q-separator>
        <q-list>
          <template v-for="(menuItem, index) in menuList" :key="index">
            <q-item
              clickable
              v-ripple
              :to="menuItem.to"
              active-class="my-menu-link"
              exact
            >
              <q-item-section avatar>
                <q-icon :name="menuItem.icon" />
              </q-item-section>
              <q-item-section>
                {{ menuItem.label }}
              </q-item-section>
            </q-item>
            <q-separator :key="'sep' + index" v-if="menuItem.separator" />
          </template>

          <!-- Botón para instalar app -->
          <q-item
            v-if="deferredPrompt && !isStandalone"
            clickable
            v-ripple
            active-class="my-menu-link"
            @click="instalarApp"
          >
            <q-item-section avatar>
              <q-icon name="download" />
            </q-item-section>
            <q-item-section> Instalar App </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";

const menuList = [
  {
    icon: "home",
    label: "Inicio",
    separator: true,
    to: "/",
  },
  {
    icon: "menu_book",
    label: "Mis recetas",
    separator: true,
    to: "/misrecetas",
  },
  {
    icon: "post_add",
    label: "Nueva receta",
    separator: true,
    to: "/newrecipe",
  },
  {
    icon: "restaurant_menu",
    label: "Mi rutina",
    separator: true,
    to: "/mi-rutina",
  },
  {
    icon: "help",
    iconColor: "primary",
    label: "Ayuda",
    separator: true,
    to: "/help",
  },
];

export default defineComponent({
  name: "MainLayout",

  /*components: {
    EssentialLink,
  },*/

  setup() {
    const leftDrawerOpen = ref(false);
    const deferredPrompt = ref(null);
    const isStandalone = ref(false);

    onMounted(() => {
      // Detectar si la app ya está instalada (modo standalone)
      isStandalone.value =
        window.navigator.standalone === true ||
        window.matchMedia("(display-mode: standalone)").matches;

      // Solo escuchar beforeinstallprompt si NO está en standalone
      if (!isStandalone.value) {
        window.addEventListener("beforeinstallprompt", (e) => {
          e.preventDefault();
          deferredPrompt.value = e;
        });
      }
    });

    const instalarApp = async () => {
      if (!deferredPrompt.value) return;

      deferredPrompt.value.prompt();
    };

    return {
      //  essentialLinks: linksList,
      leftDrawerOpen,
      deferredPrompt,
      isStandalone,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      instalarApp,
      menuList,
    };
  },
});
</script>

<style lang="scss">
.drawer-img {
  width: 95%;
  padding-left: 30%;
  padding-right: 30%;
}
.my-menu-link {
  color: white;
  background: #8a5a9d;
}
</style>
