<template>
  <div class="container py-5 text-center">
    <h2 class="mb-4">로그인</h2>
    <button class="btn btn-warning" @click="goKakao">카카오로 로그인</button>
    <button class="btn btn-outline-secondary" @click="kakaoHardLogout">
      임시 로그아웃
    </button>
    <div class="mt-4">
      <button class="btn btn-danger" @click="sendGuardianAlert">
        보호자에게 이상탐지 푸시 보내기
      </button>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { unregisterPushNotifications } from '@/firebase-init';
import api from '@/api/axios';
const auth = useAuthStore();
const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
const LOGOUT_REDIRECT_URI = import.meta.env.VITE_KAKAO_LOGOUT_REDIRECT_URI;
const REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;

function goKakao() {
  const authUrl = new URL('https://kauth.kakao.com/oauth/authorize');
  authUrl.searchParams.set('client_id', KAKAO_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');

  window.location.href = authUrl.toString();
}

async function kakaoHardLogout() {
  try {
    try {
      await unregisterPushNotifications();
    } catch {}
    await auth.logout(); // 내부에서 쿠키 삭제

    const url = new URL('https://kauth.kakao.com/oauth/logout');
    url.searchParams.set('client_id', KAKAO_CLIENT_ID);
    url.searchParams.set('logout_redirect_uri', LOGOUT_REDIRECT_URI);
    window.location.href = url.toString();
  } catch (e) {
    console.error('[kakaoHardLogout] error:', e);
  }
}
async function sendGuardianAlert() {
  try {
    const { data } = await api.post('/push/alert-guardian', {});
    alert(`전송 성공: ${typeof data === 'string' ? data : 'OK'}`);
  } catch (e) {
    const status = e?.response?.status;
    const msg = e?.response?.data || e?.message || 'unknown';
    alert(
      `전송 실패: ${status ?? ''} ${
        typeof msg === 'string' ? msg : JSON.stringify(msg)
      }`
    );
  }
}
</script>
