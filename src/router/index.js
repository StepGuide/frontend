import { createRouter, createWebHistory } from 'vue-router';
import MainPage from '../views/MainPage.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'main',
      component: MainPage,
    },
    {
      path: '/guardian',
      name: 'guardian',
      component: () => import('../views/GuardianMode.vue'),
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/login/LoginPage.vue'),
    },
    {
      path: '/oauth/callback/kakao',
      name: 'kakaoCallback',
      component: () => import('../views/login/KakaoCallback.vue'),
    },
  ],
});

export default router;
