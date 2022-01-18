<template>
    <login-modal v-if="!$q.platform.is.electron && !$q.platform.is.capacitor" v-show="!this.$store.state.isAuthenticated && this.$store.state.isOnline && !this.$store.state.forceNoAuth" />
    <div :class="{blur_bg: !this.$store.state.isAuthenticated && this.$store.state.isOnline && !this.$store.state.forceNoAuth}">
        <site-menu>
            <div v-if="this.shoppingList">
                <div class="row" style="width:90%; margin-bottom: .5rem;">
                    <div class="col-xs-10">
                        <input style="margin-left: 2rem;" type="text" class="form-control" v-model.trim="shoppingListName" />
                    </div>
                    <div class="col-xs-2">
                        <button style="margin-left: 2rem;margin-top: .2rem" type="button" class="btn btn-success btn-sm" aria-label="Save Title"
                            :disabled="(!this.shoppingList.title && shoppingListName === 'Einkaufsliste') || shoppingListName === this.shoppingList.title" @click="saveShoppingListName">
                            <font-awesome-icon icon="save" />
                        </button>
                    </div>
                </div>
                <h6>{{ this.shoppingList.start }} &ndash; {{ this.shoppingList.end }}</h6>
                <div v-for="(store, storeIndex) in this.shoppingList.stores" :key="store">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-subtitle mb-2 text-muted">{{ store.name }}</h5>
                            <ul class="list-group">
                                <li class="list-group-item"  v-for="(item, itemIndex) in store.list" :key="itemIndex">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" :id="item.label" :checked="item.bought" @change="this.saveState($event, this.shoppingList.id, storeIndex, itemIndex)">
                                        <label class="form-check-label" :for="item.label" :class="{strike: item.bought}">{{ item.label }}</label>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <button type="button" class="delete-button btn btn-outline-danger" @click="deleteList">
                    <font-awesome-icon icon="trash" />&nbsp;Einkaufsliste löschen
                </button>
            </div>
            <div v-else>
                <h4>Keine Einkaufsliste gefunden..</h4>
            </div>
        </site-menu>
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import LoginModal from '../components/web/LoginModal.vue';
import SiteMenu from '../components/SiteMenu.vue';

export default defineComponent({
    name: 'ShoppingList',
    components: {
        SiteMenu,
        LoginModal,
    },
    props: {
        shoppingListId: String,
    },
    data() {
        return {
            shoppingListName: 'Einkaufsliste',
        }
    },
    watch: {
        shoppingList(list) { //this will properly set name after url navigation o.O
            if (list && list.title) {
                this.shoppingListName = list.title;
            }
        },
    },
    created() { //this will properly set name after router-link
        if (this.shoppingList && this.shoppingList.title) {
            this.shoppingListName = this.shoppingList.title;
        }
    },
    computed: {
        shoppingList: {
            get() {                              
                return this.$store.getters.getShoppingList(parseInt(this.$route.params.shoppingListId));
            },
        }
    },
    methods: {
        saveState(event, listId, storeIndex, itemIndex) {
            this.$store.dispatch('toggleShoppingListItem', { listId, storeIndex, itemIndex, checked: event.target.checked} );
        },
        deleteList() {
            this.$store.dispatch('deleteShoppingList', this.shoppingList.id);
            this.$router.push('/shoppinglists');
        },
        saveShoppingListName() {
            this.$store.dispatch('saveShoppingListName', { listId: this.shoppingList.id, name: this.shoppingListName });
        },
    },
});
</script>

<style scoped>
    h4 {
        margin-left: 3rem;
    }
    h5 {
        margin-left: 1rem;
    }
    h6 {
        margin-left: 4rem;
    }
    label.strike {
        text-decoration: line-through;
        color: #aaa;
    }
    .delete-button {
        margin-left: 5rem;
        margin-top: 1rem;
        margin-bottom: 1rem;
    }
</style>