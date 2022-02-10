<template>
    <login-modal v-if="!$q.platform.is.electron && !$q.platform.is.capacitor" v-show="!this.$store.state.isAuthenticated && this.$store.state.isOnline && !this.$store.state.forceNoAuth" />
    <div :class="{blur_bg: !this.$store.state.isAuthenticated && this.$store.state.isOnline && !this.$store.state.forceNoAuth}">
        <site-menu activeTab="shoppinglists">
                <h4>Automatischer Einkaufszettel</h4>
                <div v-if="this.shoppingList.stores.length === 0">
                    <h6>Nichts gefunden...</h6>
                </div>
                <div class="row ms-1 me-1 mb-2">
                    <div class="input-group">
                        <div class="col-3">
                            <input type="text" class="form-control" placeholder="Menge" aria-label="Menge" v-model.trim="newIngredient.amount">
                        </div>
                        <div class="col-8">
                            
                            <div class="dropdown">
                                <textarea type="text" id="dd_new" :class="['form-control', 'dropdown-toggle', {unknown: !newIngredient.id}]" placeholder="Zutat" aria-label="Zutat" data-bs-toggle="dropdown" 
                                    v-model.trim="newIngredient.ingredient" v-on:keyup="maybeShowIngredients(-1, $event)" rows="1" />
                                <ul class="dropdown-menu" v-show="newIngredientDropDownIngredients.length > 0">
                                    <li v-for="ddingredient in newIngredientDropDownIngredients" v-bind:key="ddingredient.id" aria-labelledby="dd_new">
                                        <a class="dropdown-item" href="javascript:void(0)" v-on:click="addIngredientFromDropDown(ddingredient.ingredient)"><span v-html="ddingredient.highlight"></span></a>
                                    </li>
                                </ul>
                            </div>
                            
                        </div>
                        <div class="col-1 ">
                        <button type="button" class="btn btn-success btn-sm" aria-label="Add Ingredient" @click="addIngredient()">
                                <font-awesome-icon icon="plus-square" />
                            </button>
                        </div>
                    </div>
                </div>
                <div v-for="(store, storeIndex) in this.shoppingList.stores" :key="store">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-subtitle mb-2 text-muted">{{ store.name }}</h5>
                            <ul class="list-group">
                                <li class="list-group-item"  v-for="(item, itemIndex) in store.list" :key="itemIndex">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" :id="item.label" :checked="item.bought" @change="this.saveState($event, this.shoppingList.id, storeIndex, itemIndex)">
                                        <label class="form-check-label" :for="item.label" :class="{strike: item.bought}">{{ item.label }}</label>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <button type="button" class="btn btn-danger" style="margin-top:1rem; margin-left: 3rem;" :disabled="!hasBoughtIngredients" @click="cleanUpList">
                    <font-awesome-icon icon="trash" />&nbsp;Aufräumen
                </button>
        </site-menu>
    </div>
    <ingredient-without-category-modal v-show="isIngredientWithoutCategoryModalVisible" @close="closeIngredientsWithoutCategoryModal" v-bind:ingredient="ingredientWithoutCategory" />
</template>

<script>
import { defineComponent } from 'vue';
import { generateAutoShoppingList, addToAutoShoppingList } from '../util/generatePDF.js';
import LoginModal from '../components/web/LoginModal.vue';
import SiteMenu from '../components/SiteMenu.vue';
import IngredientWithoutCategoryModal from '../components/IngredientWithoutCategoryModal.vue';
import { UnknownIngredientsMixin } from '../components/UnknownIngredientsMixin.js';

export default defineComponent({
    name: 'AutoShoppingList',
    components: {
        SiteMenu,
        LoginModal,
        IngredientWithoutCategoryModal,
    },
    mixins: [UnknownIngredientsMixin],
    data() {
        return {
            newIngredient: this.makeEmptyIngredient(),
            newIngredientDropDownIngredients: [],
        }
    },
    computed: {
        shoppingList: {
            get() {
                const list = this.$store.getters.getAutoShoppingList;
                if (list.stores.length > 0) {
                    this.$store.dispatch('storeShoppingList', list);
                }
                return list;
            },
        },

        hasBoughtIngredients: {
            get() {
                return this.shoppingList.stores.reduce((s, e) => {
                    if (!s) {
                        if (e.list.find(i => i.bought)) {
                            return true;
                        }
                    }
                    return s;
                }, false);
            },
        },
    },
    
    methods: {
        saveState(event, listId, storeIndex, itemIndex) {
            this.$store.dispatch('toggleShoppingListItem', { listId, storeIndex, itemIndex, checked: event.target.checked} );
        },
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
                i.highlight = `${i.ingredient.substring(0, idx)}<b>${i.ingredient.substring(idx, idx + value.length)}</b>${i.ingredient.substring(idx + value.length)}`;
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
        addIngredientFromDropDown(ddIngredient) {
            this.newIngredient.ingredient = ddIngredient;
            this.addIngredient();
        },
        addIngredient() {
            this.newIngredient.ingredient = this.newIngredient.ingredient.trim();
            if (this.newIngredient.ingredient !== '') {
                delete this.newIngredient.highlight;
                this.newIngredient = this.checkExistingIngredient(this.newIngredient);
                this.unknownIngredients = [];
                const withoutCategory = this.checkForIngredientsWithoutCategory([this.newIngredient]);
                if (withoutCategory) {
                    this.ingredientWithoutCategory = withoutCategory;
                    this.isIngredientWithoutCategoryModalVisible = true;
                } else {
                    const newShoppingList = addToAutoShoppingList(this.$store, this.shoppingList, this.newIngredient);
                    this.$store.dispatch('storeShoppingList', newShoppingList);
                    this.newIngredient = this.makeEmptyIngredient();
                    this.dropDownIngredients = [];
                    this.newIngredientDropDownIngredients = [];
                }
            }
        },

        checkExistingIngredient(ingredient) {
            const existingNewIngredient = this.$store.getters.getIngredientByIngredient(ingredient.ingredient);
            if (existingNewIngredient) {
                ingredient.id = existingNewIngredient.id;
                ingredient.categoryId = existingNewIngredient.categoryId;
                ingredient.storeId = existingNewIngredient.storeId;
            }
            return ingredient;
        },

        finishedHandlingUnknownIngredients() {
            this.shoppingList = addToAutoShoppingList(this.$store, this.shoppingList, this.newIngredient);
            this.newIngredientsEvent = null;
        },

        makeEmptyIngredient() {
            return {amount: '', ingredient: '', id: null};
        },

        cleanUpList() {
            const list = this.shoppingList;
            list.stores.forEach((s, idx) => {
                s.list = s.list.filter(i => !i.bought);
            });
            list.stores = list.stores.filter(s => s.list.length > 0);
            this.$store.dispatch('storeShoppingList', list);
        },
    },
});
</script>

<style scoped>
    h4 {
        margin-left: 3rem;
    }
    h5 {
        margin-left: 1rem;
    }
    h6 {
        margin-left: 4rem;
    }
    label.strike {
        text-decoration: line-through;
        color: #aaa;
    }
    .delete-button {
        margin-left: 5rem;
        margin-top: 1rem;
        margin-bottom: 1rem;
    }
</style>