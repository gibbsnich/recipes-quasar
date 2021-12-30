<template>
    <select-recipe-modal :key="selectRecipeKey" v-show="isSelectRecipeModalVisible" @close="closeSelectRecipeModal" v-bind:event="selectRecipeModalEventInfo" />
    <random-ingredients-modal :key="randomIngredientKey" v-show="isRandomIngredientsModalVisible" @close="closeRandomIngredientsModal" v-bind:date="randomIngredientsDate" />
    <ingredient-without-category-modal v-show="isIngredientWithoutCategoryModalVisible" @close="closeIngredientsWithoutCategoryModal" v-bind:ingredient="ingredientWithoutCategory" />
    <FullCalendar :options="{...calendarOptions, events: this.$store.state.events}"  />
</template>

<script>
import { defineComponent } from 'vue';
import '@fullcalendar/core/vdom'; // solves problem with Vite
import deLocale from '@fullcalendar/core/locales/de';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import SelectRecipeModal from './SelectRecipeModal.vue';
import RandomIngredientsModal from './RandomIngredientsModal.vue';
import { UnknownIngredientsMixin } from './UnknownIngredientsMixin.js';
import IngredientWithoutCategoryModal from './IngredientWithoutCategoryModal.vue';
import { dateToString } from '../util/date.js';
import { generatePDF } from '../util/generatePDF.js';

export default defineComponent({
    components: {
        FullCalendar,
        SelectRecipeModal,
        RandomIngredientsModal,
        IngredientWithoutCategoryModal,
    },
    mixins: [UnknownIngredientsMixin],
    data() {
        return {
            currentSelection: null,
            calendarOptions: {
                plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
                locale: deLocale,
                //slotDuration: "02:00:00",
                initialView: 'timeGridWeek',
                headerToolbar: {
                    left: 'prev,next today gotoRecipesButton generatePDFButton',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek'
                },
                customButtons: {
                    gotoRecipesButton: {
                        text: 'Rezepte',
                        click: () => {
                            this.$router.push('/recipes');
                        }
                    },
                    generatePDFButton: {
                        text: 'PDF erzeugen',
                        click: () => {
                            if (this.currentSelection) {
                                generatePDF(this.currentSelection, this.$store);
                            }
                        }
                    }
                },
                eventClick: this.handleEventClick,
                editable: true,
                selectable: true,
                select: this.handleSelect,
                dateClick: this.handleDateClick,
            },
            selectRecipeKey: 1,
            isSelectRecipeModalVisible: false,
            selectRecipeModalEventInfo: null,
            randomIngredientKey: 1,
            isRandomIngredientsModalVisible: false,
            randomIngredientsDate: null,
            newIngredientsEvent: null,
            unknownIngredients: null,
        }
    },
    methods: {
        handleSelect(info) {
            this.currentSelection = {start: info.start, end: info.end};
        },
        handleEventClick(info) {
            if (info.event.extendedProps.extra) {
                this.randomIngredientsDate = dateToString(info.event.start)
                this.isRandomIngredientsModalVisible = true;
            } else {
                this.selectRecipeKey += 1;
                this.selectRecipeModalEventInfo = info.event;
                this.isSelectRecipeModalVisible = true;
            }
        },
        closeSelectRecipeModal(selectedRecipe) {
            this.isSelectRecipeModalVisible = false;
            if (selectedRecipe) {
                this.selectRecipeModalEventInfo.recipeId = selectedRecipe;
                this.$store.dispatch('storeRecipeEvent', this.selectRecipeModalEventInfo);
            }
            this.selectRecipeModalEventInfo = null;
        },
        handleDateClick(info) {
            this.randomIngredientsDate = dateToString(info.date);
            this.randomIngredientKey += 1;
            this.isRandomIngredientsModalVisible = true;
        },
        closeRandomIngredientsModal(ingredientsEvent) {
            this.isRandomIngredientsModalVisible = false;
            if (ingredientsEvent) {
                const withoutCategory = this.checkForIngredientsWithoutCategory(ingredientsEvent.extendedProps.ingredients);
                if (withoutCategory) {
                    this.ingredientWithoutCategory = withoutCategory;
                    this.isIngredientWithoutCategoryModalVisible = true;
                    this.newIngredientsEvent = ingredientsEvent;
                    this.unknownIngredients = ingredientsEvent.extendedProps.ingredients;
                } else {
                    //todo delete event if empty ingredients
                    this.$store.dispatch('storeEvent', ingredientsEvent);
                }
            }
            this.randomIngredientsDate = null;
        },
        finishedHandlingUnknownIngredients() {
            this.$store.dispatch('storeEvent', this.newIngredientsEvent);
            this.newIngredientsEvent = null;
        },
    }
});
</script>

<style>
    a { 
        color: #000;
        text-decoration: none;
    }
    a:hover {
        color: #000;
    }
</style>