<template>
  <div :class="$options.name">
    <h2>Статистика по системе</h2>
    <v-divider />

    <v-row class="pt-4">
      <v-col md="3">
        <v-card :to="{ name: 'manager-users' }" color="teal" elevation="24" dark>
          <v-card-text>
            <h1 v-text="statistic.usersCount" />
            <small>Пользователей в системе</small>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col md="3">
        <v-card :to="{ name: 'manager-clients' }" color="teal" elevation="24" dark>
          <v-card-text>
            <h1 v-text="statistic.clientsCount" />
            <small>Подключенных клиентов</small>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col md="3">
        <v-card color="teal" elevation="24" dark>
          <v-card-text>
            <h1 v-text="statistic.sessionsCount" />
            <small>Активных сессий</small>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col md="3">
        <v-card color="teal" elevation="24" dark>
          <v-card-text>
            <h1 v-text="statistic.activeTokensCount" />
            <small>Токенов используется (активных)</small>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'manager-home-view',
  asyncData({ store }) {
    return store.dispatch('system/getStatistic');
  },
  computed: {
    ...mapState('system', ['statistic']),
  },
};
</script>
