const routes = [
  { path: '/', component: () => import('pages/Home.vue') },
  { path: '/recipes', component: () => import('pages/Recipes.vue') },
  { path: '/ingredients', component: () => import('pages/Ingredients.vue') },
  { path: '/categories', component: () => import('pages/Categories.vue') },
]

export default routes
