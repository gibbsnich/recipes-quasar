<template>
    <div class='fc fc-media-screen fc-direction-ltr fc-theme-standard'>
        <div class='fc-header-toolbar fc-toolbar fc-toolbar-ltr'>
            <div class='fc-toolbar-chunk'>
                <div class='fc-button-group'>
                    <button @click="gotoCalendar" type="button" class='fc-button fc-button-primary'>Kalender</button>
                    <slot></slot>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'CalendarLink',
  methods: {
      gotoCalendar() {
          this.$router.push('/');
      },
  }
});
</script>

<style scoped src='@fullcalendar/common/main.css'></style>
<style scoped>
    .fc-button {
        margin-right: 2rem;
    }
</style>