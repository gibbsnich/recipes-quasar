<template>
    <login-modal v-if="!$q.platform.is.electron && !$q.platform.is.capacitor" v-show="!this.$store.state.isAuthenticated" />
    <settings-menu activeTab="categories" />
    <div class="container">
        <h4>Kategorien</h4>
        <category-table name="Rezeptkategorie" @save="saveRecipeCategory" v-bind:categoryItemsGetter="getSortedRecipeCategories" />
        <category-table name="Zutatenkategorie" @save="saveIngredientCategory" v-bind:categoryItemsGetter="getSortedIngredientCategories" />
        <category-table name="Zutatenladen" @save="saveIngredientStore" v-bind:categoryItemsGetter="getSortedIngredientStores" />
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