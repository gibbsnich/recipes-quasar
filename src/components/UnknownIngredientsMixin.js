export const UnknownIngredientsMixin = {
    data() {
        return {
            isIngredientWithoutCategoryModalVisible: false,
            ingredientWithoutCategory: null,
        }
    },
    methods: {
        checkForIngredientsWithoutCategory: function(ingredients) {
            const withoutCategory = ingredients.find((i) => !i.id);
            if (withoutCategory) {
                return withoutCategory;
            }
            return null;
        },
        closeIngredientsWithoutCategoryModal: async function(selectedCategories) {
            if (selectedCategories.categoryName) {
                await this.$store.dispatch('storeIngredientCategory', selectedCategories.categoryName);
                const ingredientCategories = this.$store.getters.getIngredientCategoriesByName(selectedCategories.categoryName);
                if (ingredientCategories.length === 0) {
                    console.warn("Cannot find created category!");
                } else {
                    selectedCategories.categoryId = ingredientCategories[0].id;
                }
            }
            if (selectedCategories.storeName) {
                await this.$store.dispatch('storeIngredientStore', selectedCategories.storeName);
                const ingredientStores = this.$store.getters.getIngredientStoresByName(selectedCategories.storeName);
                if (ingredientStores.length === 0) {
                    console.warn("Cannot find created store!");
                } else {
                    selectedCategories.storeId = ingredientStores[0].id;
                }
            }

            this.$store.dispatch('storeIngredient', {ingredientWithoutCategory: this.ingredientWithoutCategory, ingredientCategoryId: selectedCategories.categoryId, ingredientStoreId: selectedCategories.storeId});
            const withoutCategory = this.checkForIngredientsWithoutCategory(this.unknownIngredients);
            if (withoutCategory) {
                this.ingredientWithoutCategory = withoutCategory;
            } else {
                this.finishedHandlingUnknownIngredients();
                this.isIngredientWithoutCategoryModalVisible = false;
            }
        },
    }
};