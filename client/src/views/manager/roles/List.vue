<template>
  <div :class="$options.name">
    <h2>Роли и разрешения</h2>
    <v-divider />

    <div class="pt-4">
      <div class="d-flex pa-4">
        <v-btn color="primary" elevation="0" @click="roleViewOpened = true">
          <v-icon left>mdi-account-multiple-plus</v-icon>
          Новая роль
        </v-btn>
        <div class="flex-grow-1" />
        <v-text-field
          label="Поиск ролей"
          prepend-icon="mdi-magnify"
          outlined
          dense
          disabled
        />
      </div>
      <v-data-table
        :headers="columns"
        :items="list"
        :loading="isLoading"
        no-data-text="Данные отсутствуют"
        hide-default-footer
        @click:row="handleRowClick"
      >
        <template #item.client="{ item }">
          {{ item.client && item.client.name }}
        </template>

        <template #item.permissions="{ item }">
          {{ item.permissions && item.permissions.length }}
        </template>

        <template #item.users="{ item }">
          {{ item.users && item.users.length }}
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

    <role-view-modal
      v-model="roleViewOpened"
      :role-id="selectedRoleId"
      :clients-list="clientsItemsList"
      @closed="onViewRoleClose"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import RoleViewModal from './components/RoleViewModal.vue';

export default {
  name: 'manager-roles-list',
  components: { RoleViewModal },
  asyncData({ store }) {
    const actions = [
      store.dispatch('roles/getList'),
      store.dispatch('clients/getItemsList'),
    ];

    return Promise.all(actions);
  },
  data: () => ({
    columns: [
      { text: 'Имя роли', value: 'name', sortable: false },
      { text: 'Относится к клиенту', value: 'client', sortable: false },
      { text: 'Разрешений', value: 'permissions', sortable: false },
      { text: 'Пользователей', value: 'users', sortable: false },
    ],
    isLoading: false,
    roleViewOpened: false,
    selectedRoleId: null,
  }),
  computed: {
    ...mapState('roles', ['list', 'pagination']),
    ...mapState('clients', { clientsItemsList: 'listItems' }),
  },
  watch: {
    '$route.name': {
      immediate: true,
      handler(name) {
        if (name === 'manager-roles-item') {
          this.selectedRoleId = this.$route.params.roleId;
          this.roleViewOpened = true;
        }
      },
    },
  },
  methods: {
    ...mapActions('roles', ['getNextPage']),

    handleRowClick(item) {
      this.$router.push({ name: 'manager-roles-item', params: { roleId: item.id } });
    },

    onViewRoleClose() {
      if (!this.selectedRoleId) return;

      this.selectedRoleId = null;
      this.$router.push({ name: 'manager-roles' });
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
  },
};
</script>
