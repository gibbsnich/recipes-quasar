<template>
    <calendar-link>
        <ul class="nav nav-tabs">
            <li v-for="tab in tabs" v-bind:key="tab" class="nav-item">
                <a :class="['nav-link', {active: activeTab === tab.href}]" href="javascript:void(0)" @click="goto(tab.href)">{{ tab.name }}</a>
            </li>
        </ul>
    </calendar-link>
</template>

<script>
import { defineComponent } from 'vue';
import CalendarLink from './CalendarLink.vue';

export default defineComponent({
  name: 'SettingsMenu',
  components: { CalendarLink },
  props: {
    activeTab: String,
  },
  data() {
      return {
          tabs: [
              {href: 'recipes', name: 'Rezepte'},
              {href: 'ingredients', name: 'Zutaten'},
              {href: 'categories', name: 'Kategorien'},
              {href: 'shoppinglists', name: 'Einkaufslisten'},
          ]
      }
  },
  methods: {
      goto(href) {
        this.$router.push(`/${href}`);
      },
  }
});
</script>