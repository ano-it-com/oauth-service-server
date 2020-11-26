<template>
  <el-card :class="$options.name" shadow="hover">
    <div class="el-page-header">
      <div class="el-page-header__left">
        <b>ИАЦ.КОННЕКТ</b>
      </div>
      <div class="el-page-header__content">
        Авторизация в системе
      </div>
    </div>

    <el-form id="deny" method="POST" action="/oauth2/deny">
      <csrf-token-value />
    </el-form>

    <el-form id="accept" method="POST" action="/oauth2/accept">
      <csrf-token-value />
      <template v-for="(item, index) in data.scopes">
        <input
          :key="index"
          :value="item"
          type="hidden"
          name="scopes[]"
        />
      </template>

      <div class="content">
        <div class="user-welcome">
          <el-avatar :size="50" :src="data.user.picture" />
          <div class="user-welcome__text">
            Добро пожаловать,&nbsp;<b>{{ data.user.firstName }}!</b>
          </div>
        </div>
        Приложение &nbsp;<b>{{ data.client.name }}</b>&nbsp; запрашивает доступ: <br>

        <div class="scopes-list">
          <div v-for="(item, index) in data.scopes" :key="index" class="scopes-list__item el-card">
            <i :class="SCOPES[item].icon" /> {{ SCOPES[item].text }}
          </div>
        </div>
      </div>

      <el-form-item>
        <el-button type="primary" native-type="submit" form="accept">Разрешить доступ</el-button>
        <el-button type="danger" native-type="submit" form="deny">Запретить</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
import CsrfTokenValue from '@/components/CsrfTokenValue.vue';

const SCOPES = {
  profile: { text: 'К вашему имени, имени профиля и изображению профиля', icon: 'el-icon-postcard' },
  email: { text: 'К вашему E-mail', icon: 'el-icon-message' },
  openid: { text: 'К полной информации вашего профиля', icon: 'el-icon-user' },
  offline_access: { text: 'К полному доступу ваших данных без подтверждения', icon: 'el-icon-key' },
  permissions: { text: 'К вашим ролям и доступам', icon: 'el-icon-document' },
};

export default {
  name: 'authorize-view',
  components: { CsrfTokenValue },
  computed: {
    data() {
      // eslint-disable-next-line
      return window.__APP_DATA__;
    },
  },
  created() {
    this.SCOPES = SCOPES;
  },
};
</script>

<style lang="scss" scoped>
.authorize-view {
  max-width: 670px;
  width: 100%;
}

.content {
  width: 100%;
  margin: 24px 0;

  .user-welcome {
    margin-bottom: 24px;
    display: flex;
    align-items: center;

    &__text {
      margin-left: 12px;
    }
  }
}

.scopes-list {
  display: flex;
  flex-direction: column;

  &__item {
    margin-top: 12px;
    padding: 12px;
    border-radius: 4px;
  }
}
</style>
