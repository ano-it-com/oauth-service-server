<template>
  <v-autocomplete
    :value="value"
    :search-input.sync="searchValue"
    :multiple="multiple"
    :chips="chips"
    :small-chips="chips"
    :deletable-chips="deletable"
    :loading="isLoading"
    :disabled="isLoading"
    :label="label"
    :items="items"
    item-value="id"
    item-text="name"
    outlined
    @click="onInputClick"
    @change="onChange"
  />
</template>

<script>
export default {
  name: 'searchable-select',
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: [Array, String],
    // items: Array,
    label: String,
    getListFunction: {
      type: Function,
      required: true,
    },
    listStoreState: {
      type: Array,
      default: () => ([]),
    },
    multiple: Boolean,
    chips: Boolean,
    deletable: Boolean,
  },
  data: () => ({
    list: null,
    searchValue: '',
    searchList: null,
    isLoading: false,
  }),
  computed: {
    items() {
      if (this.searchValue && this.searchValue.length) {
        return [...this.list.filter(
          (_) => _.name.toLowerCase().indexOf(this.searchValue.toLowerCase()) !== -1,
        )];
      }

      return this.list;
    },
  },
  async created() {
    if (this.value || (this.value && this.value.length)) {
      await this.onInputClick();
    }
  },
  methods: {
    async onInputClick() {
      if (this.list && this.list.length) return;
      await this.resetList();
    },

    async onSearchInput() {
      // eslint-disable-next-line no-useless-return
      if (!this.searchValue) return;

      if (this.searchValue.indexOf(',') !== -1 || this.searchValue.indexOf(' ') === this.searchValue.length - 1) {
        const value = this.searchValue.substring(0, this.searchValue.length - 1);
        const alreadyExist = this.value.findIndex((_) => _ === value) !== -1;
        if (!alreadyExist) {
          this.$emit('change', this.multiple ? [...(this.value || []), value] : value);
        }
        this.searchValue = null;
      }
    },

    onChange(value) {
      this.$emit('change', value);
      this.searchValue = null;
    },

    async resetList() {
      try {
        this.isLoading = true;
        await this.getListFunction();
        this.list = this.listStoreState;
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>
