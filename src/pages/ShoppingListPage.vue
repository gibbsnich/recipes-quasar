<template>
    <login-modal v-if="!$q.platform.is.electron && !$q.platform.is.capacitor" v-show="!this.$store.state.isAuthenticated && this.$store.state.isOnline" />
    <div :class="{blur_bg: (!this.$store.state.isAuthenticated && this.$store.state.isOnline)}">
        <calendar-link />
        <h4>Einkaufsliste</h4>
        <div v-if="this.shoppingList">
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
        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import LoginModal from '../components/web/LoginModal.vue';
import CalendarLink from '../components/CalendarLink.vue';

export default defineComponent({
    name: 'ShoppingList',
    components: {
        LoginModal,
        CalendarLink,
    },
    props: {
        shoppingListId: String,
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
</style>