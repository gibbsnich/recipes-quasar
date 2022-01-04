<template>
    <login-modal v-if="!$q.platform.is.electron && !$q.platform.is.capacitor" v-show="!this.$store.state.isAuthenticated" />
    <settings-menu activeTab="categories" />
    <div class="container">
        <h4>Kategorien</h4>
        <category-table name="Rezeptkategorie" v-if="getSortedRecipeCategories().length > 0" @save="saveRecipeCategory" v-bind:categoryItemsGetter="getSortedRecipeCategories" v-bind:refresh="this.$store.state.isInitialized" />
        <h6 v-else>Keine Rezeptkategorien</h6>
        <category-table name="Zutatenkategorie" v-if="getSortedIngredientCategories().length > 0" @save="saveIngredientCategory" v-bind:categoryItemsGetter="getSortedIngredientCategories" v-bind:refresh="this.$store.state.isInitialized" />
        <h6 v-else>Keine Zutatenkategorien</h6>
        <category-table name="Zutatenladen" v-if="getSortedIngredientStores().length > 0" @save="saveIngredientStore" v-bind:categoryItemsGetter="getSortedIngredientStores" v-bind:refresh="this.$store.state.isInitialized" />
        <h6 v-else>Keine Zutatenläden</h6>
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import SettingsMenu from '../components/SettingsMenu.vue';
import CategoryTable from '../components/CategoryTable.vue';
import LoginModal from '../components/web/LoginModal.vue';

export default defineComponent({
  name: 'categories',
  components: {
    SettingsMenu,
    CategoryTable,
    LoginModal,
  },
  methods: {
    getSortedRecipeCategories() {
      return this.$store.getters.getSortedRecipeCategories;
    },
    getSortedIngredientCategories() {
      return this.$store.getters.getSortedIngredientCategories;
    },
    getSortedIngredientStores() {
      return this.$store.getters.getSortedIngredientStores;
    },
    saveRecipeCategory(updatedData) {
      this.$store.dispatch('updateRecipeCategory', updatedData);
    },
    saveIngredientCategory(updatedData) {
      this.$store.dispatch('updateIngredientCategory', updatedData);
    },
    saveIngredientStore(updatedData) {
      this.$store.dispatch('updateIngredientStore', updatedData);
    },
  },
});
</script>

<style scoped>
  h6 {
    margin-left: 1rem;
  }
</style>