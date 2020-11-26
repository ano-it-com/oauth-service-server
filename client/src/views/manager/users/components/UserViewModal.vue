<template>
  <v-dialog
    v-model="value"
    max-width="800px"
    persistent
    @keydown.esc="onClose"
  >
    <v-card :loading="isLoading">
      <v-card-title v-if="!(single && userId)">Новый пользователь</v-card-title>
      <v-card-title v-else-if="!single">Карточка пользователя</v-card-title>
      <v-card-title v-else>Пользователь: {{ single.email }}</v-card-title>
      <v-card-subtitle v-if="single">
        Дата регистрации: {{ createdAt }}, id: {{ single.id }}
      </v-card-subtitle>

      <v-card-text>
        <div class="user-picture mb-4">
          <v-avatar v-if="single" :size="96">
            <v-img :src="single.picture" />
          </v-avatar>
        </div>

        <v-form class="pt-4">
          <v-text-field
            v-model="form.username"
            :disabled="form.fromLDAP && single"
            label="Имя профиля"
            required
            outlined
          />

          <v-text-field
            v-model="form.email"
            label="Электронная почта"
            type="email"
            required
            outlined
          />

          <v-text-field
            v-model="form.firstName"
            label="Имя пользователя"
            required
            outlined
          />
          <v-text-field
            v-model="form.lastName"
            label="Фамилия пользователя"
            required
            outlined
          />

          <searchable-select
            v-model="form.roles"
            :get-list-function="rolesGetList"
            :list-store-state="rolesList"
            label="Роли пользователя"
            chips
            multiple
          />

          <div v-if="userId" class="pb-8">
            <v-checkbox
              v-model="form.isSSOAdmin"
              :ripple="false"
              :disabled="$currentUser.id === userId"
              label="Администратор SSO"
              dense
            />

            <v-checkbox
              v-model="form.isBanned"
              :ripple="false"
              :disabled="(single && single.fromLDAP) || ($currentUser.id === userId)"
              label="Заблокирован"
              dense
            />
          </div>

          <v-divider class="mb-8" />

          <v-text-field
            v-model="form.password"
            :label="userId ? 'Новый пароль' : 'Пароль для пользователя'"
            type="password"
            required
            outlined
          />

          <v-text-field
            v-model="form.passwordConfirm"
            :disabled="!form.password"
            label="Подтвердите пароль"
            type="password"
            required
            outlined
          />
        </v-form>

        <div class="d-flex mt-2">
          <v-btn
            v-if="userId"
            :disabled="isLoading"
            color="primary"
            elevation="0"
            @click="updateUser"
          >
            <v-icon left>mdi-content-save</v-icon>
            Сохранить
          </v-btn>
          <v-btn
            v-else
            :disabled="isLoading"
            color="primary"
            elevation="0"
            @click="addUser"
          >
            <v-icon left>mdi-plus</v-icon>
            Создать
          </v-btn>
          <div class="flex-grow-1" />
          <v-btn
            :disabled="isLoading"
            color="error"
            text
          >
            <v-icon left>mdi-account-remove</v-icon>
            Удалить
          </v-btn>
          <v-btn
            color="blue"
            dark
            class="ml-2"
            elevation="0"
            @click="onClose"
          >
            <v-icon left>mdi-close-circle-outline</v-icon>
            Отмена
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import moment from 'moment';
import SearchableSelect from '@/components/common/SearchableSelect.vue';

const createDefaultForm = () => ({
  firstName: null,
  lastName: null,
  email: null,
  password: null,
  passwordConfirm: null,
  username: null,
  roles: [],
  isSSOAdmin: false,
  isBanned: false,
});

export default {
  name: 'user-view-modal',
  components: { SearchableSelect },
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: Boolean,
    userId: String,
  },
  data: () => ({
    single: null,
    isLoading: false,
    form: createDefaultForm(),
  }),
  computed: {
    ...mapState('users', {
      storeSingle: 'single',
    }),
    ...mapState('roles', { rolesList: 'listItems' }),

    triggered() {
      return this.value && this.userId;
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
        isBanned: !!(value && value.bannedAt && value.bannedBy),
      };
    },
  },
  methods: {
    ...mapActions(['notify']),
    ...mapActions('users', ['getItem', 'update', 'create', 'clearSingle']),
    ...mapActions('roles', { rolesGetList: 'getItemsList' }),

    async loadView() {
      if (this.storeSingle && this.storeSingle.id === this.userId) {
        this.single = { ...this.storeSingle };
        return;
      }

      try {
        this.isLoading = true;
        this.single = await this.getItem(this.userId);
      } finally {
        this.isLoading = false;
      }
    },

    async updateUser() {
      try {
        this.isLoading = true;
        await this.update(this.form);
        await this.getItem(this.userId);

        this.notify({ message: 'Пользователь успешно обновлен.', type: 'success' });
        if (this.form.passwordConfirm && this.form.fromLDAP) {
          this.notify({ message: 'Пароль пользователя обновлен в LDAP.', type: 'info' });
        }

        this.$emit('updated');
        this.onClose();
      } catch (e) {
        console.log(e);
      } finally {
        this.isLoading = false;
      }
    },

    async addUser() {
      try {
        this.isLoading = true;
        const { id } = await this.create(this.form);
        this.clearSingle();

        this.notify({ message: 'Пользователь успешно создан.', type: 'success' });

        this.$emit('updated');
        this.onClose();

        this.$router.push({ name: 'manager-users-item', params: { userId: id } });
      } catch (e) {
        console.log(e);
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

<style lang="scss" scoped>

.user-avatar {
  position: absolute;
}
</style>
