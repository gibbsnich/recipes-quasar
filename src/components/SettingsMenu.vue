<template>
<div class='fc fc-media-screen fc-direction-ltr fc-theme-standard'>
    <div class='fc-header-toolbar fc-toolbar fc-toolbar-ltr'>
        <div class='fc-toolbar-chunk'>
            <div class='fc-button-group'>
                <button @click="gotoCalendar" type="button" class='fc-button fc-button-primary'>Kalender</button>
                <ul class="nav nav-tabs">
                    <li v-for="tab in tabs" v-bind:key="tab" class="nav-item">
                        <a :class="['nav-link', {active: activeTab === tab.href}]" href="javascript:void(0)" @click="goto(tab.href)">{{ tab.name }}</a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</div>

</template>
<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SettingsMenu',
  props: {
    activeTab: String,
  },
  data() {
      return {
          tabs: [
              {href: 'recipes', name: 'Rezepte'},
              {href: 'ingredients', name: 'Zutaten'},
              {href: 'categories', name: 'Kategorien'},
          ]
      }
  },
  methods: {
      gotoCalendar() {
          this.$router.push('/');
      },
      goto(href) {
        this.$router.push(`/${href}`);
      },
  }
});
</script>

<style scoped>
    .fc-button {
        margin-right: 2rem;
    }
</style>