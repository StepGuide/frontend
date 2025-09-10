<template>
  <div class="login-page">
    <!-- 메인 콘텐츠 -->
    <div class="main-content">
      <!-- 로고 섹션 -->
      <div class="logo-section">
        <div class="logo-container">
          <img src="/images/login/logo.png" alt="KB국민은행" class="logo-image" />
        </div>
        <h1 class="app-title">KB국민은행</h1>
        <p class="app-subtitle">안전하고 편리한 금융 서비스</p>
      </div>

      <!-- 로그인 섹션 -->
      <div class="login-section">
        <div class="login-card">
          <h2 class="login-title">로그인</h2>
          <p class="login-description">간편하게 로그인하고 서비스를 이용해보세요</p>
          
          <div class="login-buttons">
            <button class="kakao-login-btn" @click="goKakao">
              <img src="/images/login/kakao_login_medium_wide.png" alt="카카오로 로그인" class="kakao-login-image" />
            </button>
          </div>
        </div>
      </div>

      <!-- 개발자 도구 (개발 환경에서만 표시) -->
      <div v-if="isDevelopment" class="dev-tools">
        <div class="dev-section">
          <h3 class="dev-title">개발자 도구</h3>
          <div class="dev-buttons">
            <button class="dev-btn logout-btn" @click="kakaoHardLogout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              로그아웃
            </button>
            <button class="dev-btn alert-btn" @click="sendGuardianAlert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8A6 6 0 0 0 6 8C6 7 6 4 6 4A2 2 0 0 1 8 2H16A2 2 0 0 1 18 4C18 4 18 7 18 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6 8V18A2 2 0 0 0 8 20H16A2 2 0 0 0 18 18V8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="12" y1="10" x2="12" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="9" y1="13" x2="15" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              보호자 알림 테스트
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { unregisterPushNotifications } from '@/firebase-init';
import api from '@/api/axios';

const auth = useAuthStore();
const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
const LOGOUT_REDIRECT_URI = import.meta.env.VITE_KAKAO_LOGOUT_REDIRECT_URI;
const REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;

// 개발 환경 감지
const isDevelopment = ref(import.meta.env.DEV);

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

<style scoped>
.login-page {
  /* KB Main Colors */
  --kb-yellow-positive: #ffbc00; /* KB Yellow Positive - R255 G188 B0 */
  --kb-yellow-negative: #ffcc00; /* KB Yellow Negative - R255 G204 B0 */
  --kb-gray: #605850; /* KB Gray - R96 G88 B76 */

  /* KB Sub Colors */
  --kb-dark-gray: #545049; /* KB Dark Gray - R84 G80 B69 */
  --kb-gold: #b8860b; /* KB Gold (추정) */
  --kb-silver: #c0c0c0; /* KB Silver (추정) */

  /* Derived Colors */
  --primary: var(--kb-yellow-positive);
  --primary-light: #fff4d6;
  --primary-dark: #e6a600;
  --secondary: var(--kb-yellow-negative);
  --secondary-light: #fff8e1;
  --accent: var(--kb-gray);
  --accent-light: #f5f4f2;
  --success: #4caf50;
  --warning: var(--kb-yellow-negative);
  --danger: #f44336;

  /* Gray Scale */
  --gray-50: #fafafa;
  --gray-100: #f5f5f5;
  --gray-200: #eeeeee;
  --gray-300: #e0e0e0;
  --gray-400: #bdbdbd;
  --gray-500: #9e9e9e;
  --gray-600: #757575;
  --gray-700: #616161;
  --gray-800: #424242;
  --gray-900: #212121;

  /* Base Colors */
  --white: #ffffff;
  --black: #000000;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

  /* Border Radius */
  --radius-sm: 6px;
  --radius: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;

  min-height: 100vh;
  background: linear-gradient(135deg, var(--gray-50) 0%, var(--accent-light) 100%);
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--gray-800);
  line-height: 1.6;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.main-content {
  width: 100%;
  max-width: 400px;
  text-align: center;
}

/* 로고 섹션 */
.logo-section {
  margin-bottom: 48px;
}

.logo-container {
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
}

.logo-image {
  width: 80px;
  height: 80px;
  object-fit: contain;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
}

.app-title {
  font-size: 32px;
  font-weight: 800;
  color: var(--accent);
  margin: 0 0 8px;
  letter-spacing: -0.5px;
}

.app-subtitle {
  font-size: 16px;
  color: var(--gray-600);
  margin: 0;
  font-weight: 400;
}

/* 로그인 섹션 */
.login-section {
  margin-bottom: 32px;
}

.login-card {
  background: var(--white);
  border-radius: var(--radius-xl);
  padding: 40px 32px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--gray-200);
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--accent);
  margin: 0 0 8px;
}

.login-description {
  font-size: 14px;
  color: var(--gray-600);
  margin: 0 0 32px;
  line-height: 1.5;
}

.login-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.kakao-login-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  overflow: hidden;
  position: relative;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
}

.kakao-login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: var(--radius-lg);
}

.kakao-login-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.kakao-login-btn:hover::before {
  opacity: 1;
}

.kakao-login-btn:active {
  transform: translateY(0);
}

.kakao-login-image {
  width: 100%;
  height: auto;
  max-width: 300px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  transition: all 0.2s ease;
  display: block;
}

.kakao-login-btn:hover .kakao-login-image {
  box-shadow: var(--shadow-lg);
}

/* 개발자 도구 */
.dev-tools {
  margin-top: 32px;
}

.dev-section {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow);
  border: 1px solid var(--gray-200);
}

.dev-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-700);
  margin: 0 0 16px;
  text-align: left;
}

.dev-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dev-btn {
  background: var(--gray-50);
  color: var(--gray-700);
  border: 1px solid var(--gray-200);
  padding: 12px 16px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: left;
}

.dev-btn:hover {
  background: var(--gray-100);
  border-color: var(--gray-300);
  transform: translateY(-1px);
}

.logout-btn:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: var(--danger);
}

.alert-btn:hover {
  background: #fef3c7;
  border-color: #fde68a;
  color: var(--warning);
}

.dev-btn svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* 반응형 디자인 */
@media (max-width: 480px) {
  .login-page {
    padding: 16px;
  }
  
  .main-content {
    max-width: 100%;
  }
  
  .logo-image {
    width: 64px;
    height: 64px;
  }
  
  .app-title {
    font-size: 28px;
  }
  
  .app-subtitle {
    font-size: 14px;
  }
  
  .login-card {
    padding: 32px 24px;
  }
  
  .login-title {
    font-size: 20px;
  }
  
  .kakao-login-image {
    max-width: 280px;
  }
  
  .dev-section {
    padding: 20px;
  }
}

/* 애니메이션 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.logo-section,
.login-section,
.dev-tools {
  animation: fadeInUp 0.6s ease-out;
}

.login-section {
  animation-delay: 0.2s;
}

.dev-tools {
  animation-delay: 0.4s;
}
</style>
