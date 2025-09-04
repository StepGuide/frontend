import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'main',
      component: () => import('../views/MainPage.vue'),
    },
    {
      path: '/guardian',
      name: 'guardian',
      component: () => import('../views/GuardianView.vue'),
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('../views/UserView.vue'),
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
    {
      path: '/transfer',
      name: 'transfer',
      component: () => import('../views/TransferPage.vue'),
    },
    {
      path: '/inquiry',
      name: 'inquiry',
      component: () => import('../views/InquiryPage.vue'),
    },
    {
      path: '/account-overview',
      name: 'accountOverview',
      component: () => import('../views/AccountOverviewPage.vue'),
    },
    {
      path: '/practice',
      name: 'practice',
      component: () => import('../views/PracticePage.vue'),
    },
    {
      path: '/account-favorites',
      name: 'accountFavorites',
      component: () => import('../views/AccountFavoritesPage/AFMainPage.vue'),
    },
    {
      path: '/account-favorites/add',
      name: 'accountFavoritesAdd',
      component: () => import('../views/AccountFavoritesPage/AFaddPage.vue'),
    },
  ],
});

export default router;
