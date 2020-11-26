<template>
  <div :class="$options.name">
    <v-navigation-drawer
      v-model="drawer"
      color="teal"
      app
      absolute
      dark
    >
      <v-list dense nav class="py-0">
        <v-list-item two-line>
          <v-list-item-avatar>
            <img :src="$currentUser.picture">
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>ИАЦ.КОННЕКТ - Управление</v-list-item-title>
            <v-list-item-subtitle>
              {{ $currentUser.firstName }} {{ $currentUser.lastName }}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-list-item href="/auth/logout">
          <v-list-item-icon>
            <v-icon>mdi-logout</v-icon>
          </v-list-item-icon>

          <v-list-item-content>Выход</v-list-item-content>
        </v-list-item>

        <v-divider class="mb-1" />

        <v-list-item
          v-for="(item, index) in MENU_ROUTES"
          :key="index"
          :to="{ name: item.to }"
          exact
        >
          <v-list-item-icon>
            <v-icon v-text="item.icon" />
          </v-list-item-icon>

          <v-list-item-content v-text="item.title" />
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>
  </div>
</template>

<script>
const MENU_ROUTES = [
  { icon: 'mdi-view-dashboard', title: 'Информация', to: 'manager-home' },
  { icon: 'mdi-account-multiple-outline', title: 'Пользователи', to: 'manager-users' },
  { icon: 'mdi-account-group-outline', title: 'Клиенты', to: 'manager-clients' },
  { icon: 'mdi-shield-account-outline', title: 'Роли и разрешения', to: 'manager-roles' },
];

export default {
  name: 'manager-view',
  data: () => ({
    drawer: true,
  }),
  created() {
    this.MENU_ROUTES = MENU_ROUTES;
  },
};
</script>

<style lang="scss" scoped>

.manager-view {
  height: 100%;
}

.user-info {
  display: flex;
  align-items: center;
  margin-top: 24px;

  &__name {
    display: flex;
    align-items: center;
    margin-left: 12px;
  }
}
</style>
