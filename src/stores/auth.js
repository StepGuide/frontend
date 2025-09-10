import { defineStore } from 'pinia';
import axios from 'axios';

const plain = axios.create({
  baseURL: '/api',
  withCredentials: true, // RT 쿠키 전송용
});

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null, // Access 토큰
    userId: null, // JWT subject 보관
    refreshing: false, // 리프레시 진행중 표시
    refreshPromise: null, // 중복 갱신 방지용 큐잉
  }),

  getters: {
    isLoggedIn: (s) => !!s.token,
    currentUserId: (s) => s.userId,
  },

  actions: {
    setToken(t) {
      this.token = t;
      this.userId = t ? parseJwtSub(t) : null;
    },

    async refreshAccessToken() {
      // 이미 갱신중이면 기존 Promise 대기
      if (this.refreshPromise) return this.refreshPromise;

      this.refreshing = true;
      this.refreshPromise = (async () => {
        try {
          // RT는 쿠키로 자동 전송됨
          const { data } = await plain.post('/auth/refresh');
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
        await plain.post('/auth/logout'); // RT 폐기 + 쿠키 삭제
      } catch (e) {
        // 이미 쿠키가 없을 수도 있으니 무시
      } finally {
        this.setToken(null);
      }
    },
  },
});
function parseJwtSub(jwt) {
  try {
    const base64url = jwt.split('.')[1];
    if (!base64url) return null;

    // base64url → base64
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    // atob는 base64만 지원하므로 패딩 보정
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '='
    );

    const json = JSON.parse(decodeURIComponent(escape(window.atob(padded))));
    return json?.sub ?? null;
  } catch {
    return null;
  }
}
