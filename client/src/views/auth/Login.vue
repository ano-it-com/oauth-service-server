<template>
  <el-card :class="$options.name" shadow="hover" style="max-width: 520px; width: 100%">
    <div class="el-page-header">
      <div class="el-page-header__left">
        <b>ИАЦ.КОННЕКТ</b>
      </div>
      <div class="el-page-header__content">
        Вход
      </div>
    </div>

    <el-alert
      v-if="error && error.message === 'Wrong credentials'"
      title="Ошибка авторизации"
      type="error"
      description="Неверные логин или пароль"
      style="margin-top: 24px;"
      show-icon
    />

    <el-form method="POST" style="margin-top: 24px">
      <csrf-token-value />

      <el-form-item label="Электронная почта или имя пользователя" required>
        <el-input v-model="email" name="email" required />
      </el-form-item>

      <el-form-item label="Пароль" required>
        <el-input v-model="password" type="password" name="password" required />
      </el-form-item>

      <el-form-item class="actions">
        <el-button type="primary" native-type="submit">Выполнить вход</el-button>
        <el-link type="info" :href="registerLink">Нет аккаунта? Зарегистрироваться!</el-link>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
import CsrfTokenValue from '@/components/CsrfTokenValue.vue';

export default {
  name: 'login-view',
  components: { CsrfTokenValue },
  data: () => ({
    email: null,
    password: null,
  }),
  computed: {
    queryParams() {
      return this.$route.query;
    },
    error() {
      return this.queryParams.error && JSON.parse(this.queryParams.error);
    },
  },
  created() {
    if (this.queryParams && this.queryParams.email) {
      this.email = this.queryParams.email;
    }

    // eslint-disable-next-line
    this.registerLink = `/auth/register?redirect_uri=${encodeURIComponent(this.queryParams && this.queryParams.redirect_uri || '/')}`;
  },
};
</script>

<style lang="scss" scoped>

.actions {

  ::v-deep .el-form-item__content {
    display: flex;
    justify-content: space-between;

    &:before {
      content: none;
    }
  }
}
</style>
