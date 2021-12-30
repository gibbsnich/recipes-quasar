<template>
    <div class="accordion">
        <div class="accordion-item" v-for="category in categories" v-bind:key="category.id">
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button type="button" :class="['accordion-button', {collapsed: category.id !== expandedCategoryId}]" @click="toggle(category.id)">
                        {{ category.name }}
                    </button>
                </h2>
                <div :class="['accordion-collapse', 'collapse', {show: category.id === expandedCategoryId}]">
                    <div class="accordion-body">
                        <slot :category="category">
                            <select class="form-select" aria-label="Rezeptauswahl" @change="itemSelected">
                                <option value="-1">Rezept wählen..</option>
                                <option v-for="item in categoryItemsGetter(category.id)" :value="item.id" v-bind:key="item.id">
                                    {{ item.name }}
                                </option>
                            </select>
                        </slot>
                    </div>
                </div>
            </div>
        </div>
        <div class="accordion-item" v-if="restCategoryName && restCategoryItems.length > 0">
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button type="button" :class="['accordion-button', {collapsed: -1 !== expandedCategoryId}]" @click="toggle(-1)">
                        {{ restCategoryName }}
                    </button>
                </h2>
                <div :class="['accordion-collapse', 'collapse', {show: -1 === expandedCategoryId}]">
                    <div class="accordion-body">
                        <select class="form-select" aria-label="Rezeptauswahl" @change="itemSelected">
                            <option value="-1">Rezept wählen..</option>
                            <option v-for="item in restCategoryItems" :value="item.id" v-bind:key="item.id">
                                {{ item.name }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Accordion',
    emits: ['itemSelected'],
    props: {
        categories: Array,
        categoryItemsGetter: Function,
        restCategoryName: String,
        restCategoryItems: Array,
    },
    data() {
        return {
            expandedCategoryId: -2,
        }
    },
    methods: {
        toggle(recipeCategoryId) {
            if (this.expandedCategoryId === recipeCategoryId) {
                this.expandedCategoryId = -2;
            } else {
                this.expandedCategoryId = recipeCategoryId;
            }
        },
        itemSelected(event) {
            this.$emit('itemSelected', parseInt(event.target.value));
        },
    }
})
</script>

<style scoped>
    .accordion-button {
        padding: 0;
    }
</style>