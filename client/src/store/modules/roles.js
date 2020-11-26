import http from '@/utils/api';
import createListModule from './factories/create-list-module';

const LOCAL_TYPES = {
  SET_ITEMS_LIST: 'SET_ITEMS_LIST',
};

const module = createListModule({ module: 'roles' });

module.state = {
  ...module.state,
  listItems: null,
};

module.actions = {
  ...module.actions,

  async createPermission({ state, dispatch }, data) {
    try {
      const response = await http.post(`roles/${state.single.id}/permissions`, data);
      dispatch('getItem', state.single.id);
      return response.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  async updatePermission({ state, dispatch }, { id, ...data }) {
    try {
      const response = await http.put(`roles/${state.single.id}/permissions/${id}`, data);
      dispatch('getItem', state.single.id);
      return response.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  async getItemsList({ commit }) {
    try {
      const response = await http.get('roles/items-list');
      commit(LOCAL_TYPES.SET_ITEMS_LIST, response.data);
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
};

module.mutations = {
  ...module.mutations,

  [LOCAL_TYPES.SET_ITEMS_LIST](state, payload) {
    state.listItems = payload;
  },
};

export default module;
