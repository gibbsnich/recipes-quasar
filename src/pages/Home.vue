<template>
<!--
    <Calendar />
-->

  <NextCalendar />

</template>

<script>
import { defineComponent } from 'vue';
import Calendar from '../components/Calendar.vue';
import NextCalendar from '../components/calendar/NextCalendar.vue';

export default defineComponent({
  name: 'home',
  components: {
    // Calendar,
    NextCalendar,
  }
});
</script>