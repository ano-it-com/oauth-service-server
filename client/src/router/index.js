import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'root',
    beforeEnter() {
      window.location.replace('index');
      return null;
    },
  },
  {
    path: '/index',
    name: 'index',
    meta: { isCenteredPage: true },
    component: () => import('@/views/home/Index.vue'),
  },
  {
    name: 'auth',
    path: '/auth',
    component: { template: '<router-view />' },
    children: [
      {
        path: 'login',
        name: 'auth-login',
        meta: { isCenteredPage: true },
        component: () => import('@/views/auth/Login.vue'),
      },
      {
        path: 'register',
        name: 'auth-register',
        meta: { isCenteredPage: true },
        component: () => import('@/views/auth/Registration.vue'),
      },
    ],
  },
  {
    name: 'oauth2',
    path: '/oauth2',
    component: { template: '<router-view />' },
    children: [
      {
        path: 'authorize',
        name: 'oauth2-authorize',
        meta: { isCenteredPage: true },
        component: () => import('@/views/authorize/Index.vue'),
      },
    ],
  },
  {
    path: '/manager',
    component: () => import('@/views/manager/Index.vue'),
    children: [
      {
        path: '',
        name: 'manager-home',
        component: () => import('@/views/manager/Home.vue'),
      },
      {
        path: 'users',
        name: 'manager-users',
        component: () => import('@/views/manager/users/List.vue'),
      },
      {
        path: 'users/:userId',
        name: 'manager-users-item',
        component: () => import('@/views/manager/users/List.vue'),
      },
      {
        path: 'clients',
        name: 'manager-clients',
        component: () => import('@/views/manager/clients/List.vue'),
      },
      {
        path: 'clients/:clientId',
        name: 'manager-clients-item',
        component: () => import('@/views/manager/clients/List.vue'),
      },
      {
        path: 'roles',
        name: 'manager-roles',
        component: () => import('@/views/manager/roles/List.vue'),
      },
      {
        path: 'roles/:roleId',
        name: 'manager-roles-item',
        component: () => import('@/views/manager/roles/List.vue'),
      },
    ],
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
