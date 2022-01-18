import { store } from 'quasar/wrappers'
import { createStore } from 'vuex'

import { dateToTimeString } from '../util/date.js'
import { recurEventToEvent } from '../util/event.js'
import { nextId } from '../util/entity.js'

// import example from './module-example'

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

const toCamelCase = (entity) => 
    entity.replace(/_([a-z])/g, word => word.substring(1,2).toUpperCase());

const saveAndCheckNetwork = async (entities, commit, state) => {
    if (!navigator.onLine) {
        commit('online', false);
        entities.forEach(e => commit('dirty', e));
        localStorage.setItem('dirty', JSON.stringify(state.dirtyValues));
        commit('authenticated', false);
    } else {
        commit('online', true);
        try {
            entities.forEach(async e => await window.recipeApi.writeJSON(e, JSON.stringify(state[toCamelCase(e)])));
        } catch (e) {
            entities.forEach(e => commit('dirty', e));
            localStorage.setItem('dirty', JSON.stringify(state.dirtyValues));
            commit('authenticated', false);
        }
    }
}

export default store(function (/* { ssrContext } */) {
  const Store = createStore({
    state () {
      return {
          events: [],
          recipes: [],
          recipeCategories: [],
          ingredientCategories: [],
          ingredientStores: [],
          ingredients: [],
          shoppingLists: [],
          isInitialized: false,
          isAuthenticated: true,
          isOnline: true,
          dirtyValues: [],
          forceNoAuth: false,
          lastSelectedCalendarDate: null,
      }
  },
  getters: {
      getLastSelectedCalendarDate (state) {
          return state.lastSelectedCalendarDate;
      },
      isAuthenticated (state) {
          return state.isAuthenticated;
      },
      getIngredientById: (state) => (ingredientId) => {
          return state.ingredients.find(i => i.id === ingredientId);
      },
      getIngredientByIngredient: (state) => (ingredientValue) => {
          return state.ingredients.find(i => i.ingredient === ingredientValue);
      },
      getSortedIngredients (state) {
          return state.ingredients.sort((a, b) => a.ingredient.toLowerCase() < b.ingredient.toLowerCase() ? -1 : (b.ingredient.toLowerCase() < a.ingredient.toLowerCase() ? 1 : 0));
      },
      getSortedIngredientsByCategory: (state) => (categoryId) => {
          return state.ingredients.filter(i => i.categoryId === categoryId).sort((a, b) => a.ingredient.toLowerCase() < b.ingredient.toLowerCase() ? -1 : (b.ingredient.toLowerCase() < a.ingredient.toLowerCase() ? 1 : 0));
      },
      getIngredientCategoriesByName: (state) => (categoryName) => {
          return state.ingredientCategories.filter(ic => ic.name === categoryName);
      },
      getSortedIngredientCategories (state) {
          return state.ingredientCategories.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : (b.name.toLowerCase() < a.name.toLowerCase() ? 1 : 0));
      },
      getIngredientStoresByName: (state) => (storeName) => {
          return state.ingredientStores.filter(is => is.name === storeName);
      },
      getSortedIngredientStores (state) {
          return state.ingredientStores.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : (b.name.toLowerCase() < a.name.toLowerCase() ? 1 : 0));
      },
      getEventByStart: (state) => (eventStart) => {
          return state.events.find(event => event.start === eventStart);
      },
      getIngredientEventByStart: (state) => (ingredientEventStart) => {
          return state.events.find(event => event.extendedProps.extra && event.start === ingredientEventStart);
      },
      getIngredientsBySubstring: (state) => (subString) => {
          const subStringLower = subString.toLowerCase();
          return state.ingredients.filter(i => i.ingredient.toLowerCase().indexOf(subStringLower) > -1);
      },
      getRecipeById: (state) => (recipeId) => {
          return state.recipes.find(recipe => recipe.id === recipeId);
      },
      getRecipeByUrl: (state) => (recipeUrl) => {
          return state.recipes.find(recipe => recipe.url === recipeUrl);
      },
      getSortedRecipes: (state) => (recipeCategoryId) => {
          return state.recipes.filter(r => r.recipeCategories.includes(recipeCategoryId)).sort((a, b) => a.ingredient.toLowerCase() < b.ingredient.toLowerCase() ? -1 : (b.ingredient.toLowerCase() < a.ingredient.toLowerCase() ? 1 : 0));
      },
      getSortedRecipesWithoutCategory (state) {
          return state.recipes.filter(r => r.recipeCategories.length === 0).sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : (b.name.toLowerCase() < a.name.toLowerCase() ? 1 : 0));
      },
      getSortedRecipeCategories (state) {
          return state.recipeCategories.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : (b.name.toLowerCase() < a.name.toLowerCase() ? 1 : 0));
      },
      getRecipeCategoryByName: (state) => (recipeCategoryName) => {
          return state.recipeCategories.find(recipeCategory => recipeCategory.name === recipeCategoryName);
      },
      getShoppingLists (state) {
          return state.shoppingLists.sort((a, b) => a.id < b.id ? -1 : (b.id < a.id ? 1 : 0));
      },
      getShoppingList: (state) => (shoppingListId) => {
          return state.shoppingLists.find(shoppingList => shoppingList.id === shoppingListId);
      },
  },
  mutations: {
      initStore(state, data) {
          state.recipes = data.recipes || [];
          state.recipeCategories = data.recipeCategories || [];
          state.events = data.events || [];
          
          // cleanup data generated with older versions..
          if (data.ingredients) {
              data.ingredients.forEach(i => delete i.amount);

              const vals = data.ingredients.reduce((s, i, idx) => {
                  const variant = i.ingredient.trim();
                  if (s[i.ingredient]) { 
                      s[i.ingredient].indices.push(idx);
                  } else if (s[variant]) {
                      if (s[variant].variants.indexOf(i.ingredient) === -1) {
                          s[variant].variants.push(i.ingredient);
                      } 
                      s[variant].indices.push(idx);
                  } else { 
                      s[i.ingredient] = {
                          indices: [idx],
                          variants: [i.ingredient],
                          bestVariant: {
                              name: variant,
                              index: idx,
                          },
                      };
                      i.ingredient = variant;
                  }
                  return s;
              }, {});
              const dupKeys = Object.keys(vals).filter(k => vals[k].indices.length > 1);

              dupKeys.forEach(dk => {
                  const dv = vals[dk];
                  data.recipes.forEach(r => {
                      r.ingredients.forEach(ri => {
                          if (dv.variants.indexOf(ri.ingredient) !== -1) {
                              const replaceBy = data.ingredients[dv.bestVariant.index];
                              ri.ingredient = replaceBy.ingredient;
                              ri.id = replaceBy.id;
                              ri.categoryId = replaceBy.categoryId;
                              ri.storeId = replaceBy.storeId;
                          }
                      });
                  });
              });
              const delIndices = dupKeys.map(dk => { 
                  vals[dk].indices.splice(0,1); 
                  return vals[dk].indices; 
              }).flat().sort((a, b) => a < b ? -1 : (b < a ? 1 : 0));
              for (let n = delIndices.length - 1; n >= 0; n--) {
                  const a = data.ingredients.splice(delIndices[n], 1);
                //   console.log(`deleted: ${a[0].ingredient}`);
              }
          }
          
          state.ingredients = data.ingredients || [];
          state.ingredientCategories = data.ingredientCategories || [];
          state.ingredientStores = data.ingredientStores || [];
          state.shoppingLists = data.shoppingLists || [];
      },
      updateLastSelectedCalendarDate(state, date) {
          state.lastSelectedCalendarDate = date;
      },
      storeRecipe(state, recipe) {
          if (!recipe.id) {
              const nextRecipeId = nextId(state.recipes);
              recipe.id = nextRecipeId;
              state.recipes.push(recipe);
          } else {
              const recipeIndex = state.recipes.findIndex(r => r.id === recipe.id);
              state.recipes[recipeIndex] = recipe;
          }
      },
      deleteRecipe(state, recipe) {
          const recipeIndex = state.recipes.findIndex(r => r.id === recipe.id);
          state.recipes.splice(recipeIndex, 1);
          let idx;
          do {
              idx = state.events.findIndex(e => e.extendedProps.recipeId === recipe.id);
              if (idx !== -1) {
                  state.events.splice(idx, 1);
              }
          } while (idx !== -1);
      },
      updateRecipes(state, ingredient) {
          state.recipes.forEach(r => {
              r.ingredients.forEach((ri, index) => {
                  if (ri.id === ingredient.id) {
                      r.ingredients[index] = ingredient;
                  }
              });
          });
      },
      storeRecipeCategory(state, recipeCategoryName) {
          const newRecipeCategoryId = nextId(state.recipeCategories);
          state.recipeCategories.push({name: recipeCategoryName, id: newRecipeCategoryId});
      },
      updateRecipeCategory(state, {id, name}) {
          state.recipeCategories.find(rc => rc.id === id).name = name;
      },
      deleteRecipeCategory(state, recipeCategoryId) {
          debugger;
          const recipeCategoryIndex = state.recipeCategories.findIndex(rc => rc.id === recipeCategoryId);
          state.recipeCategories.splice(recipeCategoryIndex, 1);
          state.recipes.forEach(r => {
              const rIndex = r.recipeCategories.findIndex(rc => rc === recipeCategoryId);
              if (rIndex !== -1) {
                  r.recipeCategories.splice(rIndex, 1);
              }
          });
      },
      storeIngredient(state, { ingredientWithoutCategory, ingredientCategoryId, ingredientStoreId }) {
          if (!ingredientWithoutCategory.id) {
              const newIngredientId = nextId(state.ingredients);
              ingredientWithoutCategory.id = newIngredientId;
              ingredientWithoutCategory.categoryId = ingredientCategoryId;
              ingredientWithoutCategory.storeId = ingredientStoreId;
              delete ingredientWithoutCategory.amount;
              state.ingredients.push(ingredientWithoutCategory);
          }
      },
      updateIngredient(state, ingredient) {
          const ingredientIndex = state.ingredients.findIndex(i => i.id === ingredient.id);
          state.ingredients[ingredientIndex] = ingredient;
      },
      storeIngredientCategory(state, ingredientCategoryName) {
          const newIngredientCategoryId = nextId(state.ingredientCategories);
          state.ingredientCategories.push({name: ingredientCategoryName, id: newIngredientCategoryId});
      },
      updateIngredientCategory(state, {id, name}) {
          state.ingredientCategories.find(ic => ic.id === id).name = name;
      },
      storeIngredientStore(state, ingredientStoreName) {
          const newIngredientStoreId = nextId(state.ingredientStores);
          state.ingredientStores.push({name: ingredientStoreName, id: newIngredientStoreId});
      },
      updateIngredientStore(state, {id, name}) {
          state.ingredientStores.find(is => is.id === id).name = name;
      },
      storeEvent(state, event) {
          const ingredientsEvent = state.events.find(e => e.extendedProps.extra && e.start === event.start);
          if (ingredientsEvent) {
              ingredientsEvent.extendedProps.ingredients = event.extendedProps.ingredients;
          } else {
              state.events.push(event);
          }
      },
      storeRecipeEvent(state, event) {
          const recipe = state.recipes.find((r) => r.id === event.recipeId);
          if (!recipe)
              return;
          const { eventStart, eventEnd } = event.extendedProps.recur ? 
              recurEventToEvent(event) : {eventStart: event.start, eventEnd: null};
          
          const startISO = eventStart ? eventStart : dateToTimeString(event.start);
          const selEvent = state.events.find((evt) => evt.start === startISO);
          if (!selEvent) {
              event.title = recipe.name;
              event.start = eventStart;
              event.extendedProps.recipeId = recipe.id;
              event.extendedProps.recur = false;
              state.events.push(event);
              //state.events.push({title: recipe.name, start: eventStart, end: eventEnd, color: 'red', extendedProps: {recipeId: recipe.id}});
          } else {
              selEvent.title = recipe.name;
              selEvent.extendedProps.recipeId = recipe.id;
          }
      },
      updateRecipeEvents(state, ingredient) {
          state.events.forEach(e => {
              if (e.extendedProps.extra) {
                  e.extendedProps.ingredients.forEach((i, index) => {
                      if (i.id === ingredient.id) {
                          e.extendedProps.ingredients[index] = ingredient;
                      }
                  });
              }
          });
      },
      storeShoppingList(state, shoppingList) {
          const newShoppingListId = nextId(state.shoppingLists);
          shoppingList.id = newShoppingListId;
          state.shoppingLists.push(shoppingList);
      },
      deleteShoppingList(state, shoppingListId) {
        const listIndex = state.shoppingLists.findIndex(l => l.id === shoppingListId.id);
        state.shoppingLists.splice(listIndex, 1);
      },
      toggleShoppingListItem(state, { listId, storeIndex, itemIndex, checked }) {
          state.shoppingLists.find(l => l.id === listId).stores[storeIndex].list[itemIndex].bought = checked;
      },
      saveShoppingListName(state, { listId, name }) {
          state.shoppingLists.find(l => l.id = listId).title = name;
      },
      authenticated(state, isAuth) {
          state.isAuthenticated = isAuth;
      },
      initialized(state, isInit) {
          state.isInitialized = isInit;
      },
      online(state, isOnline) {
          state.isOnline = isOnline;
      },
      forceNoAuth(state, forceNoAuthFlag) {
          state.forceNoAuth = forceNoAuthFlag;
      },
      dirty(state, entityType) {
          if (state.dirtyValues.indexOf(entityType) === -1) {
            state.dirtyValues.push(entityType);
          }
      },
      clean(state, entityType) {
        const idx = state.dirtyValues.indexOf(entityType);
        if (idx !== -1) {
            state.dirtyValues.splice(idx, 1);
        }
      },
  },
  actions: {
      async loadInitialData({ commit, state }) {
          if (!state.isInitialized) {
            try {
                commit('initStore', {
                    recipes: await window.recipeApi.readJSON('recipes'),
                    recipeCategories: await window.recipeApi.readJSON('recipe_categories'),
                    events: await window.recipeApi.readJSON('events'),
                    ingredients: await window.recipeApi.readJSON('ingredients'),
                    ingredientCategories: await window.recipeApi.readJSON('ingredient_categories'),
                    ingredientStores: await window.recipeApi.readJSON('ingredient_stores'),
                    shoppingLists: await window.recipeApi.readJSON('shopping_lists'),
                });
                commit('online', navigator.onLine);
                commit('authenticated', true);
                commit('initialized', true);
            } catch(e) {
                commit('authenticated', false);
            }
        } else {
            if (state.isAuthenticated) {
                state.dirtyValues.forEach(async (dirtyEntity) => {
                    try {
                        const dirtyCamelCase = toCamelCase(dirtyEntity);
                        await window.recipeApi.writeJSON(dirtyEntity, JSON.stringify(state[dirtyCamelCase]));
                        commit('clean', dirtyEntity);
                    } catch (e) {
                        commit('authenticated', false);
                    }
                });
            }
        }
      },
      async storeRecipeEvent({ commit, state }, event) {
          commit('storeRecipeEvent', event);
          saveAndCheckNetwork(['events'], commit, state);
      },
      async storeEvent({ commit, state }, event) {
          commit('storeEvent', event);
          saveAndCheckNetwork(['events'], commit, state);
      },
      async storeRecipe({ commit, state }, recipe) {
          commit('storeRecipe', recipe);
          saveAndCheckNetwork(['recipes'], commit, state);
      },
      async deleteRecipe({ commit, state}, recipe) {
          commit('deleteRecipe', recipe);
          saveAndCheckNetwork(['recipes', 'events'], commit, state);
      },
      async changeRecipeOrder({ commit, state }, { changeId, beforeId }) {
          commit('changeRecipeOrder', { changeId, beforeId });
          saveAndCheckNetwork(['recipes'], commit, state);
      },
      async storeRecipeCategory({ commit, state }, recipeCategoryName) {
          commit('storeRecipeCategory', recipeCategoryName);
          saveAndCheckNetwork(['recipe_categories'], commit, state);
      },
      async updateRecipeCategory({ commit, state}, recipeCategoryData) {
          commit('updateRecipeCategory', recipeCategoryData);
          saveAndCheckNetwork(['recipe_categories'], commit, state);
      },
      async deleteRecipeCategory({ commit, state }, recipeCategoryId) {
          commit('deleteRecipeCategory', recipeCategoryId);
          saveAndCheckNetwork(['recipe_categories', 'recipes'], commit, state);
      },
      async storeIngredient({ commit, state }, { ingredientWithoutCategory, ingredientCategoryId, ingredientStoreId }) {
          commit('storeIngredient', { ingredientWithoutCategory, ingredientCategoryId, ingredientStoreId });
          saveAndCheckNetwork(['ingredients'], commit, state);
      },
      async updateIngredient({ commit, state }, ingredient) {
        commit('updateIngredient', ingredient);
        commit('updateRecipes', ingredient);
        commit('updateRecipeEvents', ingredient);
        saveAndCheckNetwork(['ingredients', 'recipes', 'events'], commit, state);
      },
      async storeIngredientCategory({ commit, state }, ingredientCategoryName) {
          commit('storeIngredientCategory', ingredientCategoryName);
          saveAndCheckNetwork(['ingredient_categories'], commit, state);
      },
      async updateIngredientCategory({ commit, state}, ingredientCategoryData) {
          commit('updateIngredientCategory', ingredientCategoryData);
          saveAndCheckNetwork(['ingredient_categories'], commit, state);
      },
      async storeIngredientStore({ commit, state }, ingredientStoreName) {
          commit('storeIngredientStore', ingredientStoreName);
          saveAndCheckNetwork(['ingredient_stores'], commit, state);
      },
      async updateIngredientStore({ commit, state }, ingredientStoreData) {
          commit('updateIngredientStore', ingredientStoreData);
          saveAndCheckNetwork(['ingredient_stores'], commit, state);
      },
      async updateRecipeCategory({ commit, state}, ingredientStoreData) {
          commit('updateRecipeCategory', ingredientStoreData);
          saveAndCheckNetwork(['ingredient_stores'], commit, state);
      },
      async storeShoppingList({ commit, state }, shoppingList) {
          commit('storeShoppingList', shoppingList);
          saveAndCheckNetwork(['shopping_lists'], commit, state);
      },
      async deleteShoppingList({ commit, state }, shoppingListId) {
          commit('deleteShoppingList', shoppingListId);
          saveAndCheckNetwork(['shopping_lists'], commit, state);
      },
      async toggleShoppingListItem({ commit, state }, { listId, storeIndex, itemIndex, checked }) {
          commit('toggleShoppingListItem', { listId, storeIndex, itemIndex, checked });
          saveAndCheckNetwork(['shopping_lists'], commit, state);
      },
      async saveShoppingListName({ commit, state }, { listId, name }) {
          commit('saveShoppingListName', { listId, name });
          saveAndCheckNetwork(['shopping_lists'], commit, state);
      },
    },
    /*
    modules: {
      // example
    },
    */
    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: false,// process.env.DEBUGGING,
  });
  return Store
});