<template>
  <v-dialog v-model="dialog" max-width="1200px" persistent>
    <template #activator="{ on }">
      <v-btn
        color="primary"
        class="col-12"
        outlined
        v-on="on"
      >
        Разрешения роли
      </v-btn>
    </template>

    <v-card>
      <v-card-title>Разрешения роли: {{ roleName || 'Неизвестная роль' }}</v-card-title>

      <v-card-text>
        <v-card max-width="600px" outlined>
          <v-card-title>Новое разрешение</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="newPermissionForm.name"
              label="Название"
              outlined
              dense
              single-line
            />
            <v-text-field
              v-model="newPermissionForm.alias"
              label="Алиас"
              outlined
              hint="Оставьте поле пустым, чтобы сгенерировать алиас автоматически"
              dense
              single-line
            />

            <v-row dense justify="space-between">
              <v-col>
                <v-checkbox v-model="newPermissionForm.read" label="Чтение" dense />
              </v-col>
              <v-col>
                <v-checkbox v-model="newPermissionForm.create" label="Создание" dense />
              </v-col>
              <v-col>
                <v-checkbox v-model="newPermissionForm.edit" label="Редактирование" dense />
              </v-col>
              <v-col>
                <v-checkbox v-model="newPermissionForm.delete" label="Удаление" dense />
              </v-col>
            </v-row>

            <div class="d-flex mt-4">
              <div class="flex-grow-1" />
              <v-btn
                color="primary"
                elevation="0"
                @click="addPermission"
              >
                Добавить разрешение
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <v-data-table
          :headers="permissionColumns"
          :items="permissionMutatedList"
          :items-per-page="100"
          :loading="permissionIsUpdating"
          class="pt-6"
          item-key="id"
          no-data-text="Разрешения для роли отсутствуют"
          hide-default-footer
        >
          <template #item.name="{ item }">
            <v-edit-dialog :return-value.sync="item.name" @save="updatePermissionItem(item)">
              {{ item.name }}
              <template #input>
                <v-text-field
                  v-model="item.name"
                  label="Название"
                  class="mt-2 mb-2"
                  dense
                  outlined
                  hide-details
                  single-line
                />
              </template>
            </v-edit-dialog>
          </template>
          <template #item.read="{ item }">
            <v-simple-checkbox
              v-model="item.read"
              :ripple="false"
              color="primary"
              @click="updatePermissionItem(item)"
              dense
            />
          </template>

          <template #item.create="{ item }">
            <v-simple-checkbox
              v-model="item.create"
              :ripple="false"
              color="primary"
              @click="updatePermissionItem(item)"
              dense
            />
          </template>

          <template #item.edit="{ item }">
            <v-simple-checkbox
              v-model="item.edit"
              :ripple="false"
              color="primary"
              @click="updatePermissionItem(item)"
              dense
            />
          </template>

          <template #item.delete="{ item }">
            <v-simple-checkbox
              v-model="item.delete"
              :ripple="false"
              color="primary"
              @click="updatePermissionItem(item)"
              dense
            />
          </template>
        </v-data-table>

        <div class="d-flex pt-6">
          <v-btn color="primary" elevation="0" @click="onClose">Готово</v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions } from 'vuex';
import translit from 'cyrillic-to-translit-js';

const createDefaulPermissiomForm = () => ({
  name: null,
  alias: null,
  create: false,
  read: true,
  edit: false,
  delete: false,
});

export default {
  name: 'role-permissions-modal',
  props: {
    roleName: String,
    roleId: {
      type: String,
      required: true,
    },
    permissionsList: {
      type: Array,
      default: () => ([]),
    },
  },
  data: () => ({
    dialog: false,
    newPermissionForm: createDefaulPermissiomForm(),
    permissionIsLoading: false,
    permissionIsUpdating: false,
    permissionMutatedList: null,
    permissionColumns: [
      {
        text: 'Название разрешения',
        value: 'name',
        sortable: false,
        align: 'start',
      },
      {
        text: 'Чтение',
        value: 'read',
        sortable: false,
        align: 'center',
      },
      {
        text: 'Создание',
        value: 'create',
        sortable: false,
        align: 'center',
      },
      {
        text: 'Редактирование',
        value: 'edit',
        sortable: false,
        align: 'center',
      },
      {
        text: 'Удаление',
        value: 'delete',
        sortable: false,
        align: 'center',
      },
    ],
  }),
  watch: {
    'newPermissionForm.alias': {
      handler() {
        this.formAliasError = null;
      },
    },
    permissionsList: {
      immediate: true,
      deep: true,
      handler(list) {
        this.permissionMutatedList = (list || []).map((item) => ({ ...item }));
      },
    },
  },
  methods: {
    ...mapActions('roles', ['createPermission', 'updatePermission']),
    ...mapActions(['notify']),

    async addPermission() {
      this.permissionIsLoading = true;

      if (this.newPermissionForm.alias === '' || this.newPermissionForm.alias === null) {
        this.newPermissionForm.alias = translit().transform(this.newPermissionForm.name, '_').toLowerCase();
      }

      try {
        await this.createPermission(this.newPermissionForm);
        this.newPermissionForm = createDefaulPermissiomForm();
      } catch (e) {
        this.notify({ message: 'Алиас разрешения уже используется в системе' });
      } finally {
        this.permissionIsLoading = false;
      }
    },

    async updatePermissionItem(item) {
      this.permissionIsUpdating = true;
      const payload = {
        ...item,
        alias: item.alias === '' || item.alias === null ? translit().transform(item.name, '_').toLowerCase() : item.alias,
      };

      await this.updatePermission(payload);
      this.permissionIsUpdating = false;
    },

    onClose() {
      this.newPermissionForm = createDefaulPermissiomForm();
      this.dialog = false;
    },
  },
};
</script>
