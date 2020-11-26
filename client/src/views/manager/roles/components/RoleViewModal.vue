<template>
  <v-dialog
    v-model="value"
    max-width="800px"
    @click:outside="onClose"
    @keydown.esc="onClose"
  >
    <v-card :loading="isLoading">
      <v-card-title v-if="!single && !roleId">Новая роль</v-card-title>
      <v-card-title v-else-if="!single">Карточка роли</v-card-title>
      <v-card-title v-else>Роль: {{ single.name }}</v-card-title>

      <v-card-text>
        <v-form id="new-role" name="new-role" class="pt-4">
          <v-text-field
            v-model="form.name"
            label="Название роли"
            required
            outlined
          />

          <v-text-field
            v-model="form.alias"
            label="Алиас"
            hint="Оставьте поле пустым, чтобы сгенерировать алиас автоматически"
            required
            outlined
          />

          <v-select
            v-model="form.clientId"
            :items="clientsList"
            item-text="name"
            item-value="id"
            label="Относится к клиенту"
            outlined
          />

          <role-permissions-modal
            v-if="single && single.id"
            :role-name="storeSingle.name"
            :role-id="storeSingle.id"
            :permissions-list="storeSingle.permissions"
          />
        </v-form>

        <div class="d-flex mt-6">
          <v-btn
            v-if="roleId"
            :disabled="isLoading"
            color="primary"
            elevation="0"
            @click="updateRole"
          >
            <v-icon left>mdi-content-save</v-icon>
            Сохранить
          </v-btn>
          <v-btn
            v-else
            :disabled="isLoading"
            color="primary"
            elevation="0"
            @click="addRole"
          >
            <v-icon left>mdi-plus</v-icon>
            Создать
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import moment from 'moment';
import translit from 'cyrillic-to-translit-js';
import get from 'lodash/get';
import RolePermissionsModal from './RolePermissionsModal.vue';

const createDefaultForm = () => ({
  name: null,
  alias: null,
  clientId: null,
  permissionIds: [],
});

export default {
  name: 'role-view-modal',
  components: { RolePermissionsModal },
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: Boolean,
    roleId: String,
    clientsList: {
      type: Array,
      default: () => ([]),
    },
  },
  data: () => ({
    single: null,
    isLoading: false,
    form: createDefaultForm(),
  }),
  computed: {
    ...mapState('roles', {
      storeSingle: 'single',
    }),

    triggered() {
      return this.value && this.roleId;
    },

    createdAt() {
      if (!this.single) return null;
      return moment(this.single.createdAt).format('LLL');
    },
  },
  watch: {
    triggered: {
      immediate: true,
      handler(val) {
        if (!val) return this.resetView();
        return this.loadView();
      },
    },

    single(value) {
      this.form = {
        ...this.form,
        ...value,
        clientId: get(value, 'client.id', null),
      };
    },
  },
  methods: {
    ...mapActions('roles', ['getItem', 'update', 'create']),
    ...mapActions(['notify']),

    async loadView() {
      if (this.storeSingle && this.roleId && (this.storeSingle.id === this.roleId)) {
        this.single = { ...this.storeSingle };
        return;
      }

      try {
        this.isLoading = true;
        this.single = await this.getItem(this.roleId);
      } finally {
        this.isLoading = false;
      }
    },

    async updateRole() {
      try {
        this.isLoading = true;
        if (this.form.alias === '' || this.form.alias === null) {
          this.form.alias = translit().transform(this.form.name, '_').toLowerCase();
        }

        await this.update(this.form);
      } catch (e) {
        if (e.response.status === 409) {
          this.notify({ message: 'Алиас роли уже используется в системе' });
        }
      } finally {
        this.isLoading = false;
      }
    },
    async addRole() {
      try {
        this.isLoading = true;
        if (this.form.alias === '' || this.form.alias === null) {
          this.form.alias = translit().transform(this.form.name, '_').toLowerCase();
        }

        const response = await this.create(this.form);
        this.onClose();
        this.$router.push({ name: 'manager-roles-item', params: { roleId: response.id } });
      } catch (e) {
        if (e.response.status === 409) {
          this.notify({ message: 'Алиас роли уже используется в системе' });
        }
      } finally {
        this.isLoading = false;
      }
    },

    resetView() {
      this.single = null;
      this.form = createDefaultForm();
    },

    onClose() {
      this.resetView();
      this.$emit('closed');
      this.$emit('change', false);
    },
  },
};
</script>
