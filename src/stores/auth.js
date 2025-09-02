import { defineStore } from 'pinia';
import axios from 'axios';

const plain = axios.create({
  baseURL: '/',
  withCredentials: true, // RT 쿠키 전송용
});

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null, // Access 토큰
    refreshing: false, // 리프레시 진행중 표시
    refreshPromise: null, // 중복 갱신 방지용 큐잉
  }),

  getters: {
    isLoggedIn: (s) => !!s.token,
  },

  actions: {
    setToken(t) {
      this.token = t;
    },

    async refreshAccessToken() {
      // 이미 갱신중이면 기존 Promise 대기
      if (this.refreshPromise) return this.refreshPromise;

      this.refreshing = true;
      this.refreshPromise = (async () => {
        try {
          // RT는 쿠키로 자동 전송됨
          const { data } = await plain.post('/api/auth/refresh');
          const newAccess =
            (data && data.result && data.result.accessToken) ||
            data?.accessToken ||
            '';

          if (!newAccess) {
            throw new Error('No access token in refresh response');
          }

          this.setToken(newAccess);
          return newAccess;
        } finally {
          this.refreshing = false;
          this.refreshPromise = null;
        }
      })();

      return this.refreshPromise;
    },

    async logout() {
      try {
        await plain.post('/api/auth/logout'); // RT 폐기 + 쿠키 삭제
      } catch (e) {
        // 이미 쿠키가 없을 수도 있으니 무시
      } finally {
        this.setToken(null);
      }
    },
  },
});
