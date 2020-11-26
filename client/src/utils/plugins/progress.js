import { vueTopprogress } from 'vue-top-progress';

const DEFAULT_OPTIONS = { color: '#009688', height: 2 };

function install(Vue, options = {}) {
  if (install.installed) return;
  install.installed = true;

  const propsData = { ...DEFAULT_OPTIONS, ...options };

  const progress = new Vue({
    ...vueTopprogress,
    propsData,
  }).$mount();

  document.body.appendChild(progress.$el);

  Object.defineProperty(Vue.prototype, '$progress', {
    get: () => progress,
  });
}

export default { install };
