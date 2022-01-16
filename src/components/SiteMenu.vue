<template>
    <ul class="nav nav-tabs fixed-top" style="background-color:white;">
        <li class="nav-item">
            <a :class="['nav-link', {active: activeTab === ''}]" href="javascript:void(0)" @click="goto('')">
                <font-awesome-icon icon="calendar" />&nbsp;Kalender
            </a>
        </li>
        <slot name="items"></slot>
        <li class="nav-item dropdown">
            <a :class="['nav-link', 'dropdown-toggle', {show: this.showDropDown}]" 
                href="javascript:void(0)" @click="toggleDropDown" role="button">
                <font-awesome-icon icon="file" />&nbsp;Daten
            </a>
            <ul :class="['dropdown-menu', {show: this.showDropDown}]" ref="dropDown">
                <li v-for="tab in tabs" v-bind:key="tab">
                    <a :class="['dropdown-item', {active: activeTab === tab.href}]" href="javascript:void(0)" @click="goto(tab.href)">{{ tab.name }}</a>
                </li>
            </ul>
        </li>
    </ul>
    <div class="main-container">
        <slot></slot>
    </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SiteMenu',
  props: {
    activeTab: String,
  },
  data() {
      return {
          tabs: [
              {href: 'recipes', name: 'Rezepte'},
              {href: 'ingredients', name: 'Zutaten'},
              {href: 'categories', name: 'Kategorien'},
              {href: 'shoppinglists', name: 'Einkaufslisten'},
          ],
          showDropDown: false,
      }
  },
  beforeMount() {
      document.addEventListener('mousedown', this.checkToggleDropDown);
      document.addEventListener('touchstart', this.checkToggleDropDown);
  },
  beforeUnmount() {
      document.removeEventListener('mousedown', this.checkToggleDropDown);
      document.removeEventListener('touchstart', this.checkToggleDropDown);
  },
  methods: {
      checkToggleDropDown(event) {
          if (!this.$refs.dropDown.contains(event.target)) {
              this.showDropDown = false;
          }
      },
      toggleDropDown() {
          this.showDropDown = !this.showDropDown;
      },
      goto(href) {
        this.$router.push(`/${href}`);
      },
  }
});
</script>

<style scoped>
    .main-container {
        margin-top: 50px;
    }
    
</style>