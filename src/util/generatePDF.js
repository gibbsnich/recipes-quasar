import { dateToString, dateStringToReadableString } from './date.js';
import { toRaw } from 'vue';
import jsPDF, { AcroFormCheckBox } from 'jspdf';

const MAX_PAGE_Y = 290;

export const generatePDF = ({start, end}, store) => {
    const doc = new jsPDF();

    const   startStr = dateToString(start),
            endStr = dateToString(end);

    const currentEvents = store.state.events.filter((e) => e.start && e.start >= startStr && e.start <= endStr).map((e) => toRaw(e));
    //can contain multiple instances of the same recipe!
    const currentRecipes = currentEvents.filter((e) => !e.extendedProps.extra).map((e) => toRaw(store.state.recipes.filter((r) => r.id === e.extendedProps.recipeId)[0]));

    const allIngredientsPerRecipe = currentRecipes.map((r) => r.ingredients).flat(2);
    const extraEvents = currentEvents.filter((e) => e.extendedProps.extra).map((e) => e.extendedProps.ingredients);
    extraEvents.forEach((i) => i.forEach((ii) => allIngredientsPerRecipe.push(ii)));
    const allIngredients = allIngredientsPerRecipe.reduce((memo, i) => {
        if (memo[i.ingredient]) {
            memo[i.ingredient].amount = `${memo[i.ingredient].amount} + ${i.amount}`;
        } else {
            memo[i.ingredient] = {amount: i.amount, store: i.storeId, category: i.categoryId};
        }
        return memo;
    }, {});

    doc.setFontSize('16');
    doc.text('Einkaufsliste', 60, 10);
    doc.setFontSize('12');
    const ingredientKeys = Object.keys(allIngredients).sort((a, b) => a < b ? -1 : (b < a ? 1 : 0));
    let y = 20;
    const stores = store.getters.getSortedIngredientStores;
    const categories = store.getters.getSortedIngredientCategories;
    stores.forEach((store, idx) => {
        if (ingredientKeys.filter(ik => allIngredients[ik].store === store.id).length > 0) {
            doc.setFontSize('14');
            doc.text(store.name, 30, y);
            doc.setFontSize('12');
            y += 8;
        }
        categories.forEach((category, idx) => {
            const filteredKeys = ingredientKeys.filter(ik => allIngredients[ik].store === store.id && allIngredients[ik].category === category.id);
            if (filteredKeys.length > 0) {
                //doc.text(category.name, 25, y);
                //y += 8;
                filteredKeys.sort((a, b) => a < b ? -1 : (b < a ? 1 : 0)).forEach((i, idx) => {
                    if (y > MAX_PAGE_Y) {
                        y = 10;
                        doc.addPage();
                    }
                    const text = allIngredients[i].amount.length > 0 ? `${allIngredients[i].amount} ${i}` : i;
                    const checkbox = new AcroFormCheckBox();
                    checkbox.appearanceState = 'Off';
                    checkbox.fieldName = text;
                    checkbox.Rect = [10, y-8, 10, 10];
                    doc.addField(checkbox);
                    doc.text(text, 20, y);
                    y += 8;
                });
            }   
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
            doc.text(`${currentRecipe.name} (${currentRecipe.serving.value} ${currentRecipe.serving.type})`, 10, 20);
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
                doc.text(i.amount + ' ' + i.ingredient, 15, y);
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
    doc.save(`Rezepte_${startStr}.pdf`);
};
