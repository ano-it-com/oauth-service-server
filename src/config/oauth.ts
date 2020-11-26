export default {
  authCodeTTL: process.env.OAUTH_CODE_TTL || 3600,
  accessTokenTTL: process.env.OAUTH_ACCESS_TOKEN_TTL || 36000,
  refreshTokenTTL: process.env.OAUTH_REFRESH_TOKEN_TTL || 3600000,

  accessTokenType: process.env.OAUTH_ACCESS_TOKEN_TYPE || 'jwt',
};
