import { dateToString, dateStringToReadableString } from './date.js';
import { makeIngredientsMap } from './entity.js';
import jsPDF, { AcroFormCheckBox } from 'jspdf';

const MAX_PAGE_Y = 290;

export const addToAutoShoppingList = (store, autoIngredientList, ingredient) => {
    const key = `${ingredient.ingredient}`;
    const shoppingList = store.getters.getShoppingListData({ allIngredients: makeIngredientsMap([ingredient]), ingredientKeys: [ingredient.ingredient] }, autoIngredientList);
    shoppingList.id = 'auto';
    store.dispatch('storeShoppingList', shoppingList);
    return shoppingList;
};

export const generateShoppingList = ({start, end}, store) => {
    const startString = dateToString(start);
    const endString = dateToString(end);
    const shoppingList = store.getters.getShoppingListData(store.getters.getIngredientData({start: startString, end: endString}));
    shoppingList.start = dateStringToReadableString(startString);
    shoppingList.end = dateStringToReadableString(endString);
    return shoppingList;
};

export const generatePDF = ({start, end}, store) => {
    const { allIngredients, currentEvents, ingredientKeys } = store.getters.getIngredientData({start: dateToString(start), end: dateToString(end)});
    const shoppingList = store.getters.getShoppingListData({ allIngredients, currentEvents, ingredientKeys });
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