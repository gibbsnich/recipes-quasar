<template>
    <div :class="{blur_bg: (!this.$store.state.isAuthenticated && this.$store.state.isOnline && !this.$store.state.forceNoAuth) || isSelectRecipeModalVisible || isRandomIngredientsModalVisible || isIngredientWithoutCategoryModalVisible}">
        <site-menu activeTab="">
            <template v-slot:items>
                <li class="nav-item dropdown">
                    <a :class="['nav-link', 'dropdown-toggle', {show: this.showCreateDropDown, disabled: selectedCells.length === 0}]"
                        href="javascript:void(0)" @click="this.showCreateDropDown = !this.showCreateDropDown" role="button">
                        <font-awesome-icon icon="cart-plus" />&nbsp;Erzeugen
                    </a>
                    <ul :class="['dropdown-menu', {show: this.showCreateDropDown}]" ref="dropDown">
                        <li>
                            <a class="dropdown-item" href="javascript:void(0)" @click="generateShoppingListClick()">Einkaufsliste</a>
                        </li>
                        <li>
                            <a class="dropdown-item" href="javascript:void(0)" @click="generatePDFClick()">PDF</a>
                        </li>
                    </ul>
                </li>
            </template>
            <div class="calendar-container">
                <div class="calendar-controls">
                    <button type="button" class="btn btn-outline-primary" @click="gotoPreviousMonth()">
                        <font-awesome-icon icon="caret-square-left" />
                    </button>
                    <span class="calendar-title">{{ this.monthTitle(this.baseDate) }}</span>
                    <button type="button" class="btn btn-outline-primary" @click="gotoNextMonth()">
                        <font-awesome-icon icon="caret-square-right" />
                    </button>
                </div>
                <div class="arow" v-for="index in weekNum" :key="index">
                    <span class="kw-cell">
                        {{ weekOfYear(day(dayNums(index)[0])) }}
                    </span>
                    <calendar-cell v-for="j in dayNums(index)" :key="j" :akey="j" :date="day(j)" 
                        :class="[{'highlight': isSelected(j)}]"
                        @clickedMidday="clickedMidday" @clickedEvening="clickedEvening" @clickedAdditional="clickedAdditional"
                        @mousedown="mousedown(j)" @mouseup="mouseup(j)" @mouseover="mouseover(j)"
                        @touchstart="mousedown(j)" @touchend="mouseup(j)" @touchmove="touchmove($event)" />
                </div>
            </div>    
        </site-menu>
    </div>
    <login-modal v-if="!$q.platform.is.electron && !$q.platform.is.capacitor" v-show="!this.$store.state.isAuthenticated && this.$store.state.isOnline && !this.$store.state.forceNoAuth" />
    <select-recipe-modal :key="selectRecipeKey" v-show="isSelectRecipeModalVisible" @close="closeSelectRecipeModal" v-bind:event="selectRecipeModalEventInfo" />
    <random-ingredients-modal :key="randomIngredientKey" v-show="isRandomIngredientsModalVisible" @close="closeRandomIngredientsModal" v-bind:date="randomIngredientsDate" />
    <ingredient-without-category-modal v-show="isIngredientWithoutCategoryModalVisible" @close="closeIngredientsWithoutCategoryModal" v-bind:ingredient="ingredientWithoutCategory" />
</template>

<script>
import { defineComponent } from 'vue';
import SelectRecipeModal from '../SelectRecipeModal.vue';
import RandomIngredientsModal from '../RandomIngredientsModal.vue';
import { UnknownIngredientsMixin } from '../UnknownIngredientsMixin.js';
import IngredientWithoutCategoryModal from '../IngredientWithoutCategoryModal.vue';
import LoginModal from '../web/LoginModal.vue';
import SiteMenu from '../SiteMenu.vue';
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
        SiteMenu,
        CalendarCell,
    },
    mixins: [UnknownIngredientsMixin],
    data() {
        return {
            firstDay: null,
            baseDate: null,
            isMouseDown: false,
            lastSelectedCell: null,
            selectedCells: [],
            clickTimeout: null,
            showCreateDropDown: false,
            weekNum: 6,
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
        const lastDate = this.$store.getters.getLastSelectedCalendarDate;
        this.baseDate = lastDate ? lastDate : new Date();
        this.firstDay = this.computeFirstDay(this.baseDate, true);
        document.addEventListener('mousedown', this.checkToggleDropDown);
        document.addEventListener('touchstart', this.checkToggleDropDown);
    },
    beforeUnmount() {
        this.$store.commit('updateLastSelectedCalendarDate', this.baseDate);
        document.removeEventListener('mousedown', this.checkToggleDropDown);
        document.removeEventListener('touchstart', this.checkToggleDropDown);
    },
    methods: {
        checkToggleDropDown(event) {
            if (!this.$refs.dropDown.contains(event.target)) {
                this.showCreateDropDown = false;
            }
        },
        weekOfYear(date) {
            var oneJan = new Date(date.getFullYear(),0,1);
            var numberOfDays = Math.floor((date - oneJan) / (24 * 60 * 60 * 1000));
            var result = Math.ceil((date.getDay() + 1 + numberOfDays) / 7);
            return result;
        },
        monthTitle(date){
            return new Intl.DateTimeFormat('de-DE', { year: 'numeric', month: 'long' }).format(
                this.computeFirstDay(date)
            );
        },
        gotoPreviousMonth() {
            this.selectedCells = [];
            this.baseDate.setMonth(this.baseDate.getMonth() - 1);
            this.firstDay = this.computeFirstDay(this.baseDate, true);
        },
        gotoNextMonth() {
            this.selectedCells = [];
            this.baseDate.setMonth(this.baseDate.getMonth() + 1);
            this.firstDay = this.computeFirstDay(this.baseDate, true);
        },
        computeFirstDay(date, withPreviousWeek) {
            while (date.getDate() !== 1) {
                date = new Date(date.setDate(date.getDate() - 1));
            }
            if (withPreviousWeek)
            while (date.getDay() !== 1) {
                date = new Date(date.setDate(date.getDate() - 1));
            }
            return date;
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
            if (this.selectedCells.indexOf(dayVal) === -1) {
                this.selectedCells = [];
                this.isMouseDown = true;
                this.lastSelectedCell = null;
                this.clickTimeout = setTimeout(() => {
                    if (this.isMouseDown) {
                        if (this.lastSelectedCell) {
                            if (this.selectedCells.indexOf(dayVal) === -1 || this.selectedCells.indexOf(this.lastSelectedCell) === -1) {
                                if (this.day(dayVal) < this.day(this.lastSelectedCell)) {
                                    this.selectedCells = [];
                                    for (let n = dayVal; n <= this.lastSelectedCell; n++) {
                                        this.selectedCells.push(n);
                                    }
                                } else {
                                    this.selectedCells = [];
                                    for (let n = this.lastSelectedCell; n <= dayVal; n++) {
                                        this.selectedCells.push(n);
                                    }
                                }
                            }
                        } else {
                            this.selectedCells = [dayVal];
                        }
                    }
                }, 250);
            } else {
                this.isMouseDown = true;
                this.lastSelectedCell = null;
            }
        },
        mouseup(dayVal) {
            this.isMouseDown = false;
            if (this.clickTimeout) {
                clearTimeout(this.clickTimeout);
                this.clickTimeout = null;
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
                        if (this.lastSelectedCell) {
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
                }
                this.lastSelectedCell = dayVal;
            }
        },
        isSelected(dayVal) {
            return this.selectedCells.indexOf(dayVal) !== -1;
        },
        clickedMidday(event) {
            this.showSelectRecipeModalFromEvent(event);
        },
        clickedEvening(event) {
            this.showSelectRecipeModalFromEvent(event);
        },
        clickedAdditional(date) {
            this.randomIngredientsDate = dateToString(date);
            this.isRandomIngredientsModalVisible = true;
        },
        showSelectRecipeModalFromEvent(event) {
            this.selectRecipeKey += 1;
            this.selectRecipeModalEventInfo = event;
            this.isSelectRecipeModalVisible = true;
        },
        closeSelectRecipeModal(selectedRecipe) {
            this.isSelectRecipeModalVisible = false;
            if (selectedRecipe) {
                this.selectRecipeModalEventInfo.recipeId = selectedRecipe;
                this.$store.dispatch('storeRecipeEvent', this.selectRecipeModalEventInfo);
            }
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
            const newShoppingList = generateShoppingList(this.makeCurrentSelection(), this.$store);
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
            padding: 0;
        }
    }
    .calendar-container {
        margin-left: auto;
        margin-right: auto;
        max-width: 1440px;
    }
    .calendar-controls {
        text-align: center;
        margin-bottom: .5rem;
    }
    .calendar-title {
        display: inline-block;
        width: 9rem;
        margin-right: 2rem;
        margin-left: 2rem;
    }
    .kw-cell {
        padding-top: 2rem;
        padding-right: .3rem;
        padding-left: .2rem;
        font-weight: 700;
        font-size: .8rem;
        color: #555;
        background-color: #ddd;
        width: 1.2rem;
    }
</style>