<template>
    <div class="card bg-light">
        <div class="card-header">Von URL importieren</div>
        <div class="card-body">
            <input id="url-input" type="text" class="form-control" placeholder="URL" v-model="recipeUrl" />
            <button id="import-button" type="button" class="btn btn-primary" @click="startImport">Importieren</button>
        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import { fetchRecipe } from '../util/fetchRecipe.js';

export default defineComponent({
    name: 'recipeImporter',
    emits: ['recipeImported'],
    data() {
        return {
            recipeUrl: ""
        }
    },
    methods: {
        async startImport() {
            if (!this.recipeUrl || this.recipeUrl.length === 0) {
                this.recipeUrl = 'https://www.chefkoch.de/rezepte/4045411625126577/Curry-Blumenkohl.html';
            }
            const existingRecipe = this.$store.getters.getRecipeByUrl(this.recipeUrl);
            if (existingRecipe) {
                this.$emit('recipeImported', existingRecipe);
            } else {
                const recipeData = await fetchRecipe(this.recipeUrl);
                this.$emit('recipeImported', recipeData);
            }
            this.recipeUrl = '';
        }
    },
})
</script>

<style scoped>
.card {
    margin-top: 1rem;
}
#url-input {
    margin-bottom: .5rem; 
}
#import-button {
    margin-left: 2rem; 
}
@media (max-width: 992px) {
    #import-button { margin-left: 0; }
}
</style>