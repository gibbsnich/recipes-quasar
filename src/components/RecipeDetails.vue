<template>
    <div class="row mb-3">
        <label for="name-input" class="col-sm-2 col-form-label">Name</label>
        <div class="col-sm-10">
        <input type="text" class="form-control" id="name-input" placeholder="Name" v-model="currentRecipe.name">
        </div>
    </div>
    <div class="row mb-3">
        <label for="name-input" class="col-sm-2 col-form-label">Genug für</label>
        <div class="col-sm-3">
        <input type="text" class="form-control" id="name-input" placeholder="Anzahl" v-model="currentRecipe.serving.value">
        </div>
        <div class="col-sm-7">
        <input type="text" class="form-control" id="name-input" placeholder="Portionen/Stücke/etc." v-model="currentRecipe.serving.type">
        </div>
    </div>
    <div class="row mb-3">
        <h5>Kategorien:</h5>
        <div>
            <button type="button" :class="['btn', 'btn-outline-primary', 'recipe-category-button', {active: currentRecipe.recipeCategories.includes(recipeCategory.id)}]" 
                v-for="recipeCategory in this.$store.getters.getSortedRecipeCategories" 
                v-bind:key="recipeCategory.id" @click="toggleRecipeCategory(recipeCategory.id)">
                {{ recipeCategory.name }}
            </button>
        </div>
        <div>
            ... oder neu anlegen:
            <input type="text" placeholder="Neue Kategorie" v-model="newRecipeCategoryName">
            <button type="button" id="save-recipe-category-button" :class="['btn', 'btn-primary', {disabled: newRecipeCategoryName.length === 0 || this.$store.getters.getRecipeCategoryByName(newRecipeCategoryName)}]" @click="saveNewRecipeCategory">Speichern</button>
        </div>
    </div>
    <div class="row mb-3">
        <h5>Zutaten:</h5>
        <ingredients-list :ingredients="this.currentRecipe.ingredients" />
    </div>
    <div class="row mb-3">
        <h5>Zubereitung:</h5>
        <textarea class="form-control" rows="20" v-model="currentRecipe.preparation" />
    </div>
    <button id="save-button" type="button" class="btn btn-primary" :disabled="currentRecipe.name === ''" @click="saveRecipe" >Rezept speichern</button>
</template>

<script>
import { defineComponent } from 'vue';
import IngredientsList from './IngredientsList.vue';

export default defineComponent({
    name: 'RecipeDetails',
    emits: ['save'],
    components: {
        IngredientsList,
    },
    props: {
        recipeId: Number, 
        recipeData: Object,
        clearRecipe: Boolean,
    },
    data() {
      return {
          currentRecipe: this.makeEmptyRecipe(),
          newRecipeCategoryName: '',
      }
    },
    watch: {
        recipeId(rid) {
            if (!rid)
                return;
            const recipe = this.$store.getters.getRecipeById(rid);
            if (!recipe) {
                return console.warn("Couldn't select recipe.")
            }
            this.currentRecipe = JSON.parse(JSON.stringify(recipe));
        },
        recipeData(rdata) {
            if (!rdata)
                return;
            this.currentRecipe = JSON.parse(JSON.stringify(rdata));
        },
        clearRecipe(flag) {
            if (flag) {
                this.currentRecipe = this.makeEmptyRecipe();
            }
        },
    },
    methods: {
        toggleRecipeCategory(recipeCategoryId) {
            const recipeCategoryIndex = this.currentRecipe.recipeCategories.indexOf(recipeCategoryId);
            if (recipeCategoryIndex === -1) {
                this.currentRecipe.recipeCategories.push(recipeCategoryId);
            } else {
                this.currentRecipe.recipeCategories.splice(recipeCategoryIndex, 1);
            }
        },
        async saveNewRecipeCategory() {
            await this.$store.dispatch('storeRecipeCategory', this.newRecipeCategoryName);
            const recipeCategory = this.$store.getters.getRecipeCategoryByName(this.newRecipeCategoryName);
            this.currentRecipe.recipeCategories.push(recipeCategory.id);
            this.newRecipeCategoryName = '';
        },
        saveRecipe() {
            this.currentRecipe.ingredients = this.currentRecipe.ingredients.filter((i) => i.amount !== '' || i.ingredient !== '');
            this.$emit('save', this.currentRecipe);
            //keep current recipe visible after save
            //this.currentRecipe = this.makeEmptyRecipe();
        },
        makeEmptyRecipe() {
            return {name: '', serving: {value: '', type: ''}, ingredients: [], preparation: '', url: '', recipeCategories: []};
        }
    }
})
</script>

<style scoped>
    button.recipe-category-button {
        margin-right: .5rem;
    }
    #save-button { 
        margin-left: 2rem; margin-bottom: 1rem;
    }
    #save-recipe-category-button {
        margin-left: .5rem;
    }
</style>