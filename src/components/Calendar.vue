<template>
    <login-modal v-if="!$q.platform.is.electron && !$q.platform.is.capacitor" v-show="!this.$store.state.isAuthenticated && this.$store.state.isOnline && !this.$store.state.forceNoAuth" />
    <select-recipe-modal :key="selectRecipeKey" v-show="isSelectRecipeModalVisible" @close="closeSelectRecipeModal" v-bind:event="selectRecipeModalEventInfo" />
    <random-ingredients-modal :key="randomIngredientKey" v-show="isRandomIngredientsModalVisible" @close="closeRandomIngredientsModal" v-bind:date="randomIngredientsDate" />
    <ingredient-without-category-modal v-show="isIngredientWithoutCategoryModalVisible" @close="closeIngredientsWithoutCategoryModal" v-bind:ingredient="ingredientWithoutCategory" />
    <div :class="{blur_bg: (!this.$store.state.isAuthenticated && this.$store.state.isOnline && !this.$store.state.forceNoAuth) || isSelectRecipeModalVisible || isRandomIngredientsModalVisible || isIngredientWithoutCategoryModalVisible}">
        <FullCalendar :options="{...calendarOptions, events: this.$store.state.events}" />
    </div>
</template>

<script>
import { defineComponent } from 'vue';
//import '@fullcalendar/core/vdom'; // solves problem with Vite
import deLocale from '@fullcalendar/core/locales/de';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import SelectRecipeModal from './SelectRecipeModal.vue';
import RandomIngredientsModal from './RandomIngredientsModal.vue';
import { UnknownIngredientsMixin } from './UnknownIngredientsMixin.js';
import IngredientWithoutCategoryModal from './IngredientWithoutCategoryModal.vue';
import LoginModal from './web/LoginModal.vue';
import { dateToString } from '../util/date.js';
import { generatePDF, generateShoppingList } from '../util/generatePDF.js';

const getWidth = () =>
   Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth
  );

const getHeight = () =>
  Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.documentElement.clientHeight
  );

export default defineComponent({
    components: {
        FullCalendar,
        SelectRecipeModal,
        RandomIngredientsModal,
        IngredientWithoutCategoryModal,
        LoginModal,
    },
    mixins: [UnknownIngredientsMixin],
    data() {
        return {
            currentSelection: null,
            calendarOptions: {
                plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
                locale: deLocale,
                aspectRatio: this.calendarAspectRatio(),//Platform.is.mobile ? 0.85 : 2,
                //slotDuration: "01:00:00",
                slotMinTime: "10:00:00",
                slotMaxTime: "20:00:00",
                initialView: 'timeGridWeek',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek'
                },
                footerToolbar: {
                    left: 'gotoRecipesButton,generatePDFButton',
                    // right: 'generateShoppingListButton,existingShoppingListsButton'
                    right: 'generateShoppingListButton'
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
                    },
                    generateShoppingListButton: {
                        text: 'Einkaufsliste erzeugen',
                        click: () => {
                            if (this.currentSelection) {
                                const newShoppingList = generateShoppingList({start: this.currentSelection.start, end: this.currentSelection.end}, this.$store);
                                this.$store.dispatch('storeShoppingList', newShoppingList);
                                this.$router.push(`/shopping-list/${newShoppingList.id}`);
                            }
                        }
                    },
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
        calendarAspectRatio() {
            let r = (getWidth() / getHeight()) * 1.2;
            if (r < .7) r = 1.4;
            return r;
        },
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
    @media(max-width: 767px) {
        .fc-toolbar.fc-footer-toolbar {
            display: flex;
            flex-direction: column;
        }
        .fc-toolbar.fc-footer-toolbar .fc-left {
            order: 1;
        }
        .fc-toolbar.fc-footer-toolbar .fc-center {
            order: 1;
        }
        .fc-toolbar.fc-footer-toolbar .fc-right {
            order: 1;
        }
    }
</style>