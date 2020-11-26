import get from 'lodash/get';
import http from '@/utils/api';
import * as MUTATIONS from '@/store/consts';

const PER_PAGE_DEFAULT = 12;

const createState = () => ({
  fullList: null,
  list: null,
  pagination: null,
  params: null,
  single: null,
});

const createActions = ({ module }) => ({
  async getList({ commit }, rawParams = {}) {
    const {
      perPage,
      query,
    } = rawParams;

    const params = {
      perPage: perPage || PER_PAGE_DEFAULT,
    };

    if (query && query.length) {
      params.query = query;
    }

    try {
      const response = await http.get(`${module}`, { params });
      commit(MUTATIONS.SET_LIST, response.data.results);
      commit(MUTATIONS.SET_PAGINATION, response.data);

      return response.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  getNextPage({ state, dispatch }, { id, page, ...rawParams } = {}) {
    const { perPage, currentPage } = state.pagination;
    const params = { ...rawParams, perPage, page: page || currentPage + 1 };
    return dispatch('refreshList', { id, ...params });
  },

  async refreshList({ state, commit }, rawParams = {}) {
    const perPage = get(state, 'pagination.perPage', PER_PAGE_DEFAULT);
    const params = { perPage, ...rawParams };

    try {
      const response = await http.get(`${module}`, { params });
      commit(MUTATIONS.SET_LIST, response.data.results);
      commit(MUTATIONS.SET_PAGINATION, response.data);

      return response.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  async getItem({ commit }, id) {
    try {
      const response = await http.get(`/${module}/${id}`);
      commit(MUTATIONS.SET_SINGLE, response.data);
      return response.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  async create({ commit }, params) {
    try {
      const response = await http.post(`/${module}`, params);
      commit(MUTATIONS.SET_SINGLE, response.data);
      return response.data;
    } catch (e) {
      console.log(e);
      throw e;
    }
  },

  clearSingle({ commit }) {
    commit(MUTATIONS.SET_SINGLE, null);
  },

  async update({ commit }, params) {
    try {
      const response = await http.put(`/${module}/${params.id}`, params);
      commit(MUTATIONS.SET_SINGLE, response.data);
      return response.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  async remove({ dispatch }, itemId) {
    await http.delete(`/${module}/${itemId}`);
    return dispatch('getList');
  },
});

const createMutations = () => ({
  [MUTATIONS.SET_LIST](state, payload) {
    state.list = payload;
  },

  [MUTATIONS.SET_PAGINATION](state, payload) {
    const { paginationMeta } = payload;
    if (!paginationMeta) return;

    state.pagination = {
      _meta: paginationMeta,

      hasMore: paginationMeta.currentPage < paginationMeta.total,
      lastPage: paginationMeta.lastPage,
      perPage: paginationMeta.perPage,
      currentPage: paginationMeta.currentPage,
    };
  },

  [MUTATIONS.SET_SINGLE](state, payload) {
    state.single = payload;
  },
});

export default function createListModule(options = {}) {
  if (process.env.NODE_ENV !== 'production') {
    if (!('module' in options)) {
      console.warn('[App warn]: createListModule options does has endpoint prop');
    }
  }

  return {
    namespaced: true,
    state: createState(options),
    actions: createActions(options),
    mutations: createMutations(options),
  };
}
