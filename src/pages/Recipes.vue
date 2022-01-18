<template>
    <login-modal v-if="!$q.platform.is.electron && !$q.platform.is.capacitor" v-show="!this.$store.state.isAuthenticated && this.$store.state.isOnline && !this.$store.state.forceNoAuth" />
    <ingredient-without-category-modal v-show="isIngredientWithoutCategoryModalVisible" @close="closeIngredientsWithoutCategoryModal" v-bind:ingredient="ingredientWithoutCategory" />
    <div :class="{blur_bg: (!this.$store.state.isAuthenticated && this.$store.state.isOnline && !this.$store.state.forceNoAuth) || isIngredientWithoutCategoryModalVisible}">
        <site-menu activeTab="recipes">
            <div class="container">
                <div class="row">
                    <div class="col-sm-3">
                        <h6>Vorhandene Rezepte:</h6>
                        <span v-if="!this.$store.getters.getRecipesExist">Keine Rezepte vorhanden!</span>
                        <accordion style="margin-bottom: .5rem" v-bind:categories="this.$store.getters.getSortedRecipeCategories" v-bind:categoryItemsGetter="this.getRecipes"
                            restCategoryName="Ohne Kategorie" v-bind:restCategoryItems="this.$store.getters.getSortedRecipesWithoutCategory" @itemSelected="selectRecipe">
                            <template v-slot:default="slotProps">
                                <div class="list-group">
                                    <button type="button" v-for="recipe in this.$store.getters.getSortedRecipes(slotProps.category.id)" v-bind:key="recipe.id" 
                                        :class="['list-group-item', 'list-group-item-action', {active: recipeId === recipe.id}]"
                                        @click="selectRecipe(recipe.id)">{{ recipe.name }}</button>
                                </div>
                            </template>
                            <template v-slot:rest="restProps">
                                <div class="list-group">
                                    <button type="button" v-for="recipe in restProps.items" v-bind:key="recipe.id"
                                        :class="['list-group-item', 'list-group-item-action', {active: recipeId === recipe.id}]"
                                        @click="selectRecipe(recipe.id)">{{ recipe.name }}</button>
                                </div>
                            </template>
                        </accordion>
                        <ul class="list-group" id="action-group">
                            <li class="list-group-item">
                                <button type="button" class="btn btn-outline-primary" @click="addRecipe" >
                                    <font-awesome-icon icon="file" />&nbsp;Rezept anlegen
                                </button>
                            </li>
                            <li class="list-group-item">
                                <button type="button" :class="['btn', 'btn-outline-primary', {active: showImporter}]" @click="importRecipe">
                                    <font-awesome-icon icon="file-import" />&nbsp;Rezept importieren
                                </button>
                                <div v-show="showImporter">
                                    <RecipeImporter @recipe-imported="recipeImported" />
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="col-sm-9">
                        <RecipeDetails :recipeId=recipeId :recipeData=recipeData :clearRecipe=clearRecipe @save="recipeSaved" @delete="recipeDeleted" />
                    </div>
                </div>
            </div>
        </site-menu>
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import RecipeDetails from '../components/RecipeDetails.vue';
import RecipeImporter from '../components/RecipeImporter.vue';
import { UnknownIngredientsMixin } from '../components/UnknownIngredientsMixin.js';
import IngredientWithoutCategoryModal from '../components/IngredientWithoutCategoryModal.vue';
import SiteMenu from '../components/SiteMenu.vue';
import LoginModal from '../components/web/LoginModal.vue';
import Accordion from '../components/Accordion.vue';

export default defineComponent({
  name: 'recipes',
  components: {
    RecipeDetails,
    RecipeImporter,
    IngredientWithoutCategoryModal,
    SiteMenu,
    LoginModal,
    Accordion,
  },
  mixins: [UnknownIngredientsMixin],
  data() {
      return {
          recipeId: null,
          recipeData: null,
          showImporter: false,
          clearRecipe: false,
          savedRecipe: null,
      }
  },
  methods: {
      addRecipe() {
          this.clearRecipe = true;
          this.recipeId = null;
          this.recipeData = null;
          this.showImporter = false;
      },
      importRecipe() {
          this.showImporter = !this.showImporter;
      },
      selectRecipe(rid) {
          this.clearRecipe = false;
          this.recipeData = null;
          this.recipeId = rid;
      },
      recipeImported(recipe) {
          this.clearRecipe = false;
          this.recipeData = recipe;
          this.recipeId = recipe.id ? recipe.id : null;
          this.showImporter = false;
      },
      recipeSaved(recipe) {
          const withoutCategory = this.checkForIngredientsWithoutCategory(recipe.ingredients);
          if (withoutCategory) {
              this.savedRecipe = recipe;
              this.ingredientWithoutCategory = withoutCategory;
              this.isIngredientWithoutCategoryModalVisible = true;
              this.unknownIngredients = this.savedRecipe.ingredients;
          } else {
              this.$store.dispatch('storeRecipe', recipe);
          }
      },
      recipeDeleted(recipe) {
          this.$store.dispatch('deleteRecipe', recipe);
      },
      finishedHandlingUnknownIngredients() {
          this.$store.dispatch('storeRecipe', this.savedRecipe);
          this.savedRecipe = null;
      },
      getRecipes(recipeCategoryId) {
          return this.$store.getters.getSortedRecipes(recipeCategoryId);
      },
  }
});
</script>