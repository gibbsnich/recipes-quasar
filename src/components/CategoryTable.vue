<template>
    <table class="table">
        <thead>
            <tr>
                <th scope="col">{{ this.name }}</th>
                <th scope="col">&nbsp;</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(category, index) in categories" v-bind:key="category.id">
                <td>
                    <input type="text" class="form-control" v-model="category.name" @change="updateDirty(index)"/>
                </td>
                <td>
                    <button type="button" class="btn btn-success btn-sm" aria-label="Save" @click="save(index)" :disabled="!dirtyCategories[index]">
                        <font-awesome-icon icon="save" />
                    </button>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'CategoryTable',
  emits: ['save'],
  props: {
        name: String,
        categoryItemsGetter: Function,
  },
  data() {
    return {
      categories: [],
      originalCategories: [],
      dirtyCategories: [],
    }
  },
  mounted() {
    this.categories = JSON.parse(JSON.stringify(this.categoryItemsGetter()));
    this.originalCategories = JSON.parse(JSON.stringify(this.categoryItemsGetter()));
    this.dirtyCategories = [];
  },
  methods: {
    updateDirty(index) {
        const curCategory = this.categories[index];
        const nameExists = !this.originalCategories.find(oc => oc.id !== curCategory.id && oc.name === curCategory.name);
        this.dirtyCategories[index] = nameExists && curCategory.name.length > 0 && curCategory.name !== this.originalCategories[index].name;
    },
    save(index) {
        this.$emit('save', {id: this.categories[index].id, name: this.categories[index].name});
        this.originalCategories = JSON.parse(JSON.stringify(this.categoryItemsGetter()));
        this.updateDirty(index);
    },
  },
});
</script>