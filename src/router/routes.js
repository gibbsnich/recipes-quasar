const routes = [
  { path: '/', component: () => import('pages/Home.vue') },
  { path: '/recipes', component: () => import('pages/Recipes.vue') },
  { path: '/ingredients', component: () => import('pages/Ingredients.vue') },
  { path: '/categories', component: () => import('pages/Categories.vue') },
  { path: '/shoppinglists', component: () => import('pages/ShoppingLists.vue') },
  { path: '/shopping-list/:shoppingListId', component: () => import('pages/ShoppingListPage.vue'), props: true, name: 'shopping-list' },
]

export default routes
