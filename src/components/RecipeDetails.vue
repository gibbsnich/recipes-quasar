<template>
    <div class="row mb-3">
        <label for="name-input" class="col-sm-2 col-form-label">Name</label>
        <div class="col-sm-10">
            <input type="text" class="form-control" id="name-input" placeholder="Name" v-model.trim="currentRecipe.name">
        </div>
    </div>
    <div class="row mb-3">
        <label for="svalue-input" class="col-sm-2 col-form-label">Genug für</label>
        <div class="col-sm-3">
            <input type="text" class="form-control" id="svalue-input" placeholder="Anzahl" v-model.trim="currentRecipe.serving.value">
        </div>
        <div class="col-sm-7">
            <input type="text" class="form-control" id="stype-input" placeholder="Portionen/Stücke/etc." v-model.trim="currentRecipe.serving.type">
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
        <div class="row mb-3 mt-3">
            <div class="col-sm-3">... oder neu anlegen:</div>
            <div class="col-sm-7">
                <input type="text" class="form-control" placeholder="Neue Kategorie" v-model.trim="newRecipeCategoryName">
            </div>
            <div class="col-sm-2">
                <button type="button" id="save-recipe-category-button" :class="['btn', 'btn-primary', {disabled: newRecipeCategoryName.length === 0 || this.$store.getters.getRecipeCategoryByName(newRecipeCategoryName)}]" @click="saveNewRecipeCategory"><font-awesome-icon icon="save" />&nbsp;Speichern</button>
            </div>
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
    <div class="row mb-3">
        <div class="col-xs-6">
            <button id="save-button" type="button" class="btn btn-primary" :disabled="currentRecipe.name === ''" @click="saveRecipe" ><font-awesome-icon icon="save" />&nbsp;Rezept speichern</button>
        </div>
        <div class="col-xs-6">
            <button id="save-button" type="button" class="btn btn-danger" :disabled="!currentRecipe.id" @click="deleteRecipe" ><font-awesome-icon icon="trash" />&nbsp;Rezept löschen</button>
        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import IngredientsList from './IngredientsList.vue';

export default defineComponent({
    name: 'RecipeDetails',
    emits: ['save', 'delete'],
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
        deleteRecipe() {
            this.$emit('delete', this.currentRecipe);
            this.currentRecipe = this.makeEmptyRecipe();
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