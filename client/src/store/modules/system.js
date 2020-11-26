import http from '@/utils/api';

const MUTATIONS = {
  SET_STATISTIC: 'SET_STATISTIC',
};

const state = {
  statistic: null,
};

const actions = {
  async getStatistic({ commit }) {
    const data = await http.get('system-statistic');
    commit(MUTATIONS.SET_STATISTIC, data.data);
  },
};

const mutations = {
  [MUTATIONS.SET_STATISTIC](state, payload) {
    state.statistic = payload;
  },
};

export default {
  namespaced: true,
  state,
  actions,
  mutations,
};
