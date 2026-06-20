<template>
  <q-page class="column flex-center bg-secondary">
    <img
      src="../assets/LogoApp.png"
      alt="appLogo"
      style="max-width: 30vh"
      class="q-ma-md q-pa-md"
    />
    <br />
    <br />
    <q-btn
      class="q-ma-md"
      color="primary"
      label="mis recetas"
      to="/misrecetas"
      icon="book"
    ></q-btn>
    <q-btn
      class="q-ma-md"
      color="primary"
      label="nueva receta"
      to="/newrecipe"
      icon-right="post_add"
    ></q-btn>
    <div> 
      <q-btn
        class="q-ma-md mt-6"
        color="primary"
        label="mi rutina"
        to="/mi-rutina"
        icon-right="restaurant_menu"
      ></q-btn> 
    <span class="text-primary">Nuevo!</span>
  </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "IndexPages",
});
</script>
