<template>
    <login-modal v-if="!$q.platform.is.electron && !$q.platform.is.capacitor" v-show="!this.$store.state.isAuthenticated && this.$store.state.isOnline && !this.$store.state.forceNoAuth" />
    <div :class="{blur_bg: !this.$store.state.isAuthenticated && this.$store.state.isOnline && !this.$store.state.forceNoAuth}">
        <site-menu activeTab="shoppinglists">
            <div class="container">
                <h4>Einkaufslisten</h4>

                <button type="button" class="btn btn-link" style="margin-bottom:1rem">
                    <font-awesome-icon icon="meteor" />
                    <router-link :to="{ name: 'auto-shopping-list' }">Auto-Einkaufsliste</router-link>
                </button>

                <table class="table" v-if="this.$store.getters.getShoppingLists.length > 0">
                    <thead>
                        <tr>
                            <th scope="col">Datum</th>
                            <th scope="col">&nbsp;</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="shoppingList in this.$store.getters.getShoppingLists" v-bind:key="shoppingList.id">
                            <td>
                                <router-link :to="{ name: 'shopping-list', params: { shoppingListId: shoppingList.id }}">
                                    <span v-if="shoppingList.title">{{ shoppingList.title }}&nbsp;(</span>{{ shoppingList.start }} &ndash; {{ shoppingList.end }}<span v-if="shoppingList.title">)</span>
                                </router-link>
                            </td>
                            <td>
                                <button type="button" class="btn btn-danger btn-sm" aria-label="Save" @click="deleteList(shoppingList.id)">
                                    <font-awesome-icon icon="trash" />
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <h6 v-else>Keine Einkaufslisten</h6>
            </div>
        </site-menu>
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import SiteMenu from '../components/SiteMenu.vue';
import LoginModal from '../components/web/LoginModal.vue';

export default defineComponent({
  name: 'ingredients',
  components: {
    SiteMenu,
    LoginModal,
  },
  methods: {
      getShoppingLists() {
        return this.$store.getters.getSortedIngredients
      },
      deleteList(shoppingListId) {
          this.$store.dispatch('deleteShoppingList', shoppingListId);
      },
  },
});
</script>

<style scoped>
  h6 {
    margin-left: 1rem;
  }
  a {
      margin-left: 1rem;
      color: #0d6efd;
      text-decoration: none;
  }
  .btn-link {
      text-decoration: none;
  }
</style>