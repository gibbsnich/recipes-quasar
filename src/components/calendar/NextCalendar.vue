<template>
    <div :class="{blur_bg: (!this.$store.state.isAuthenticated && this.$store.state.isOnline && !this.$store.state.forceNoAuth) || isSelectRecipeModalVisible || isRandomIngredientsModalVisible || isIngredientWithoutCategoryModalVisible}">
        <settings-menu activeTab="">
            <template v-slot:items>
                <li class="nav-item">
                    <a :class="['nav-link', {disabled: selectedCells.length === 0}]" href="javascript:void(0)" @click="generateShoppingListClick()">Neue Einkaufsliste</a>
                </li>
                <li class="nav-item">
                    <a :class="['nav-link', {disabled: selectedCells.length === 0}]" href="javascript:void(0)" @click="generatePDFClick()">PDF erzeugen</a>
                </li>
            </template>
            <div style="margin-left:auto;margin-right:auto;max-width:1240px;">
                <div class="arow" v-for="index in 6" :key="index">
                    <calendar-cell v-for="j in dayNums(index)" :key="j" :akey="j" :date="day(j)" 
                        v-bind:middayEvent="eventCache[`${j}_12`]" 
                        v-bind:eveningEvent="eventCache[`${j}_18`]" 
                        v-bind:additionalEvent="eventCache[`${j}_14`]"
                        :class="[{'highlight': isSelected(j)}]"
                        @clickedMidday="clickedMidday" @clickedEvening="clickedEvening" @clickedAdditional="clickedAdditional"
                        @mousedown="mousedown(j)" @mouseup="mouseup(j)" @mouseover="mouseover(j)"
                        @touchstart="mousedown(j)" @touchend="mouseup(j)" @touchmove="touchmove($event)" />
                </div>
            </div>    
        </settings-menu>
    </div>
    <login-modal v-if="!$q.platform.is.electron && !$q.platform.is.capacitor" v-show="!this.$store.state.isAuthenticated && this.$store.state.isOnline && !this.$store.state.forceNoAuth" />
    <select-recipe-modal :key="selectRecipeKey" v-show="isSelectRecipeModalVisible" @close="closeSelectRecipeModal" v-bind:event="selectRecipeModalEventInfo" />
    <random-ingredients-modal :key="randomIngredientKey" v-show="isRandomIngredientsModalVisible" @close="closeRandomIngredientsModal" v-bind:date="randomIngredientsDate" />
    <ingredient-without-category-modal v-show="isIngredientWithoutCategoryModalVisible" @close="closeIngredientsWithoutCategoryModal" v-bind:ingredient="ingredientWithoutCategory" />
</template>

<script>
import { defineComponent, reactive } from 'vue';
import SelectRecipeModal from '../SelectRecipeModal.vue';
import RandomIngredientsModal from '../RandomIngredientsModal.vue';
import { UnknownIngredientsMixin } from '../UnknownIngredientsMixin.js';
import IngredientWithoutCategoryModal from '../IngredientWithoutCategoryModal.vue';
import LoginModal from '../web/LoginModal.vue';
import SettingsMenu from '../SettingsMenu.vue';
import CalendarCell from './CalendarCell.vue';
import { dateToString } from '../../util/date.js';
import { generatePDF, generateShoppingList } from '../../util/generatePDF.js';

export default defineComponent({
    name: 'Calendar',
    components: {
        SelectRecipeModal,
        RandomIngredientsModal,
        IngredientWithoutCategoryModal,
        LoginModal,
        SettingsMenu,
        CalendarCell,
    },
    mixins: [UnknownIngredientsMixin],
    data() {
        return {
            //numDays: 25,
            firstDay: null,
            //rows: [1,2,3,4,5],
            //days: [],
            isMouseDown: false,
            lastSelectedCell: null,
            selectedCells: [],
            clickTimeout: null,

            eventCache: {},

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
    beforeMount() {
        this.firstDay = new Date();
        while (this.firstDay.getDate() !== 1) {
            this.firstDay = new Date(this.firstDay.setDate(this.firstDay.getDate() - 1));
        }
        while (this.firstDay.getDay() !== 1) {
            this.firstDay = new Date(this.firstDay.setDate(this.firstDay.getDate() - 1));
        }
        for (let n = 0; n < 42; n++) {
            const dateStr = dateToString(this.day(n));
            [12, 14, 18].forEach((time) => {
                const event = this.$store.getters.getEventByStart(`${dateStr}T${time}:00`);
                if (event) {
                    this.eventCache[`${n}_${time}`] = event;
                } else {
                    const newEvent = reactive({
                        eventStart: `${dateStr}T${time}:00`,
                        start: this.day(n),
                        title: time === 12 ? 'Mittagessen' : 'Abendessen',
                        extendedProps: {recur: true, ingredients: []},
                    });
                    this.eventCache[`${n}_${time}`] = newEvent;
                }
            });
        }
    },
    methods: {
        getEvent(dayVal, time) {
            return this.eventCache[`${dayVal}_${time}`];
        },
        day(num) {
            return new Date(new Date().setTime(this.firstDay.getTime() + (num * (1000*60*60*24))));
        },
        dayNums(start) {
            const nums = [];
            for (let k = (start - 1) * 7; k < (start - 0) * 7; k++)
                nums.push(k);
            return nums;
        },
        mousedown(dayVal) {
            this.selectedCells = [];
            this.isMouseDown = true;
            this.clickTimeout = setTimeout(() => {
                if (this.isMouseDown) {
                    this.selectedCells = [dayVal];
                }
            }, 250);
        },
        mouseup(dayVal) {
            this.isMouseDown = false;
            if (this.clickTimeout) {
                clearTimeout(this.clickTimeout);
                this.clickTimeout = null;
            }
            
            const len = this.selectedCells.length;
            if (len > 0) {
                this.fireSelection(this.day(this.selectedCells[0]), this.day(this.selectedCells[len - 1]));
            }
        },
        touchmove(event) {
            const element = document.elementFromPoint(event.touches[0].pageX, event.touches[0].pageY);
            if (element.attributes['akey']) {
                this.mouseover(parseInt(element.attributes['akey'].value));
            } else if (element.parentElement && element.parentElement.attributes['akey']) {
                this.mouseover(parseInt(element.parentElement.attributes['akey'].value));
            }
        },
        mouseover(dayVal) {
            if (this.isMouseDown) {
                if (this.selectedCells.length === 0) {
                    this.selectedCells.push(dayVal);
                } else {
                    if (dayVal === this.lastSelectedCell)
                        return;
                    if (this.selectedCells.indexOf(dayVal) === -1) { //add cell
                        for (let n = this.selectedCells[this.selectedCells.length-1] + 1; n <= dayVal; n++) {
                            if (this.selectedCells.indexOf(n) === -1) {
                                this.selectedCells.push(n);
                            }
                        }
                        for (let n = this.selectedCells[0] - 1; n >= dayVal; n--) {
                            if (this.selectedCells.indexOf(n) === -1) {
                                this.selectedCells.splice(0, 0, n);
                            }
                        }
                    } else { //remove cell
                        if (dayVal < this.lastSelectedCell) {
                            for (let n = this.selectedCells.length - 1; n > this.selectedCells.indexOf(dayVal); n--) {
                                this.selectedCells.splice(n);
                            }
                        } else {
                            const count = this.selectedCells.indexOf(dayVal);
                            for (let n = 0; n < count; n++) {
                                this.selectedCells = this.selectedCells.splice(1);
                            }
                        }
                    }
                }
                this.lastSelectedCell = dayVal;
            }
        },
        isSelected(dayVal) {
            return this.selectedCells.indexOf(dayVal) !== -1;
        },
        fireSelection(start, end) {
            console.log(`selected: ${start} - ${end}`);
        },
        clickedMidday(event) {//dayVal) {
            // this.showSelectRecipeModal(dayVal, 12);
            // console.log(`midday ${dayVal}`)
            this.showSelectRecipeModalFromEvent(event);
        },
        clickedEvening(event) {//dayVal) {
            // this.showSelectRecipeModal(dayVal, 18);
            // console.log(`evening ${dayVal}`)

            this.showSelectRecipeModalFromEvent(event);
        },
        // clickedAdditional(dayVal) {
        //     this.randomIngredientsDate = dateToString(this.day(dayVal));
        //     //this.randomIngredientKey += 1;
        //     this.isRandomIngredientsModalVisible = true;
        //     console.log(`additional ${dayVal}`)
        // },
        clickedAdditional(date) {
            this.randomIngredientsDate = dateToString(date);
            //this.randomIngredientKey += 1;
            this.isRandomIngredientsModalVisible = true;
            // console.log(`additional ${dayVal}`)
        },
        showSelectRecipeModalFromEvent(event) {
            this.selectRecipeKey += 1;
            this.selectRecipeModalEventInfo = event;
            this.isSelectRecipeModalVisible = true;
        },
        // showSelectRecipeModal(dayVal, time) {
        //     const dateStr = dateToString(this.day(dayVal));
        //     const event = this.getEvent(dayVal, time);//this.$store.getters.getEventByStart(`${dateStr}T${time}:00`);
        //     this.selectRecipeKey += 1;
        //     if (event) {
        //         this.selectRecipeModalEventInfo = event;
        //     } else {
        //         const date = this.day(dayVal);
        //         date.setHours(time);
        //         this.selectRecipeModalEventInfo = this.getEvent(dayVal, time);
        //     }
        //     this.isSelectRecipeModalVisible = true;
        // },
        closeSelectRecipeModal(selectedRecipe) {
            this.isSelectRecipeModalVisible = false;
            if (selectedRecipe) {
                this.selectRecipeModalEventInfo.recipeId = selectedRecipe;
                this.$store.dispatch('storeRecipeEvent', this.selectRecipeModalEventInfo);
            }
            //this.selectRecipeModalEventInfo = null;
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
        makeCurrentSelection() {
            return {start: this.day(this.selectedCells[0]), end: this.day(this.selectedCells[this.selectedCells.length-1])};
        },
        generatePDFClick() {
            generatePDF(this.makeCurrentSelection(), this.$store);
        },
        generateShoppingListClick() {
            const newShoppingList = generateShoppingList(/*{start: this.currentSelection.start, end: this.currentSelection.end}*/this.makeCurrentSelection(), this.$store);
            this.$store.dispatch('storeShoppingList', newShoppingList);
            this.$router.push(`/shopping-list/${newShoppingList.id}`);
        },
    }
});
</script>

<style scoped>
    .arow {
        display: flex;
        flex-direction: row;
    }
    .highlight {
        background-color: #ffff0052;
    }
    @media(max-width: 575px) {
        .container {
            margin: 0;
            padding:0;
        }
    }
</style>