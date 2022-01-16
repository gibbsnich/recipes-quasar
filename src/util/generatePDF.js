import { dateToString, dateStringToReadableString } from './date.js';
import { toRaw } from 'vue';
import jsPDF, { AcroFormCheckBox } from 'jspdf';

const MAX_PAGE_Y = 290;

const generateIngredientData = ({start, end}, store) => {
    const currentEvents = store.state.events.filter((e) => {
        if (!e.start) {
            return false;
        }
        const st = e.start.substring(0, e.start.length - 6);
        return st >= start && st <= end;
    }).map((e) => toRaw(e));
    //can contain multiple instances of the same recipe!
    const currentRecipes = currentEvents.filter((e) => !e.extendedProps.extra).map((e) => toRaw(store.state.recipes.filter((r) => r.id === e.extendedProps.recipeId)[0]));
    const allIngredientsPerRecipe = currentRecipes.map((r) => r.ingredients).flat(2);
    const extraEvents = currentEvents.filter((e) => e.extendedProps.extra).map((e) => e.extendedProps.ingredients);
    extraEvents.forEach((i) => i.forEach((ii) => allIngredientsPerRecipe.push(ii)));
    const allIngredients = allIngredientsPerRecipe.reduce((memo, i) => {
        if (memo[i.ingredient]) {
            if (i.amount && i.amount !== '') {
                if (memo[i.ingredient].amount) {
                    memo[i.ingredient].amount = `${memo[i.ingredient].amount} + ${i.amount}`;
                } else {
                    memo[i.ingredient].amount = `${i.amount}`;
                }
            }
        } else {
            memo[i.ingredient] = {store: i.storeId, category: i.categoryId};
            if (i.amount) {
                memo[i.ingredient].amount = i.amount;
            }
        }
        return memo;
    }, {});
    return { allIngredients, currentEvents, ingredientKeys: Object.keys(allIngredients).sort((a, b) => a < b ? -1 : (b < a ? 1 : 0)) };
};

const generateShoppingListInternal = ({ allIngredients, currentEvents, ingredientKeys }, store) => {
    const stores = store.getters.getSortedIngredientStores;
    const categories = store.getters.getSortedIngredientCategories;
    const shoppingList = {};
    shoppingList.stores = [];
    stores.forEach((store, idx) => {
        if (ingredientKeys.filter(ik => allIngredients[ik].store === store.id).length > 0) {
            const storeShoppingList = [];
            categories.forEach((category, idx) => {
                const filteredKeys = ingredientKeys.filter(ik => allIngredients[ik].store === store.id && allIngredients[ik].category === category.id);
                if (filteredKeys.length > 0) {
                    filteredKeys.sort((a, b) => a < b ? -1 : (b < a ? 1 : 0)).forEach((i, idx) => {
                        const text = allIngredients[i].amount && allIngredients[i].amount.length > 0 ? `${allIngredients[i].amount} ${i}` : i;
                        storeShoppingList.push({label: text, bought: false});
                    });
                }
            });
            shoppingList.stores.push({name: store.name, list: storeShoppingList});   
        }
    });
    return shoppingList;
};

export const generateShoppingList = ({start, end}, store) => {
    const startString = dateToString(start);
    const endString = dateToString(end);
    const shoppingList = generateShoppingListInternal(generateIngredientData({start: startString, end: endString}, store), store);
    shoppingList.start = dateStringToReadableString(startString);
    shoppingList.end = dateStringToReadableString(endString);
    return shoppingList;
};

export const generatePDF = ({start, end}, store) => {
    const { allIngredients, currentEvents, ingredientKeys } = generateIngredientData({start: dateToString(start), end: dateToString(end)}, store);
    const shoppingList = generateShoppingListInternal({ allIngredients, currentEvents, ingredientKeys }, store);
    const doc = new jsPDF();
    doc.setFontSize('16');
    doc.text('Einkaufsliste', 60, 10);
    doc.setFontSize('14');
    doc.text(`${dateStringToReadableString(dateToString(start))} – ${dateStringToReadableString(dateToString(end))}`, 110, 10);
    doc.setFontSize('12');
    let y = 20;
    
    shoppingList.stores.forEach((shoppingListEntry) => {
        doc.setFontSize('14');
        doc.text(shoppingListEntry.name, 30, y);
        doc.setFontSize('12');
        y += 8;
        shoppingListEntry.list.forEach((item) => {
            const checkbox = new AcroFormCheckBox();
            checkbox.appearanceState = 'Off';
            checkbox.fieldName = item.label;
            checkbox.Rect = [10, y-8, 10, 10];
            doc.addField(checkbox);
            doc.text(item.label, 20, y);
            y += 8;
        });
    });

    currentEvents.sort((a, b) => a.start < b.start ? -1 : (b.start < a.start ? 1 : 0)).forEach((e) => {
        const readableDate = dateStringToReadableString(e.start);
        const time = e.start.indexOf('T12:') !== -1 ? 'Mittagessen' : 'Abendessen';
        const currentRecipe = store.getters.getRecipeById(e.extendedProps.recipeId);
        if (currentRecipe) {
            doc.addPage();
            doc.setFontSize('14');
            doc.text(readableDate + ' ' + time, 40, 10);
            if (currentRecipe.serving.value !== '' && currentRecipe.serving.type !== '') {
                doc.text(`${currentRecipe.name} (${currentRecipe.serving.value} ${currentRecipe.serving.type})`, 10, 20);
            } else {
                doc.text(`${currentRecipe.name}`, 10, 20);
            }
            doc.setFontSize('11');
            doc.text(currentRecipe.url, 10, 30);
            doc.setFontSize('14');
            doc.text('Zutaten:', 10, 40);
            let y = 48;
            currentRecipe.ingredients.forEach((i, idx) => {
                if (y > MAX_PAGE_Y) {
                    y = 10;
                    doc.addPage();
                }
                if (i.amount) {
                    doc.text(i.amount + ' ' + i.ingredient, 15, y);
                } else {
                    doc.text(i.ingredient, 15, y);
                }
                y += 8;
            });
            y += 2;
            doc.setFontSize('14');
            doc.text('Zubereitung:', 10, y);
            y += 8;
            doc.setFontSize('12');
            const prepArr = doc.splitTextToSize(currentRecipe.preparation, 190);
            prepArr.forEach((pa) => {
                if (y > MAX_PAGE_Y) {
                    y = 10;
                    doc.addPage();
                }
                doc.text(pa, 10, y);
                y += 8;
            });
            
        }
    });
    doc.save(`Rezepte_${dateToString(start)}.pdf`);
};