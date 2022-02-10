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