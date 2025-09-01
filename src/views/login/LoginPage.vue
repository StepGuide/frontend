<template>
  <div class="container py-5 text-center">
    <h2 class="mb-4">로그인</h2>
    <button class="btn btn-warning" @click="goKakao">카카오로 로그인</button>
  </div>
</template>

<script setup>
const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;

function goKakao() {
  const authUrl = new URL('https://kauth.kakao.com/oauth/authorize');
  authUrl.searchParams.set('client_id', KAKAO_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');

  window.location.href = authUrl.toString();
}
</script>
