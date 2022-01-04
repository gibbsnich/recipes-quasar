<template>
    <login-modal v-if="!$q.platform.is.electron && !$q.platform.is.capacitor" v-show="!this.$store.state.isAuthenticated" />
    <settings-menu activeTab="categories" />
    <div class="container">
        <h4>Kategorien</h4>
        <category-table name="Rezeptkategorie" v-show="getSortedRecipeCategories().length > 0" @save="saveRecipeCategory" v-bind:categoryItemsGetter="getSortedRecipeCategories" v-bind:refresh="this.$store.state.isInitialized" />
        <category-table name="Zutatenkategorie" v-show="getSortedIngredientCategories().length > 0" @save="saveIngredientCategory" v-bind:categoryItemsGetter="getSortedIngredientCategories" v-bind:refresh="this.$store.state.isInitialized" />
        <category-table name="Zutatenladen" v-show="getSortedIngredientStores().length > 0" @save="saveIngredientStore" v-bind:categoryItemsGetter="getSortedIngredientStores" v-bind:refresh="this.$store.state.isInitialized" />
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