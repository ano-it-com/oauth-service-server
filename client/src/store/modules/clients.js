import http from '@/utils/api';
import createListModule from './factories/create-list-module';

const LOCAL_TYPES = {
  SET_ITEMS_LIST: 'SET_ITEMS_LIST',
};

const module = createListModule({ module: 'clients' });

module.state = {
  ...module.state,
  listItems: null,
};

module.actions = {
  ...module.actions,

  async getItemsList({ commit }) {
    try {
      const response = await http.get('clients/items-list');
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
