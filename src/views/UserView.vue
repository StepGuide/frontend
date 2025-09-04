<template>
  <div class="main-page">
    <!-- 상단 네비게이션 -->
    <nav class="navbar">
      <div class="nav-content">
        <div class="logo">
          <span class="logo-icon">🏦</span>
          <span class="logo-text">KB 금융 도우미</span>
        </div>
        <div class="nav-actions">
          <button class="notification-btn">
            <span class="notification-icon">🔔</span>
          </button>
          <button class="profile-btn">
            <span class="profile-icon">👤</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- 메인 콘텐츠 -->
    <div class="main-content">
      <!-- 환영 섹션 -->
      <div class="welcome-section">
        <div class="welcome-content">
          <h1 class="welcome-title">실시간 도움 요청</h1>
          <p class="welcome-subtitle">보호자와 연결되어 실시간 도움을 받을 수 있습니다</p>
        </div>
      </div>

      <!-- 연결 상태 카드 -->
      <div class="connection-card">
        <div class="connection-content">
          <div class="connection-header">
            <div class="connection-icon">
              <span class="status-indicator" :class="{ connected: isConnected }"></span>
            </div>
            <div class="connection-title-section">
              <h3>보호자 연결 상태</h3>
              <p>{{ isConnected ? '연결됨' : '연결 안됨' }}</p>
            </div>
          </div>
          
          <div class="code-display-section">
            <div class="code-info">
              <div class="code-label">도움 요청 코드</div>
              <div class="code-box">
                <span class="code-text">{{ helpCode }}</span>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <button class="action-btn primary" @click="connect" :disabled="isConnected">
              <span class="btn-icon">🔗</span>
              <span>연결</span>
            </button>
            <button class="action-btn secondary" @click="disconnect" :disabled="!isConnected">
              <span class="btn-icon">❌</span>
              <span>연결 종료</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 메시지 섹션 -->
      <div class="message-section">
        <div class="section-header">
          <h2>실시간 메시지</h2>
        </div>
        <div class="message-list">
          <div class="message-item" v-if="lastMessage">
            <div class="message-icon">📬</div>
            <div class="message-content">
              <div class="message-label">마지막 메시지</div>
              <div class="message-text">{{ lastMessage }}</div>
            </div>
          </div>
          <div class="message-item" v-if="guardianMessage">
            <div class="message-icon">🟦</div>
            <div class="message-content">
              <div class="message-label">보호자 메시지</div>
              <div class="message-text">{{ guardianMessage }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useWebSocketUser } from '@/utils/useWebSocketUser';

const route = useRoute();
const isConnected = ref(false);

// URL 쿼리 파라미터에서 코드 가져오기 (없으면 기본값 사용)
const helpCode = computed(() => {
  return route.query.code || "123456";
});

const {
  connect,
  disconnect,
  sendPing,
  sendState,
  lastMessage,
  guardianMessage,
} = useWebSocketUser(helpCode.value);

// 연결 함수 래핑
const handleConnect = () => {
  connect();
  isConnected.value = true;
};

// 연결 종료 함수 래핑
const handleDisconnect = () => {
  disconnect();
  isConnected.value = false;
};

onMounted(() => {
  console.log('사용된 도움 요청 코드:', helpCode.value);
  handleConnect();
});
</script>

<style scoped>
/* CSS 변수 정의 - KB국민은행 공식 브랜드 컬러 */
.main-page {
  /* KB Main Colors */
  --kb-yellow-positive: #FFBC00;  /* KB Yellow Positive - R255 G188 B0 */
  --kb-yellow-negative: #FFCC00;  /* KB Yellow Negative - R255 G204 B0 */
  --kb-gray: #605850;             /* KB Gray - R96 G88 B76 */
  
  /* KB Sub Colors */
  --kb-dark-gray: #545049;        /* KB Dark Gray - R84 G80 B69 */
  --kb-gold: #B8860B;             /* KB Gold (추정) */
  --kb-silver: #C0C0C0;           /* KB Silver (추정) */
  
  /* Derived Colors */
  --primary: var(--kb-yellow-positive);
  --primary-light: #FFF4D6;
  --primary-dark: #E6A600;
  --secondary: var(--kb-yellow-negative);
  --secondary-light: #FFF8E1;
  --accent: var(--kb-gray);
  --accent-light: #F5F4F2;
  --success: #4CAF50;
  --warning: var(--kb-yellow-negative);
  --danger: #F44336;
  
  /* Gray Scale */
  --gray-50: #FAFAFA;
  --gray-100: #F5F5F5;
  --gray-200: #EEEEEE;
  --gray-300: #E0E0E0;
  --gray-400: #BDBDBD;
  --gray-500: #9E9E9E;
  --gray-600: #757575;
  --gray-700: #616161;
  --gray-800: #424242;
  --gray-900: #212121;
  
  --white: #FFFFFF;
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
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.main-page {
  min-height: 100vh;
  background: var(--gray-50);
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--gray-800);
  line-height: 1.6;
}

/* 네비게이션 - TOSS 스타일 */
.navbar {
  background: var(--white);
  border-bottom: 1px solid var(--gray-200);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(8px);
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 32px;
  color: var(--kb-yellow-positive);
}

.logo-text {
  font-size: 22px;
  font-weight: 800;
  color: var(--kb-gray);
  letter-spacing: -0.5px;
}

.nav-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.notification-btn,
.profile-btn {
  background: var(--accent-light);
  border: 1px solid var(--kb-gray);
  padding: 12px;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.notification-btn:hover,
.profile-btn:hover {
  background: var(--kb-gray);
  transform: translateY(-1px);
}

.notification-icon,
.profile-icon {
  font-size: 20px;
  color: var(--kb-gray);
}

/* 메인 콘텐츠 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

/* 환영 섹션 */
.welcome-section {
  margin-bottom: 24px;
}

.welcome-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px 0;
}

.welcome-title {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 6px;
  color: var(--kb-gray);
  letter-spacing: -1px;
  line-height: 1.2;
}

.welcome-subtitle {
  font-size: 16px;
  color: var(--kb-dark-gray);
  line-height: 1.6;
  font-weight: 500;
}

/* 연결 카드 */
.connection-card {
  background: var(--white);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  overflow: hidden;
}

.connection-content {
  padding: 20px;
}

.connection-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.connection-icon {
  width: 40px;
  height: 40px;
  background: var(--primary-light);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #dc2626;
  transition: all 0.3s ease;
}

.status-indicator.connected {
  background: #059669;
}

.connection-title-section h3 {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 2px 0;
  color: var(--gray-800);
}

.connection-title-section p {
  font-size: 13px;
  margin: 0;
  color: var(--gray-600);
  font-weight: 500;
}

/* 코드 표시 */
.code-display-section {
  margin-bottom: 20px;
}

.code-label {
  font-size: 12px;
  color: var(--gray-600);
  margin-bottom: 8px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.code-box {
  background: var(--white);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.code-text {
  font-size: 24px;
  font-weight: 700;
  color: var(--kb-yellow-positive);
  letter-spacing: 2px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
}

/* 액션 버튼 */
.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.action-btn {
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid;
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.action-btn.primary {
  background: var(--kb-yellow-positive);
  color: var(--white);
  border-color: var(--kb-yellow-positive);
}

.action-btn.primary:hover:not(:disabled) {
  background: var(--primary-dark);
  border-color: var(--primary-dark);
  transform: translateY(-1px);
}

.action-btn.secondary {
  background: #605850;
  color: var(--white);
  border-color: #605850;
}

.action-btn.secondary:hover:not(:disabled) {
  background: #4a433c;
  border-color: #4a433c;
  transform: translateY(-1px);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-icon {
  font-size: 16px;
}

/* 메시지 섹션 */
.message-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--kb-gray);
  margin: 0;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  background: var(--white);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
}

.message-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.message-icon {
  font-size: 20px;
  width: 40px;
  height: 40px;
  background: var(--primary-light);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-content {
  flex: 1;
}

.message-label {
  font-size: 12px;
  color: var(--gray-600);
  font-weight: 500;
  margin-bottom: 4px;
}

.message-text {
  font-size: 14px;
  color: var(--gray-800);
  font-weight: 500;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }
  
  .nav-content {
    padding: 16px 20px;
  }
  
  .welcome-section {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .welcome-title {
    font-size: 32px;
  }
  
  .section-header h2 {
    font-size: 24px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 12px;
  }
  
  .code-text {
    font-size: 24px;
    letter-spacing: 2px;
  }
  
  .code-box {
    padding: 16px;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .nav-content {
    padding: 12px 16px;
  }
  
  .main-content {
    padding: 12px;
  }
  
  .welcome-title {
    font-size: 28px;
  }
  
  .action-btn {
    padding: 12px 20px;
    font-size: 14px;
  }
}
</style>
