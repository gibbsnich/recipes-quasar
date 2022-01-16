<template>
    <div class="modal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
        <div class="modal-header">
            <h5 class="modal-title">Rezeptauswahl</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="closeNoSave"></button>
        </div>
        <div class="modal-body">
            <div v-if="this.$store.state.recipes.length === 0">
                Bisher keine Rezepte vorhanden...
            </div>
            <div v-else>
                <p>Rezept auswählen:</p>
                <accordion v-bind:categories="this.$store.getters.getSortedRecipeCategories" v-bind:categoryItemsGetter="this.getRecipes"
                    restCategoryName="Ohne Kategorie" v-bind:restCategoryItems="this.$store.getters.getSortedRecipesWithoutCategory" @itemSelected="recipeSelected" />
            </div>
            <div class="recipe card" v-if="this.currentRecipe">
                <div class="card-body">
                    <h6 class="card-subtitle mb-2 text-muted">{{ this.currentRecipe.name }}</h6>
                    <div v-if="this.currentRecipe.serving.value !== '' && this.currentRecipe.serving.type !== ''">
                        {{ this.currentRecipe.serving.value }} {{ this.currentRecipe.serving.type }}
                    </div>
                    <div class="ingredients">
                        <ul class="list-group list-group-horizontal" v-for="i in Math.ceil(this.currentRecipe.ingredients.length / 2)" v-bind:key="i">
                            <li class="list-group-item" v-for="ingredient in this.currentRecipe.ingredients.slice((i - 1) * 2, i * 2)" v-bind:key="ingredient.id">
                                <span v-if="ingredient.amount">{{ ingredient.amount }}</span> <span>{{ ingredient.ingredient }}</span>
                            </li>
                        </ul>
                    </div>
                    <div v-html="currentRecipe.preparation.replaceAll('\n', '<br/>')"></div>
                </div>
            </div>
        </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary" @click="close">Speichern</button>
            </div>
        </div>
    </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import Accordion from './Accordion.vue';

export default defineComponent({
    name: 'SelectRecipeModal',
    components: { Accordion },
    emits: ['close'],
    props: {
        event: Object,
    },
    data() {
        return {
            selectedRecipeId: null,
        }
    },
    computed: {
        currentRecipe: {
            get() {
                if (!this.event || !this.event.extendedProps.recipeId)
                    return null;
                if (this.selectedRecipeId) 
                    return this.$store.getters.getRecipeById(this.selectedRecipeId);
                return this.$store.getters.getRecipeById(this.event.extendedProps.recipeId);
            }
        }
    },
    methods: {
        getRecipes(recipeCategoryId) {
            return this.$store.getters.getSortedRecipes(recipeCategoryId);
        },
        recipeSelected(recipeId) {
            this.selectedRecipeId = recipeId;
        },
        close() {
            this.$emit('close', this.selectedRecipeId === -1 ? null : this.selectedRecipeId);
        },
        closeNoSave() {
            this.$emit('close', null);
        },
    }
})
</script>

<style scoped>
  .modal {
    display: block;
  }
  div.recipe {
      margin-top: 1rem;
  }
  div.ingredients {
      margin-top: 1rem;
      margin-bottom: 1rem;
  }
  ul.list-group {
      margin-top: .2rem;
  }
</style>