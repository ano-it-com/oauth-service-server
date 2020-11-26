export default {
  url: process.env.APP_URL,
  security: {
    password: {
      minLength: process.env.APP_PASSWORD_MIN_LENGTH,
      minSecureScore: process.env.APP_PASSWORD_MIN_SECURE_SCORE,
    },
  },
};
