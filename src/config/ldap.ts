export default {
  url: process.env.LDAP_URL,
  bindDn: process.env.LDAP_DN,
  bindCredentials: process.env.LDAP_CREDENTIALS_PASSWORD,
  searchBase: process.env.LDAP_SEARCH_BASE,
};
