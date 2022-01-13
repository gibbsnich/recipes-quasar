<template>
    <calendar-link>
        <!--
        <nav class="navbar fixed-top">
            <div class="container-fluid">
                <div class="navbar-nav">
                    -->
                    <ul class="nav nav-tabs fixed-top" style="background-color:white;">

                        <li class="nav-item">
                            <a :class="['nav-link', {active: activeTab === ''}]" href="javascript:void(0)" @click="goto('')">Kalender</a>
                        </li>
                        
                        <slot name="items"></slot>
                        
                        <li class="nav-item dropdown">
                            <a :class="['nav-link', 'dropdown-toggle', {show: this.showDropDown}]" 
                                href="javascript:void(0)" @click="toggleDropDown" role="button">Daten</a>
                            <ul :class="['dropdown-menu', {show: this.showDropDown}]">
                                <li v-for="tab in tabs" v-bind:key="tab">
                                    <a :class="['dropdown-item', {active: activeTab === tab.href}]" href="javascript:void(0)" @click="goto(tab.href)">{{ tab.name }}</a>
                                </li>
                            </ul>
                        </li>

                        <!-- <li v-for="tab in tabs" v-bind:key="tab" class="nav-item">
                            <a :class="['nav-link', {active: activeTab === tab.href}]" href="javascript:void(0)" @click="goto(tab.href)">{{ tab.name }}</a>
                        </li> -->
                    </ul>
                    <div style="margin-top:50px">
                        <slot></slot>
                    </div>
                    <!--
                </div>
            </div>
        </nav>-->
    </calendar-link>
</template>

<script>
import { defineComponent } from 'vue';
import CalendarLink from './CalendarLink.vue';

export default defineComponent({
  name: 'SettingsMenu',
  components: { CalendarLink },
  props: {
    activeTab: String,
  },
  data() {
      return {
          tabs: [
              //{href: '', name: 'Kalender'},
              {href: 'recipes', name: 'Rezepte'},
              {href: 'ingredients', name: 'Zutaten'},
              {href: 'categories', name: 'Kategorien'},
              {href: 'shoppinglists', name: 'Einkaufslisten'},
          ],
          showDropDown: false,
      }
  },
  methods: {
      toggleDropDown() {
          this.showDropDown = !this.showDropDown;
      },
      goto(href) {
        this.$router.push(`/${href}`);
      },
  }
});
</script>