<template>
  <div class="container py-5 text-center">
    <h2 class="mb-3">로그인 처리 중...</h2>
    <p class="text-muted">잠시만 기다려주세요.</p>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
const plain = axios.create({ baseURL: '/', withCredentials: true });

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const code = route.query.code;

if (!code) {
  router.replace('/login');
} else {
  (async () => {
    try {
      const { data } = await plain.post('/api/auth/login/kakao', { code });

      // Access 토큰 파싱
      const access =
        (data && data.result && data.result.accessToken) ||
        data?.accessToken ||
        '';

      if (!access) throw new Error('액세스 토큰이 응답에 없습니다.');

      // Pinia에 저장 -> 인터셉터가 이후 요청에 자동 부착
      auth.setToken(access);

      router.replace('/');
    } catch (e) {
      // 실패 시 로그인 페이지로 복귀
      console.error('카카오 로그인 실패:', e);
      router.replace('/login');
    }
  })();
}
</script>
