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