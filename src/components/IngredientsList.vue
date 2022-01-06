<template>
    <ul class="list-group list-group-flush">
        <li class="list-group-item" v-for="(ingredient, index) in ingredients" v-bind:key="index">
            <div class="input-group">
                <input type="text"  class="form-control" placeholder="Menge" aria-label="Menge" v-model.trim="ingredient.amount">
                <div class="dropdown">
                    <input type="text" :id="`dd_${index}`" :class="['form-control', 'dropdown-toggle', {unknown: !ingredient.id}]" placeholder="Zutat" aria-label="Zutat" data-bs-toggle="dropdown" 
                        v-model.trim="ingredient.ingredient" v-on:blur="ingredientChanged(index, $event)" 
                        v-on:keyup="maybeShowIngredients(index, $event)">
                    <ul class="dropdown-menu" v-show="Object.keys(dropDownIngredients).includes(`${index}`) && dropDownIngredients[index].length > 0">
                        <li v-for="ddingredient in dropDownIngredients[index]" v-bind:key="ddingredient.id" :aria-labelledby="`dd_${index}`">
                            <a class="dropdown-item" href="javascript:void(0)" v-on:click="ingredientChanged(index, ddingredient.ingredient)"><span v-html="ddingredient.highlight"></span></a>
                        </li>
                    </ul>
                </div>
                <button type="button" class="btn btn-danger btn-sm" aria-label="Delete Ingredient" @click="deleteIngredient(index)">
                    <font-awesome-icon icon="minus-square" />
                </button>
            </div>
        </li>
        <li class="list-group-item">
            <div class="input-group">
                <input type="text" class="form-control" placeholder="Menge" aria-label="Menge" v-model.trim="newIngredient.amount">
                <div class="dropdown">
                    <textarea type="text" id="dd_new" :class="['form-control', 'dropdown-toggle', {unknown: !newIngredient.id}]" placeholder="Zutat" aria-label="Zutat" data-bs-toggle="dropdown" 
                        v-model.trim="newIngredient.ingredient" v-on:keyup="maybeShowIngredients(-1, $event)" rows="1" />
                    <ul class="dropdown-menu" v-show="newIngredientDropDownIngredients.length > 0">
                        <li v-for="ddingredient in newIngredientDropDownIngredients" v-bind:key="ddingredient.id" aria-labelledby="dd_new">
                            <a class="dropdown-item" href="javascript:void(0)" v-on:click="newIngredient.ingredient = ddingredient.ingredient"><span v-html="ddingredient.highlight"></span></a>
                        </li>
                    </ul>
                </div>
                <button type="button" class="btn btn-success btn-sm" aria-label="Add Ingredient" @click="addIngredient()">
                    <font-awesome-icon icon="plus-square" />
                </button>
            </div>
        </li>
    </ul>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'IngredientsList',
    props: {
        ingredients: Array,
    },
    data() {
        return {
            newIngredient: this.makeEmptyIngredient(),
            dropDownIngredients: [],
            newIngredientDropDownIngredients: [],
        }
    },
    methods: {
        maybeShowIngredients(ingredientIndex, event) {
            if (event.key.startsWith('Arrow'))
                return;
            if (event.key === 'Enter') {
                if (ingredientIndex === -1) {
                    this.addIngredient();
                } else {
                    this.ingredientChanged(ingredientIndex, event);
                }
                return;
            }
            const value = event.target.value;
            const possibleIngredientsRaw = this.$store.getters.getIngredientsBySubstring(value);
            const possibleIngredients = possibleIngredientsRaw.map(i => { 
                const idx = i.ingredient.toLowerCase().indexOf(value.toLowerCase());
                i.highlight = `${i.ingredient.substring(0, idx)}<b>${i.ingredient.substring(idx, value.length)}</b>${i.ingredient.substring(idx+value.length, i.ingredient.length)}`;
                return i;
            });
            if (ingredientIndex === -1) {
                this.newIngredientDropDownIngredients = possibleIngredients;
            } else {
                this.dropDownIngredients[ingredientIndex] = possibleIngredients;
            }
            // fixes dropdown position:
            window.dispatchEvent(new Event('resize'));
        },
        ingredientChanged(ingredientIndex, value) {
            if (value.relatedTarget && value.relatedTarget.tagName === 'A')
                return;
            const oldIngredient = this.ingredients[ingredientIndex];
            let newIngredientValue;
            if (value.target) {
                newIngredientValue = value.target.value.trim()
            } else {
                newIngredientValue = value.trim();
            }
            //oldIngredient.ingredient = newIngredientValue;
            //this.ingredients[ingredientIndex] = oldIngredient;
            // eslint-disable-next-line
            this.ingredients[ingredientIndex].ingredient = newIngredientValue;
            this.checkExistingIngredient(ingredientIndex);
            this.dropDownIngredients = [];
            this.newIngredientDropDownIngredients = [];
        },
        addIngredient() {
            this.newIngredient.ingredient = this.newIngredient.ingredient.trim();
            if (this.newIngredient.ingredient !== '') {
                delete this.newIngredient.highlight;
                if (this.newIngredient.ingredient.indexOf("\n") === -1) {
                    // eslint-disable-next-line
                    this.ingredients.push(this.newIngredient);
                    this.checkExistingIngredient(this.ingredients.length - 1);
                } else {
                    const newIngredients = this.newIngredient.ingredient.split("\n").filter(l => l.length > 0).map(l => { 
                        const lineSplit = l.split(' ');
                        if (lineSplit.length > 1) {
                            return {amount: lineSplit[0], ingredient: lineSplit.splice(1, lineSplit.length-1).join(' ').trim()};
                        }
                        return {amount: '', ingredient: l.trim()};
                    });
                    this.ingredients.push.apply(this.ingredients, newIngredients);
                    newIngredients.forEach((v, i) => this.checkExistingIngredient(this.ingredients.length - i - 1));
                }
                this.newIngredient = this.makeEmptyIngredient();
                this.dropDownIngredients = [];
                this.newIngredientDropDownIngredients = [];
            }
        },
        checkExistingIngredient(index) {
            const oldIngredient = this.ingredients[index];
            const existingNewIngredient = this.$store.getters.getIngredientByIngredient(oldIngredient.ingredient);
            if (existingNewIngredient) {
                oldIngredient.id = existingNewIngredient.id;
                oldIngredient.categoryId = existingNewIngredient.categoryId;
                oldIngredient.storeId = existingNewIngredient.storeId;
            } else {
                oldIngredient.id = null;
                oldIngredient.categoryId = null;
                oldIngredient.storeId = null;
            }
            //this.ingredients[index] = oldIngredient;
        },
        deleteIngredient(index) {
            // eslint-disable-next-line
            this.ingredients.splice(index, 1);
        },
        makeEmptyIngredient() {
            return {amount: '', ingredient: '', id: null};
        },
    },
});
</script>

<style scoped>
    input.unknown { 
        border-color: red;
    }
    #dd_new {
        resize: none;
    }
    .dropdown-menu {
        z-index: 1100;
    }
    .dropdown {
        flex: 1 1 auto;
    }
</style>