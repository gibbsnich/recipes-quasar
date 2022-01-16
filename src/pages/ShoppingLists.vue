<template>
    <login-modal v-if="!$q.platform.is.electron && !$q.platform.is.capacitor" v-show="!this.$store.state.isAuthenticated && this.$store.state.isOnline && !this.$store.state.forceNoAuth" />
    <div :class="{blur_bg: !this.$store.state.isAuthenticated && this.$store.state.isOnline && !this.$store.state.forceNoAuth}">
        <settings-menu activeTab="shoppinglists">
            <div class="container">
                <h4>Einkaufslisten</h4>
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
                                <router-link :to="{ name: 'shopping-list', params: { shoppingListId: shoppingList.id }}">{{ shoppingList.start }} &ndash; {{ shoppingList.end }}</router-link>
                            </td>
                            <td>
                                <button type="button" class="btn btn-danger btn-sm" aria-label="Save" @click="deleteList(shoppingList.id)">
                                    <font-awesome-icon icon="minus-square" />
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <h6 v-else>Keine Einkaufslisten</h6>
            </div>
        </settings-menu>
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import SettingsMenu from '../components/SettingsMenu.vue';
import LoginModal from '../components/web/LoginModal.vue';

export default defineComponent({
  name: 'ingredients',
  components: {
    SettingsMenu,
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
  }
</style>