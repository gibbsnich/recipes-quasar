<template>
    <Calendar />
</template>

<script>
import { defineComponent } from 'vue';
import Calendar from '../components/Calendar.vue';

export default defineComponent({
  name: 'home',
  components: {
    Calendar,
  }
});
</script>