<template>
  <el-card :class="$options.name" shadow="hover" style="max-width: 520px; width: 100%">
    <div class="el-page-header">
      <div class="el-page-header__left">
        <b>ИАЦ.КОННЕКТ</b>
      </div>
      <div class="el-page-header__content">
        Регистрация нового пользователя
      </div>
    </div>

    <el-alert
      v-if="error && error.error_description === 'Email already taken'"
      title="Ошибка регистрации"
      type="error"
      description="Данный e-mail адрес недоступен для регистрации"
      style="margin-top: 24px;"
      show-icon
    />

    <el-alert
      v-if="error && error.error_description === 'Username already taken'"
      title="Ошибка регистрации"
      type="error"
      description="Данный логин недоступен для регистрации"
      style="margin-top: 24px;"
      show-icon
    />

    <el-alert
      v-if="error && error.error === 'unsafe_password'"
      title="Ошибка регистрации"
      type="error"
      description="Регистрация с данным паролем невозможна, попробуйте другой"
      style="margin-top: 24px;"
      show-icon
    />

    <el-form method="POST" style="margin-top: 24px">
      <csrf-token-value />

      <el-form-item label="Имя" required>
        <el-input v-model="form.firstName" name="firstName" required />
      </el-form-item>

      <el-form-item label="Фамилия">
        <el-input v-model="form.lastName" name="lastName" />
      </el-form-item>

      <el-form-item label="Логин" required>
        <el-input v-model="form.username" name="username" required />
      </el-form-item>

      <el-form-item label="Электронная почта" required>
        <el-input v-model="form.email" name="email" required />
      </el-form-item>

      <el-form-item label="Пароль" required>
        <el-input v-model="form.password" type="password" show-password name="password" required />
      </el-form-item>

      <el-form-item label="Повторите пароль" required>
        <el-input
          v-model="form.passwordConfirm"
          type="password"
          show-password
          name="passwordConfirm"
          required
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" native-type="submit">Зарегистрировать аккаунт</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
import CsrfTokenValue from '@/components/CsrfTokenValue.vue';

export default {
  name: 'registration-view',
  components: { CsrfTokenValue },
  data: () => ({
    form: {
      firstName: null,
      lastName: null,
      username: null,
      email: null,
      password: null,
      passwordConfirm: null,
    },
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
    if (this.queryParams) {
      this.form.email = this.queryParams.email;
      this.form.firstName = this.queryParams.firstName;
      this.form.lastName = this.queryParams.lastName;
    }
  },
};
</script>
