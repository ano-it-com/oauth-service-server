<template>
  <v-autocomplete
    :value="value"
    :search-input.sync="searchValue"
    :items="value"
    :label="label"
    :placeholder="placeholder"
    :hint="hint"
    :required="required"
    outlined
    chips
    small-chips
    multiple
    hide-no-data
    hide-selected
    deletable-chips
    @update:search-input="onSearchInput"
  />
</template>

<script>
export default {
  name: 'dynamic-select',
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: {
      type: Array,
      default: () => ([]),
    },
    label: String,
    placeholder: String,
    hint: String,
    required: Boolean,
  },
  data: () => ({
    searchValue: null,
  }),
  methods: {
    onSearchInput() {
      if (!this.searchValue) return;

      if (this.searchValue.indexOf(',') !== -1 || this.searchValue.indexOf(' ') === this.searchValue.length - 1) {
        const value = this.searchValue.substring(0, this.searchValue.length - 1);
        const alreadyExist = this.value.findIndex((_) => _ === value) !== -1;
        if (!alreadyExist) {
          this.$emit('change', [...(this.value || []), value]);
        }
        this.searchValue = null;
      }
    },
  },
};
</script>
