<template>
  <router-view />
</template>
<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',
  beforeMount() {
    this.$store.dispatch('loadInitialData')
  }
})
</script>
<!--
<style>
  .modal {
    display: block;
  }
</style>
-->