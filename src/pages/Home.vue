<template>
  <NextCalendar />
</template>

<script>
import { defineComponent } from 'vue';
import NextCalendar from '../components/calendar/NextCalendar.vue';

export default defineComponent({
  name: 'home',
  components: {
    NextCalendar,
  }
});
</script>