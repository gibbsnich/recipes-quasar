<template>
    <login-modal v-if="!$q.platform.is.electron && !$q.platform.is.capacitor" v-show="!this.$store.state.isAuthenticated" />
    <calendar-link />
    <h4>Einkaufsliste</h4>
    <div v-for="store in this.$store.getters.getSortedIngredientStores" v-bind:key="store.id">
        <div class="card" v-if="this.ingredientKeys.filter(ik => this.ingredients[ik].store === store.id).length > 0">
            <div class="card-body">
                <h5 class="card-subtitle mb-2 text-muted">{{ store.name }}</h5>
                <div v-for="category in this.$store.getters.getSortedIngredientCategories" v-bind:key="category.id">
                    <div v-if="this.categoryKeys(store, category).length > 0">
                        <ul class="list-group">
                            <li class="list-group-item" v-for="ik in this.categoryKeys(store, category)" v-bind:key="ik">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" :id="key">
                                    <label class="form-check-label" :for="key"><span v-if="this.ingredient(ik).amount">{{ this.ingredient(ik).amount }}&nbsp;</span>{{ ik }}</label>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import LoginModal from '../components/web/LoginModal.vue';
import CalendarLink from '../components/CalendarLink.vue';
import { generateIngredientData } from '../util/generatePDF.js';

export default defineComponent({
    name: 'ingredients',
    components: {
        LoginModal,
        CalendarLink,
    },
    props: {
        start: String,
        end: String,
    },
    computed: {
        ingredients: {
            get() {
                const { allIngredients } = generateIngredientData({start: this.start, end: this.end}, this.$store);
                return allIngredients;
            },
        },
        ingredientKeys: {
            get() {
                return Object.keys(this.ingredients).sort((a, b) => a < b ? -1 : (b < a ? 1 : 0));
            },
        }
    },
    methods: {
        categoryKeys(store, category) {
            const keys = this.ingredientKeys
                .filter(ik => this.ingredients[ik].store === store.id && this.ingredients[ik].category === category.id)
                .sort((a, b) => a < b ? -1 : (b < a ? 1 : 0));
            return keys;
        },
        ingredient(key) {
            return this.ingredients[key];
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
</style>