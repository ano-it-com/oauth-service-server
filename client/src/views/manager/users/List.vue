<template>
  <div :class="$options.name">
    <h2>Пользователи системы</h2>
    <v-divider />

    <div class="pt-4">
      <div class="d-flex pa-4">
        <v-btn color="primary" elevation="0" @click="userViewOpened = true">
          <v-icon left>mdi-account-multiple-plus</v-icon>
          Новый пользователь
        </v-btn>
        <div class="flex-grow-1" />
        <v-text-field
          :loading="searchIsLoading"
          label="Поиск пользователей"
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
        hide-default-footer
        @click:row="handleRowClick"
      >
        <template #item.picture="{ item }">
          <v-avatar size="24px">
            <img :src="item.picture">
          </v-avatar>
        </template>

        <template #item.name="{ item }">
          {{ item.firstName }} {{ item.lastName }}
        </template>

        <template #item.labels="{ item }">
          <v-chip
            v-if="item.bannedAt"
            color="error darken-1"
            class="mr-1"
            small
            label
          >
            Забанен
          </v-chip>

          <v-chip
            v-if="item.isSSOAdmin"
            color="success"
            class="mr-1"
            small
            label
          >
            Админ SSO
          </v-chip>

          <v-chip
            v-if="item.fromLDAP"
            color="indigo"
            class="mr-1"
            small
            label
            dark
          >
            LDAP
          </v-chip>
        </template>

        <template #item.email="{ item }">
          <a :href="`mailto:${item.email}`" v-text="item.email" />
        </template>

        <template v-if="pagination" #footer>
          <v-pagination
            :length="pagination.lastPage"
            :value="pagination.currentPage"
            :disabled="pagination.lastPage === 1"
            total-visible="8"
            class="pb-4 pt-4 elevation-0"
            @input="onChangePage($event)"
          />
        </template>
      </v-data-table>
    </div>

    <user-view-modal
      v-model="userViewOpened"
      :user-id="selectedUserId"
      @closed="onViewUserClose"
      @updated="getList({ page: pagination.currentPage })"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import debounce from 'lodash/debounce';
import UserViewModal from './components/UserViewModal.vue';

export default {
  name: 'manager-users-list',
  asyncData({ store }) {
    if (store.state.users.list) return null;
    return store.dispatch('users/getList');
  },
  components: { UserViewModal },
  data: () => ({
    columns: [
      {
        value: 'picture',
        sortable: false,
        width: '80px',
        align: 'center',
      },
      { text: 'Имя пользователя', value: 'name', sortable: false },
      { text: 'Имя профиля', value: 'username', sortable: false },
      { text: '', value: 'labels', sortable: false },
      { text: 'E-mail', value: 'email', sortable: false },
      { value: 'actions', sortable: false },
    ],
    selectedUserId: null,
    userViewOpened: false,
    isLoading: false,
    searchIsLoading: false,
    lastQuery: null,
  }),
  computed: {
    ...mapState('users', ['list', 'pagination']),
  },
  watch: {
    '$route.name': {
      immediate: true,
      handler(name) {
        if (name === 'manager-users-item') {
          this.selectedUserId = this.$route.params.userId;
          this.userViewOpened = true;
        }
      },
    },
  },
  created() {
    const debouncedSearch = debounce(this.onSearch, 300);

    this.debouncedSearch = (...args) => {
      this.searchIsLoading = true;
      debouncedSearch(...args);
    };
  },
  methods: {
    ...mapActions('users', ['getList', 'getNextPage']),

    handleRowClick(item) {
      this.$router.push({ name: 'manager-users-item', params: { userId: item.id } });
    },

    onViewUserClose() {
      if (this.selectedUserId === null) return;

      this.selectedUserId = null;
      this.$router.push({ name: 'manager-users' });
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

  },
};
</script>
