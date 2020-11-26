import uniqueId from 'lodash/uniqueId';

const LOCAL_TYPES = {
  SHOW_NOTIFY: 'SHOW_NOTIFY',
  REMOVE_NOTIFY: 'REMOVE_NOTIFY',
  CLEAR_LIST: 'CLEAR_LIST',
};

const namespaced = false;

const state = {
  list: [],
};

const getters = {
  notifyList: (state) => state.list,
};

const actions = {
  notify({ commit }, { message, title = '', type = 'error' }) {
    commit(LOCAL_TYPES.SHOW_NOTIFY, {
      id: uniqueId('notification'),
      title,
      message,
      type,
    });
  },

  removeNotify({ commit }, notificationId) {
    commit(LOCAL_TYPES.REMOVE_NOTIFY, notificationId);
  },
};

const mutations = {
  [LOCAL_TYPES.SHOW_NOTIFY](state, payload) {
    const needle = state.list.find((_) => _.message === payload.message && _.type === payload.type);
    if (needle) return;

    state.list.push(payload);
  },

  [LOCAL_TYPES.REMOVE_NOTIFY](state, id) {
    const index = state.list.findIndex((_) => _.id === id);
    state.list.splice(index, 1);
  },
};

export default {
  namespaced,
  getters,
  state,
  actions,
  mutations,
};
