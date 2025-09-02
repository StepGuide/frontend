import api from './index';
import { useAuthStore } from '@/stores/auth';

// 요청 인터셉터
api.interceptors.request.use((config) => {
  const auth = useAuthStore();
  if (auth.token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

// 응답 인터셉터
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const auth = useAuthStore();
    const original = error.config;

    if (!original || !error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;

    if (!original._retry && status === 401) {
      original._retry = true;
      try {
        const newAccess = await auth.refreshAccessToken();
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (e) {
        await auth.logout();
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
