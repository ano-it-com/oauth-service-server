// http://eslint.org/docs/user-guide/configuring

module.exports = {
  rules: {
    'no-shadow': [2, { allow: ['state'] }],
    'no-param-reassign': ['error', {
      props: true, ignorePropertyModificationsFor: ['state'],
    }],
  },
};
