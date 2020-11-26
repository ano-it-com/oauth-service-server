<template>
  <v-dialog
    v-model="value"
    max-width="800px"
    persistent
    @keydown.esc="onClose"
  >
    <v-card :loading="isLoading">
      <v-card-title v-if="!single && !clientId">Новый клиент</v-card-title>
      <v-card-title v-else-if="!single">Карточка клиента</v-card-title>
      <v-card-title v-else>Клиент: {{ single.name }}</v-card-title>
      <v-card-subtitle v-if="single">
        Дата подключения: {{ createdAt }}, id: {{ single.id }}, secret: {{ single.secret }}
      </v-card-subtitle>

      <v-card-text>
        <v-form id="new-client" name="new-client" class="pt-4">
          <v-text-field
            v-model="form.name"
            label="Название клиента"
            required
            outlined
          />

          <v-text-field
            v-if="form.secret"
            v-model="form.secret"
            label="Секретный ключ"
            disabled
            outlined
          />

          <dynamic-select
            v-model="form.redirectUrls"
            label="URL-коллбэк на стороне клиента"
            hint="Указывайте ссылки через запятую"
            required
          />

          <v-select
            v-model="form.grants"
            label="Доступные методы"
            :items="grantsList"
            item-text="value"
            item-value="id"
            multiple
            outlined
            small-chips
          />

          <v-select
            v-model="form.scopes"
            label="Разрешения"
            :items="scopesList"
            item-value="id"
            item-text="value"
            multiple
            outlined
            small-chips
          />

          <v-select
            v-model="form.responseModes"
            label="Режимы ответа для сервера"
            :items="responseModesList"
            item-value="id"
            item-text="value"
            multiple
            outlined
            small-chips
          />

          <v-select
            v-model="form.responseTypes"
            label="Типы ответа для сервера"
            :items="responseTypesList"
            item-value="id"
            item-text="value"
            small-chips
            multiple
            outlined
          />
        </v-form>

        <div class="d-flex mt-2">
          <v-btn
            v-if="clientId"
            :disabled="isLoading"
            color="primary"
            elevation="0"
            @click="updateClient"
          >
            <v-icon left>mdi-content-save</v-icon>
            Сохранить
          </v-btn>
          <v-btn
            v-else
            :disabled="isLoading"
            color="primary"
            elevation="0"
            @click="addClient"
          >
            <v-icon left>mdi-plus</v-icon>
            Создать
          </v-btn>

          <div class="flex-grow-1" />

          <v-btn
            v-if="clientId"
            :href="`/connection/${clientId}`"
            color="info"
            target="_blank"
            link
            text
          >
            <v-icon left>mdi-share</v-icon>
            Инструкция по подключению
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
import { mapActions, mapState } from 'vuex';
import moment from 'moment';
import DynamicSelect from '@/components/common/DynamicSelect.vue';
import * as CONSTS from '../consts';

const defaultScopes = [
  CONSTS.SCOPE_NAMES.openid,
  CONSTS.SCOPE_NAMES.email,
  CONSTS.SCOPE_NAMES.profile,
  CONSTS.SCOPE_NAMES.permissions,
];
// const defaultScopesList = defaultScopes.map((_) => ({ id: _, value: CONSTS.SCOPE_NAMES[_] }));

const scopesList = Object.keys(CONSTS.SCOPE_NAMES).map(
  (_) => ({ id: _, value: CONSTS.SCOPE_NAMES[_] }),
);
const grantsList = Object.keys(CONSTS.GRANT_NAMES).map(
  (_) => ({ id: _, value: CONSTS.GRANT_NAMES[_] }),
);

const defaultGrantsList = Object.keys(CONSTS.GRANT_NAMES);

const responseTypesList = [
  { id: 'code', value: 'code' },
];

const responseModesList = [
  { id: 'query', value: 'query' },
  { id: 'fragment', value: 'fragment' },
  { id: 'form_post', value: 'form_post' },
];

const createDefaultForm = () => ({
  name: null,
  scopes: defaultScopes,
  grants: defaultGrantsList,
  responseModes: ['query', 'form_post'],
  responseTypes: ['code'],
  firstParty: false,
  redirectUrls: [],
});

export default {
  name: 'clients-view-modal',
  model: {
    prop: 'value',
    event: 'change',
  },
  components: { DynamicSelect },
  props: {
    value: Boolean,
    clientId: String,
  },
  data: () => ({
    single: null,
    isLoading: false,
    form: createDefaultForm(),
  }),
  computed: {
    ...mapState('clients', {
      storeSingle: 'single',
    }),

    triggered() {
      return this.value && this.clientId;
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
      this.form = { ...this.form, ...value };
    },
  },
  created() {
    this.responseTypesList = responseTypesList;
    this.responseModesList = responseModesList;
    this.grantsList = grantsList;
    this.scopesList = scopesList;
  },
  methods: {
    ...mapActions('clients', ['getItem', 'update', 'create']),

    async loadView() {
      if (this.storeSingle && this.clientId && (this.storeSingle.id === this.clientId)) {
        this.single = { ...this.storeSingle };
        return;
      }

      try {
        this.isLoading = true;
        this.single = await this.getItem(this.clientId);
      } finally {
        this.isLoading = false;
      }
    },

    async addClient() {
      try {
        this.isLoading = true;
        const response = await this.create(this.form);
        this.onClose();
        await this.$router.push({ name: 'manager-clients-item', params: { clientId: response.id } });
      } catch (e) {
        console.error(e);
      } finally {
        this.isLoading = false;
      }
    },

    async updateClient() {
      try {
        this.isLoading = true;
        await this.update(this.form);
      } catch (e) {
        console.error(e);
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
