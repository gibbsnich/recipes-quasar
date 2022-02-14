export const nextId = (arr) => {
    const nextId = arr.reduce((s, e) => e.id > s ? e.id : s, 0) + 1;
    return nextId ? nextId : 1;
}

export const makeIngredientsMap = (allIngredients) => {
    return allIngredients.reduce((memo, i) => {
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
}

export const splitIngredients = (ingredientText) => {
    return ingredientText.split("\n").filter(l => l.length > 0).map(l => { 
        const md = l.match(/^((([0-9]+)\s*)((g)|(ml)|(Bund)|(EL)|(Dose)|(Liter)|(St.ck)))/i);
        if (!!md) {
            return { amount: md[0], ingredient: l.substring(md[0].length, l.length).trim() };
        }
        const lineSplit = l.trim().split(/\s+/);
        if (lineSplit.length > 1) {
            return {amount: lineSplit[0], ingredient: lineSplit.splice(1, lineSplit.length-1).join(' ').trim()};
        } 
        return {amount: '', ingredient: l.trim()};  
    });
}
