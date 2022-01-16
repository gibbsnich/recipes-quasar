<template>
    <div class="modal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Zutaten ohne Kategorie</h5>
            </div>
            <div class="modal-body">
                <p>Neue Zutat ohne Zuordnung gefunden: <b>{{ ingredientName }}</b></p> <!-- todo: hier nochmal änderbar machen -->
                <div>
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Kategorie</h5>
                            <div class="form-check form-check-inline" v-for="ingredientCategory in this.$store.getters.getSortedIngredientCategories" v-bind:key="ingredientCategory.id">
                                <input class="form-check-input" type="radio" name="categoryOptions" :id="'radio_' + ingredientCategory.id" :value="ingredientCategory.id" v-model="pickedCategory">
                                <label class="form-check-label" :for="'radio_' + ingredientCategory.id">{{ ingredientCategory.name }}</label>
                            </div>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="categoryOptions" id="radio_new" value="new" v-model="pickedCategory" v-on:change="this.focusInput($event, 'newCategoryInput')">
                                ... oder neu anlegen:
                                <input type="text" placeholder="Neue Kategorie" ref="newCategoryInput" v-model="newCategoryName" v-on:focus="this.pickedCategory = 'new'">
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Laden</h5>
                            <div class="form-check form-check-inline" v-for="ingredientStore in this.$store.getters.getSortedIngredientStores" v-bind:key="ingredientStore.id">
                                <input class="form-check-input" type="radio" name="storeOptions" :id="'radio_store_' + ingredientStore.id" :value="ingredientStore.id" v-model="pickedStore">
                                <label class="form-check-label" :for="'radio_store_' + ingredientStore.id">{{ ingredientStore.name }}</label>
                            </div>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="storeOptions" id="radio_new_store" value="new" v-model="pickedStore" v-on:change="this.focusInput($event, 'newStoreInput')">
                                ... oder neu anlegen:
                                <input type="text" placeholder="Neuer Laden" ref="newStoreInput" v-model="newStoreName" v-on:focus="this.pickedStore = 'new'">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary" @click="close" :disabled="disallowSave">Speichern</button>
            </div>
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'IngredientWithoutCategoryModal',
    emits: ['close'],
    props: {
        ingredient: Object,
    },
    data() {
        return {
            pickedCategory: null,
            newCategoryName: '',
            pickedStore: null,
            newStoreName: '',
        }
    },
    computed: {
        ingredientName: {
            get() {
                if (this.ingredient) {
                    return this.ingredient.ingredient;
                }
                return null;
            },
        },
        disallowSave: {
            get() {
                if (!this.pickedCategory || !this.pickedStore)
                    return true;
                if (this.pickedCategory === 'new' && (this.newCategoryName.length === 0 || this.$store.getters.getIngredientCategoriesByName(this.newCategoryName).length > 0))
                    return true;
                if (this.pickedStore === 'new' && (this.newStoreName.length === 0 || this.$store.getters.getIngredientStoresByName(this.newStoreName).length > 0))
                    return true;
                return false;
            }
        },
    },
    methods: {
        focusInput(evt, name) {
            if (evt.target.value === 'new') {
                this.$refs[name].focus()
            }
        },
        close() {
            if (this.pickedCategory && this.pickedStore) {
                const selection = {};
                if (this.pickedCategory === 'new') {
                    selection.categoryName = this.newCategoryName;
                } else {
                    selection.categoryId = this.pickedCategory;
                }
                if (this.pickedStore === 'new') {
                    selection.storeName = this.newStoreName;
                } else {
                    selection.storeId = this.pickedStore;
                }
                this.$emit('close', selection);
                this.pickedCategory = null;
                this.newCategoryName = '';
                this.pickedStore = null;
                this.newStoreName = '';
            }
        },
    }
})
</script>

<style scoped>
  .modal {
    display: block;
  }
</style>