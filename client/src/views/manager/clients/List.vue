<template>
  <div :class="$options.name">
    <h2>Клиенты системы</h2>
    <v-divider />

    <div class="pt-4">
      <div class="d-flex pa-4">
        <v-btn color="primary" elevation="0" @click="clientViewOpened = true">
          <v-icon left>mdi-account-multiple-plus</v-icon>
          Новый клиент
        </v-btn>
        <div class="flex-grow-1" />
        <v-text-field
          label="Поиск клиентов"
          prepend-icon="mdi-magnify"
          outlined
          dense
          @input="debouncedSearch"
        />
      </div>
      <v-data-table
        :headers="columns"
        :items="list"
        :loading="isLoading"
        class="data-table"
        hide-default-footer
        @click:row="handleRowClick"
      >
        <template #item.scopes="{ item }">
          <template v-for="i in item.scopes.map(_ => CONSTS.SCOPE_NAMES[_])">
            <div :key="i" v-text="i" />
          </template>
        </template>

        <template #item.grants="{ item }">
          <template v-for="i in item.grants.map(_ => CONSTS.GRANT_NAMES[_])">
            <div :key="i" v-text="i" />
          </template>
        </template>

        <template v-if="pagination" #footer>
          <v-pagination
            :length="pagination.lastPage"
            :value="pagination.currentPage"
            :disabled="pagination.lastPage === 1"
            total-visible="8"
            class="pb-4 pt-6 elevation-0"
            @input="onChangePage($event)"
          />
        </template>
      </v-data-table>
    </div>

    <client-view-modal
      v-model="clientViewOpened"
      :client-id="selectedClientId"
      @closed="onViewClientClose"
    />
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import debounce from 'lodash/debounce';
import ClientViewModal from './components/ClientViewModal.vue';
import * as CONSTS from './consts';

export default {
  name: 'manager-clients-list',
  asyncData({ store }) {
    if (store.state.clients.list) return null;
    return store.dispatch('clients/getList');
  },
  components: { ClientViewModal },
  data: () => ({
    columns: [
      { text: 'Имя клиента', value: 'name', sortable: false },
      { text: 'Разрешения', value: 'scopes', sortable: false },
      { text: 'Допустимые методы', value: 'grants', sortable: false },
    ],
    selectedClientId: null,
    isLoading: false,
    searchIsLoading: false,
    clientViewOpened: false,
    lastQuery: false,
  }),
  computed: {
    ...mapState('clients', ['list', 'pagination']),
  },
  watch: {
    '$route.name': {
      immediate: true,
      handler(name) {
        if (name === 'manager-clients-item') {
          this.selectedClientId = this.$route.params.clientId;
          this.clientViewOpened = true;
        }
      },
    },
  },
  created() {
    this.CONSTS = CONSTS;

    const debouncedSearch = debounce(this.onSearch, 300);

    this.debouncedSearch = (...args) => {
      this.searchIsLoading = true;
      debouncedSearch(...args);
    };
  },
  methods: {
    ...mapActions('clients', ['getList', 'getNextPage']),

    handleRowClick(item) {
      this.$router.push({ name: 'manager-clients-item', params: { clientId: item.id } });
    },

    async onChangePage(page) {
      this.isLoading = true;

      try {
        await this.getNextPage({ page });
      } catch (e) {
        console.error(e);
      } finally {
        this.isLoading = false;
      }
    },

    async onSearch(query) {
      if (!query || query < 3) {
        this.searchIsLoading = false;
        await this.getList();
        this.lastQuery = null;
        return;
      }

      this.lastQuery = query;

      try {
        this.isLoading = true;
        await this.getList({ query });
      } catch (e) {
        console.error(e);
      } finally {
        this.isLoading = false;
        this.searchIsLoading = false;
      }

      if (this.lastQuery !== query) {
        await this.onSearch(query);
      }
    },

    onViewClientClose() {
      if (!this.selectedClientId) return;

      this.selectedClientId = null;
      this.$router.push({ name: 'manager-clients' });
    },
  },
};
</script>

<style lang="scss" scoped>

.data-table {
  ::v-deep tbody > tr {
    cursor: pointer;

    & > td {
      padding: 12px 16px!important;
    }
  }
}
</style>
