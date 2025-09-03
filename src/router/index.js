import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "main",
      component: () => import("../views/MainPage.vue"),
    },
    {
      path: "/guardian",
      name: "guardian",
      component: () => import("../views/GuardianView.vue"),
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/AboutView.vue"),
    },
    {
      path: "/user",
      name: "user",
      component: () => import("../views/UserView.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/login/LoginPage.vue"),
    },
    {
      path: "/oauth/callback/kakao",
      name: "kakaoCallback",
      component: () => import("../views/login/KakaoCallback.vue"),
    },
    {
      path: "/transfer",
      name: "transfer",
      component: () => import("../views/TransferPage.vue"),
    },
    {
      path: "/inquiry",
      name: "inquiry",
      component: () => import("../views/InquiryPage.vue"),
    },
    {
      path: "/account-overview",
      name: "accountOverview",
      component: () => import("../views/AccountOverviewPage.vue"),
    },
    {
      path: "/practice",
      name: "practice",
      component: () => import("../views/PracticePage.vue"),
    },
    {
      path: "/account-favorites",
      name: "accountFavorites",
      component: () => import("../views/AccountFavoritesPage.vue"),
    },
  ],
});

export default router;
