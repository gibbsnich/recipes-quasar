<template>
    <login-modal v-if="!$q.platform.is.electron && !$q.platform.is.capacitor" v-show="!this.$store.state.isAuthenticated && this.$store.state.isOnline && !this.$store.state.forceNoAuth" />
    <div :class="{blur_bg: !this.$store.state.isAuthenticated && this.$store.state.isOnline && !this.$store.state.forceNoAuth}">
      <site-menu activeTab="ingredients">
        <div class="container">
            <h4>Zutaten</h4>
            <ingredients-settings-table v-if="this.getSortedIngredients().length > 0" v-bind:categoryItemsGetter="getSortedIngredients" v-bind:refresh="this.$store.state.isInitialized" />
            <h6 v-else>Keine Zutaten</h6>
        </div>
      </site-menu>
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import SiteMenu from '../components/SiteMenu.vue';
import IngredientsSettingsTable from '../components/IngredientsSettingsTable.vue';
import LoginModal from '../components/web/LoginModal.vue';

export default defineComponent({
  name: 'ingredients',
  components: {
    SiteMenu,
    IngredientsSettingsTable,
    LoginModal,
  },
  methods: {
      getSortedIngredients() {
        return this.$store.getters.getSortedIngredients;
      },
  },
});
</script>

<style scoped>
  h6 {
    margin-left: 1rem;
  }
</style>