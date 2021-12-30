<template>
    <div class="modal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Zutatenauswahl</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="closeNoSave"></button>
                </div>
                <div class="modal-body">
                    <div v-if="this.$store.state.ingredients.length === 0">
                        Bisher keine Zutaten vorhanden...
                    </div>
                    <div v-else>
                        <p>Zutaten auswählen:</p>
                        <accordion v-bind:categories="this.$store.getters.getSortedIngredientCategories" v-bind:categoryItemsGetter="getIngredients"
                            @itemSelected="addIngredientById" v-slot:default="slotProps">
                                <button type="button" class="btn btn-outline-primary btn-ing"
                                    @click="this.addIngredientById(item.id)"
                                    v-for="item in this.getIngredients(slotProps.category.id)" v-bind:key="item.id">
                                    {{ item.ingredient }}
                                </button>
                        </accordion>
                    </div>
                    <p>Gewählte Zutaten:</p>
                    <ingredients-list :ingredients="this.ingredients" />
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
import IngredientsList from './IngredientsList.vue';
import Accordion from './Accordion.vue';

export default defineComponent({
    name: 'RandomIngredientsModal',
    emits: ['close'],
    components: {
        IngredientsList,
        Accordion,
    },
    props: {
        date: String,
    },
    data() {
        return {
            ingredients: [],
        }
    },
    mounted() {
        if (this.date) {
            const ingredientsEvent = this.$store.getters.getIngredientEventByStart(this.date + "T14:00");
            if (ingredientsEvent) {
                this.ingredients = JSON.parse(JSON.stringify(ingredientsEvent.extendedProps.ingredients));
            }
        }
    },
    methods: {
        getIngredients(ingredientCategoryId) {
            return this.$store.getters.getSortedIngredientsByCategory(ingredientCategoryId);
        },
        close() {
            const nonEmptyIngredients = this.ingredients.filter((i) => i.amount !== '' || i.ingredient !== '');
            if (nonEmptyIngredients.length > 0) {
                this.$emit('close', {
                    title: 'Zutaten',
                    color: 'black',
                    start: `${this.date}T14:00`,
                    end: `${this.date}T15:00`,
                    extendedProps: {extra: true, ingredients: nonEmptyIngredients},
                });
            } else {
                this.$emit('close', null);    
            }
            this.ingredientsArray = [];
            this.expandedCategory = -1;
        },
        closeNoSave() {
            this.ingredientsArray = [];
            this.$emit('close', null);
        },
        addIngredientById(ingredientId) {
            const selIngredient = this.$store.getters.getIngredientById(ingredientId);
            if (selIngredient) {
                this.ingredients.push({amount: '', ingredient: selIngredient.ingredient, id: selIngredient.id, categoryId: selIngredient.categoryId});
            }
        },
    }
})
</script>

<style scoped>
    button.btn {
        margin-right: .5rem;
    }
    .accordion-button {
        padding: 0;
    }
    button.btn-ing {
        margin-top: .2rem;
    }
    .modal {
        display: block;
    }
</style>