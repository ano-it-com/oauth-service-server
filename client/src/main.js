import Vue from 'vue';
import 'roboto-fontface/css/roboto/roboto-fontface.css';
import '@mdi/font/css/materialdesignicons.css';
import moment from 'moment';
import App from './App.vue';
import router from './router';
import store from './store';
import './plugins/element';
import vuetify from './plugins/vuetify';
import { createAsyncDataGuard } from './router/guards';
import topProgress from './utils/plugins/progress';

Vue.config.productionTip = false;

Object.defineProperty(Vue.prototype, '$currentUser', {
  get() {
    return this.$root.currentUser;
  },

  set(v) {
    this.$root.currentUser = v;
  },
});

router.beforeResolve(createAsyncDataGuard({ store, router }));

Vue.use(topProgress);

moment.locale('ru-RU');

new Vue({
  data: () => ({
    // eslint-disable-next-line
    currentUser: window.__APP_DATA__ && window.__APP_DATA__.user,
  }),
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
