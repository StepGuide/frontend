<template>
  <div class="main-page">
    <!-- 상단 네비게이션 -->
    <nav class="navbar">
      <div class="nav-content">
        <div class="logo">
          <span class="logo-text">KB 금융 도우미</span>
        </div>
        <div class="nav-actions">
          <button class="notification-btn">
            <span class="notification-icon">🔔</span>
          </button>
          <button class="profile-btn">
            <span class="profile-icon">👤</span>
          </button>
          <button class="mode-toggle-btn" @click="toggleToGuardianMode">
            <span class="toggle-text">보호자 모드</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- 메인 콘텐츠 -->
    <div class="main-content">
      <!-- 환영 메시지 -->
      <div class="welcome-section">
        <div class="welcome-content">
          <h1 class="welcome-title">안녕하세요, 김영희님!</h1>
          <p class="welcome-subtitle">
            오늘도 안전하게 금융 서비스를 이용해보세요
          </p>
        </div>
        <div class="help-request-card">
          <div class="help-content">
            <!-- 헤더 섹션 -->
            <div class="help-header">
              <div class="help-title-section">
                <h3>전문가 도움 요청</h3>
                <p>6자리 코드로 실시간 상담 연결</p>
              </div>
            </div>

            <!-- 코드가 생성되지 않은 상태 -->
            <div v-if="!generatedCode" class="code-generation-section">
              <div class="generation-info">
                <div class="info-item">
                  <span class="info-icon">🔐</span>
                  <span class="info-text">보안 연결</span>
                </div>
                <div class="info-item">
                  <span class="info-icon">⚡</span>
                  <span class="info-text">즉시 연결</span>
                </div>
                <div class="info-item">
                  <span class="info-icon">👨‍💼</span>
                  <span class="info-text">전문가 상담</span>
                </div>
              </div>

              <button
                class="help-request-btn"
                @click="generateHelpCode"
                :disabled="isLoading"
              >
                <div class="btn-content">
                  <span v-if="isLoading" class="loading-spinner"></span>
                  <span class="btn-text">
                    {{ isLoading ? '코드 생성 중...' : '도움 요청하기' }}
                  </span>
                </div>
              </button>

              <p v-if="errorMessage" class="error-message">
                {{ errorMessage }}
              </p>
            </div>

            <!-- 코드가 생성된 상태 -->
            <div v-else class="generated-code-section">
              <div class="success-header"></div>

              <div class="code-display">
                <!-- 연결 상태 표시 -->
                <div class="connection-status">
                  <div
                    class="status-indicator"
                    :class="{ connected: isGuardianConnected }"
                  >
                    <span class="status-dot"></span>
                    <span class="status-text">
                      {{
                        isGuardianConnected
                          ? '보호자 연결됨'
                          : '보호자 연결 대기 중'
                      }}
                    </span>
                  </div>
                </div>

                <div class="code-label">연결 코드</div>
                <div class="code-box">
                  <span class="code-text">{{ generatedCode }}</span>
                  <button
                    class="copy-btn"
                    @click="copyCode"
                    :disabled="isCopying"
                  >
                    <span v-if="isCopying" class="copy-spinner"></span>
                    <span v-else class="copy-icon">📋</span>
                  </button>
                </div>

                <div class="code-instruction">
                  <span class="instruction-icon">💡</span>
                  <span>이 코드를 보호자에게 알려주세요</span>
                </div>

                <!-- 디버깅 정보 -->
                <div
                  class="debug-info"
                  style="font-size: 10px; color: #999; margin-top: 10px"
                >
                  <div>보호자 연결됨: {{ isGuardianConnected }}</div>
                  <div>
                    연결 해제 신호: {{ helpCodeStore.connectionTerminated }}
                  </div>
                  <div>코드: {{ helpCode }}</div>
                </div>
              </div>

              <div class="action-buttons">
                <button
                  class="action-btn secondary"
                  @click="generateNewCode"
                  :disabled="isLoading"
                >
                  <span v-if="isLoading">생성 중...</span>
                  <span v-else>새 코드</span>
                </button>
                <button
                  class="action-btn"
                  :class="{ primary: !generatedCode, danger: generatedCode }"
                  @click="toggleConnection"
                  :disabled="!helpCode"
                >
                  <span v-if="generatedCode">연결 끊기</span>
                  <span v-else>연결하기</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 계좌 정보 -->
      <div class="account-overview">
        <div class="section-header">
          <h2>내 계좌 현황</h2>
          <button class="view-all-btn" @click="goToAccountOverview">
            전체보기
          </button>
        </div>
        <div class="account-grid">
          <div class="account-card primary">
            <div class="card-header">
              <img
                :src="primaryBankInfo.image"
                :alt="primaryBankInfo.name"
                class="card-icon"
              />
              <div class="card-title">KB국민은행</div>
            </div>
            <div class="balance-info">
              <div class="balance-label">총 잔액</div>
              <div class="balance-amount">₩ 2,450,000</div>
              <div class="account-number">{{ accountNumber }}</div>
            </div>
            <div class="card-actions">
              <button class="action-btn transfer" @click="goToTransfer">
                이체
              </button>
              <button class="action-btn" @click="goToInquiry">조회</button>
            </div>
          </div>

          <div class="account-card secondary">
            <div class="card-header">
              <div class="card-icon">📊</div>
              <div class="card-title">최근 거래</div>
            </div>
            <div class="transaction-list">
              <div class="transaction-item">
                <div class="transaction-info">
                  <span class="transaction-type income">입금</span>
                  <span class="transaction-desc">월급</span>
                </div>
                <span class="transaction-amount income">+₩ 500,000</span>
              </div>
              <div class="transaction-item">
                <div class="transaction-info">
                  <span class="transaction-type expense">출금</span>
                  <span class="transaction-desc">ATM</span>
                </div>
                <span class="transaction-amount expense">-₩ 50,000</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 주요 서비스 -->
      <div class="services-section">
        <div class="section-header">
          <h2>주요 서비스</h2>
        </div>
        <div class="services-grid">
          <div class="service-card">
            <div class="service-icon">💳</div>
            <h3>이체하기</h3>
            <p>안전하고 간편한 계좌이체</p>
            <button class="service-btn primary" @click="goToTransfer">
              이용하기
            </button>
          </div>

          <div class="service-card">
            <div class="service-icon">🎯</div>
            <h3>연습 모드</h3>
            <p>실제 계좌에 영향 없이 연습</p>
            <button class="service-btn" @click="goToPractice">연습하기</button>
          </div>

          <div class="service-card">
            <div class="service-icon">🔒</div>
            <h3>보안설정</h3>
            <p>계좌 보안 관리</p>
            <button class="service-btn">설정하기</button>
          </div>

          <div class="service-card">
            <div class="service-icon">⭐</div>
            <h3>즐겨찾기</h3>
            <p>계좌 즐겨찾기 관리</p>
            <button class="service-btn" @click="goToAccountFavorites">
              즐겨찾기
            </button>
          </div>

          <div class="service-card">
            <div class="service-icon">📚</div>
            <h3>금융교육</h3>
            <p>안전한 금융 이용법</p>
            <button class="service-btn">학습하기</button>
          </div>
        </div>
      </div>

      <!-- 빠른 도움말 -->
      <div class="quick-help">
        <div class="help-grid">
          <div class="help-item">
            <div class="help-icon">❓</div>
            <span>이체 방법</span>
          </div>
          <div class="help-item">
            <div class="help-icon">❓</div>
            <span>보안 설정</span>
          </div>
          <div class="help-item">
            <div class="help-icon">❓</div>
            <span>계좌 조회</span>
          </div>
          <div class="help-item">
            <div class="help-icon">❓</div>
            <span>비밀번호 변경</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { createHelpRequest } from '@/api/index';
import { getBankInfo, extractBankCode } from '@/utils/bankMapping';
import { useHelpCodeStore } from '@/stores/helpCode';
import { useWebSocketUser } from '@/utils/useWebSocketUser';

const router = useRouter();
const isLoading = ref(false);
const isCopying = ref(false);
const errorMessage = ref('');
const generatedCode = ref('');

// 도움 요청 코드 store
const helpCodeStore = useHelpCodeStore();

// 웹소켓 연결 상태 감지
const helpCode = computed(() => {
  return helpCodeStore.generatedCode;
});

// 웹소켓 연결 (동적으로 코드 변경 감지)
const {
  connected: isWebSocketConnected,
  guardianMessage,
  connect: connectWebSocket,
  disconnect: disconnectWebSocket,
} = useWebSocketUser(null);

// 보호자 연결 상태 (실제 보호자 메시지 수신 여부로 판단)
const isGuardianConnected = ref(false);

// 보호자 메시지 감지하여 연결 상태 업데이트
watch(guardianMessage, (newMessage) => {
  if (newMessage && newMessage.trim()) {
    console.log('📨 MainPage 보호자 메시지 수신:', newMessage);
    isGuardianConnected.value = true;
  }
});

// 코드 변경 감지하여 웹소켓 재연결
watch(
  helpCode,
  (newCode, oldCode) => {
    console.log('🔄 MainPage 코드 변경됨:', oldCode, '->', newCode);
    if (newCode && newCode !== oldCode) {
      // 기존 연결 해제 후 새 코드로 재연결
      disconnectWebSocket();
      // 보호자 연결 상태 초기화
      isGuardianConnected.value = false;
      setTimeout(() => {
        connectWebSocket(newCode);
        console.log('🔗 MainPage 새 코드로 웹소켓 재연결:', newCode);
      }, 500);
    }
  },
  { immediate: true }
);

// 계좌 정보
const accountNumber = ref('004-123456-78-90'); // KB국민은행 계좌번호
const secondaryAccountNumber = ref('004-987654-32-10'); // KB국민은행 계좌번호

// 은행 정보 computed
const primaryBankInfo = computed(() => {
  const bankCode = extractBankCode(accountNumber.value);
  return getBankInfo(bankCode);
});

const secondaryBankInfo = computed(() => {
  const bankCode = extractBankCode(secondaryAccountNumber.value);
  return getBankInfo(bankCode);
});

// 보호자 모드로 전환
const toggleToGuardianMode = () => {
  router.push('/guardian');
};

// 도움 요청 코드 생성
const generateHelpCode = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';

    // 사용자 ID (실제로는 인증된 사용자 ID를 사용해야 함)
    const userId = 'user123'; // 실제 사용자 ID로 변경 필요

    // 도움 요청 코드 생성 - API에서 6자리 코드 문자열을 직접 반환
    const helpCode = await createHelpRequest(userId);

    console.log('생성된 도움 요청 코드:', helpCode);
    generatedCode.value = helpCode;
    // store에도 저장
    helpCodeStore.setGeneratedCode(helpCode);
  } catch (error) {
    console.error('도움 요청 생성 실패:', error);
    errorMessage.value = '도움 요청 생성에 실패했습니다. 다시 시도해주세요.';

    // 에러 발생 시 기본 코드 생성
    generatedCode.value = '123456';
  } finally {
    isLoading.value = false;
  }
};

// 새 코드 생성
const generateNewCode = async () => {
  // 기존 코드를 지우지 말고 새로운 코드를 생성
  await generateHelpCode();
};

// 코드 복사
const copyCode = async () => {
  try {
    isCopying.value = true;
    await navigator.clipboard.writeText(generatedCode.value);
    // 복사 성공 피드백 (선택사항)
    console.log('코드가 클립보드에 복사되었습니다:', generatedCode.value);
  } catch (error) {
    console.error('코드 복사 실패:', error);
    errorMessage.value = '코드 복사에 실패했습니다.';
  } finally {
    isCopying.value = false;
  }
};

// 연결 상태 토글
const toggleConnection = () => {
  console.log('🔌 MainPage toggleConnection 호출됨');
  console.log('🔌 MainPage isGuardianConnected:', isGuardianConnected.value);
  console.log('🔌 MainPage generatedCode:', generatedCode.value);
  console.log('🔌 MainPage helpCode:', helpCode.value);
  console.log('🔌 MainPage store 상태:', {
    generatedCode: helpCodeStore.generatedCode,
    isConnectionDisabled: helpCodeStore.isConnectionDisabled,
    connectionTerminated: helpCodeStore.connectionTerminated,
  });

  // 코드가 생성되어 있으면 연결 끊기로 처리
  if (generatedCode.value) {
    console.log('🔌 MainPage 연결 끊기 시작 (코드 존재)');

    // 연결 끊기 처리
    disconnectWebSocket();
    isGuardianConnected.value = false;
    helpCodeStore.disableConnection(); // store에 연결 비활성화 상태 저장
    helpCodeStore.terminateConnection(); // GuardianView에 연결 해제 신호 전송

    console.log(
      '🔌 MainPage store 연결 비활성화 완료:',
      helpCodeStore.isConnectionDisabled
    );
    console.log(
      '🔌 MainPage 연결 해제 신호 설정 완료:',
      helpCodeStore.connectionTerminated
    );

    // 연결 끊기 시 초기화면으로 돌아가기
    generatedCode.value = '';
    helpCodeStore.clearGeneratedCode();

    console.log('🔌 MainPage 코드 초기화 완료');
    console.log('🔌 MainPage 최종 store 상태:', {
      generatedCode: helpCodeStore.generatedCode,
      isConnectionDisabled: helpCodeStore.isConnectionDisabled,
      connectionTerminated: helpCodeStore.connectionTerminated,
    });

    alert('보호자와의 연결이 끊어졌습니다.');
  } else {
    console.log('🔌 MainPage 연결하기 시작');
    // 보호자가 연결되지 않은 상태라면 도움 요청 시작
    if (!helpCode.value) {
      alert('먼저 도움 요청 코드를 생성해주세요.');
      return;
    }
    // 웹소켓 연결 시도
    connectWebSocket(helpCode.value);
    helpCodeStore.enableConnection(); // store에 연결 활성화 상태 저장
    alert(
      `도움 요청이 시작되었습니다!\n코드: ${helpCode.value}\n\n보호자가 이 코드를 입력하면 실시간 채팅이 가능합니다.`
    );
  }
};

// 이체 페이지로 이동
const goToTransfer = () => {
  // router.push('/transfer')
  router.push('/accountTransfer')
}

// 조회 페이지로 이동
const goToInquiry = () => {
  router.push('/inquiry');
};

// 계좌 현황 전체보기 페이지로 이동
const goToAccountOverview = () => {
  router.push('/account-overview');
};

// 연습모드 페이지로 이동
const goToPractice = () => {
  router.push('/practice/PracticeMainPage');
};

// 계좌 즐겨찾기 페이지로 이동
const goToAccountFavorites = () => {
  router.push('/account-favorites');
};
</script>

<style scoped>
/* CSS 변수 정의 - KB국민은행 공식 브랜드 컬러 */
.main-page {
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

  --white: #ffffff;
  --black: #000000;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);

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
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, sans-serif;
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
  padding: 12px 20px;
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

.mode-toggle-btn {
  background: var(--kb-yellow-positive);
  color: var(--white);
  border: none;
  padding: 12px 20px;
  border-radius: var(--radius-xl);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: var(--shadow);
}

.mode-toggle-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.toggle-icon {
  font-size: 18px;
}

.toggle-text {
  font-size: 15px;
  font-weight: 600;
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
  padding: 12px;
}

/* 환영 섹션 */
.welcome-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.welcome-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px 0;
}

.welcome-title {
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 4px;
  color: var(--kb-gray);
  letter-spacing: -1px;
  line-height: 1.2;
}

.welcome-subtitle {
  font-size: 14px;
  color: var(--kb-dark-gray);
  line-height: 1.6;
  font-weight: 500;
}

/* 도움 요청 카드 - KB국민은행 스타일 */
.help-request-card {
  background: var(--white);
  border-radius: 12px;
  padding: 0;
  color: var(--gray-800);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  min-height: 180px;
  transition: all 0.3s ease;
}

.help-request-card::before {
  display: none;
}

.help-content {
  padding: 12px;
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 헤더 섹션 */
.help-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding-bottom: 0;
}

.help-icon {
  font-size: 20px;
  background: var(--gray-100);
  padding: 6px;
  border-radius: 8px;
  color: var(--gray-600);
}

.help-title-section h3 {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 1px 0;
  color: var(--gray-800);
  letter-spacing: -0.2px;
}

.help-title-section p {
  font-size: 12px;
  margin: 0;
  color: var(--gray-600);
  font-weight: 500;
}

/* 코드 생성 정보 */
.generation-info {
  display: flex;
  justify-content: space-around;
  margin-bottom: 12px;
  padding: 8px;
  background: var(--gray-50);
  border-radius: 8px;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.info-icon {
  font-size: 16px;
  background: var(--gray-100);
  padding: 4px;
  border-radius: 4px;
  color: var(--gray-600);
}

.info-text {
  font-size: 10px;
  color: var(--gray-600);
  font-weight: 500;
}

/* 도움 요청 버튼 */
.help-request-btn {
  background: #605850;
  color: var(--white);
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  min-height: 40px;
  margin-top: auto;
}

.help-request-btn:hover:not(:disabled) {
  background: #4a433c;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.help-request-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid var(--white);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-message {
  color: var(--danger);
  font-size: 14px;
  margin-top: 12px;
  text-align: center;
  font-weight: 500;
}

/* 코드 생성 섹션 */
.code-generation-section {
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 160px;
  transition: all 0.3s ease;
}

.generated-code-section {
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 160px;
  transition: all 0.3s ease;
}

/* 성공 헤더 */
.success-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px;
  background: var(--gray-50);
  border-radius: 6px;
}

.success-icon {
  font-size: 16px;
  background: var(--success);
  padding: 4px;
  border-radius: 4px;
  color: var(--white);
}

.success-icon.guardian-connected {
  background: var(--kb-yellow-positive);
  font-size: 18px;
}

.success-header h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: var(--gray-800);
}

.guardian-connected-title {
  color: var(--kb-yellow-positive) !important;
  font-weight: 700 !important;
}

/* 코드 표시 */
.code-display {
  margin-bottom: 12px;
}

.code-label {
  font-size: 10px;
  color: var(--gray-600);
  margin-bottom: 6px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.code-box {
  background: var(--white);
  border-radius: 10px;
  padding: 12px;
  margin: 8px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

.code-text {
  font-size: 24px;
  font-weight: 700;
  color: var(--kb-yellow-positive);
  letter-spacing: 2px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
  flex: 1;
  text-align: center;
}

.copy-btn {
  background: var(--gray-100);
  color: var(--gray-600);
  border: 1px solid var(--gray-300);
  padding: 6px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
}

.copy-btn:hover:not(:disabled) {
  background: var(--gray-200);
  border-color: var(--gray-400);
  transform: scale(1.05);
}

.copy-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.copy-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid var(--white);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 연결 상태 표시 */
.connection-status {
  margin: 0 0 16px 0;
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--radius);
  font-size: 13px;
  font-weight: 500;
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.status-indicator.connected {
  background: #f0fdf4;
  color: #059669;
  border: 1px solid #bbf7d0;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #dc2626;
}

.status-indicator.connected .status-dot {
  background: #059669;
}

.code-instruction {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  color: var(--gray-600);
  margin-top: 12px;
  font-weight: 500;
  padding: 8px;
  background: var(--gray-50);
  border-radius: 6px;
}

.instruction-icon {
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 16px;
  margin-top: auto;
  justify-content: center;
}

.action-btn {
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid;
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.action-btn.primary {
  background: var(--kb-yellow-positive);
  color: var(--white);
  border-color: var(--kb-yellow-positive);
  box-shadow: 0 2px 4px rgba(255, 188, 0, 0.2);
}

.action-btn.primary:hover:not(:disabled) {
  background: var(--primary-dark);
  border-color: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 188, 0, 0.3);
}

.action-btn.secondary {
  background: #605850;
  color: var(--white);
  border-color: #605850;
}

.action-btn.danger {
  background: #dc2626;
  color: var(--white);
  border-color: #dc2626;
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
}

.action-btn.danger:hover:not(:disabled) {
  background: #b91c1c;
  border-color: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3);
}

.action-btn.secondary:hover:not(:disabled) {
  background: #4a433c;
  border-color: #4a433c;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-icon {
  font-size: 16px;
}

/* 섹션 헤더 - TOSS 스타일 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 0;
}

.section-header h2 {
  font-size: 32px;
  font-weight: 800;
  color: var(--kb-gray);
  letter-spacing: -0.5px;
}

.view-all-btn {
  background: var(--accent-light);
  color: var(--kb-gray);
  border: 1px solid var(--kb-gray);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  padding: 12px 24px;
  border-radius: var(--radius-xl);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-all-btn:hover {
  background: var(--kb-gray);
  color: var(--white);
  transform: translateY(-1px);
}

/* 계좌 정보 - TOSS 스타일 */
.account-overview {
  margin-bottom: 16px;
}

.account-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.account-card {
  background: var(--white);
  border-radius: var(--radius-2xl);
  padding: 16px;
  box-shadow: var(--shadow-lg);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.account-card:hover {
  box-shadow: var(--shadow-xl);
  transform: translateY(-4px);
}

.account-card.primary {
  background: linear-gradient(
    135deg,
    var(--white) 0%,
    var(--primary-light) 100%
  );
}

.account-card.secondary {
  background: linear-gradient(
    135deg,
    var(--white) 0%,
    var(--accent-light) 100%
  );
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.card-icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
  border-radius: var(--radius-lg);
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--kb-gray);
  letter-spacing: -0.3px;
}

.balance-info {
  margin-bottom: 12px;
}

.balance-label {
  font-size: 14px;
  color: var(--kb-dark-gray);
  margin-bottom: 8px;
  font-weight: 500;
}

.balance-amount {
  font-size: 28px;
  font-weight: 700;
  color: var(--kb-yellow-positive);
  margin-bottom: 6px;
  letter-spacing: -0.5px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
}

.account-number {
  font-size: 14px;
  color: var(--kb-gray);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
  font-weight: 500;
  background: var(--accent-light);
  padding: 6px 10px;
  border-radius: var(--radius);
  display: inline-block;
  letter-spacing: 0.5px;
}

.card-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  background: #605850;
  color: var(--white);
  border: none;
  padding: 12px 20px;
  border-radius: var(--radius-xl);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow);
  flex: 1;
}

.action-btn:hover {
  background: #4a433c;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.action-btn.transfer {
  background: var(--kb-yellow-positive);
}

.action-btn.transfer:hover {
  background: var(--primary-dark);
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--white);
  border-radius: 12px;
  margin-bottom: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.transaction-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.transaction-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.transaction-type {
  font-size: 14px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 8px;
  display: inline-block;
  width: fit-content;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.transaction-type.income {
  color: #059669;
  background: #d1fae5;
  border: 1px solid rgba(5, 150, 105, 0.2);
}

.transaction-type.expense {
  color: #dc2626;
  background: #fee2e2;
  border: 1px solid rgba(220, 38, 38, 0.2);
}

.transaction-desc {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
  flex: 1;
}

.transaction-amount {
  font-weight: 700;
  font-size: 20px;
  letter-spacing: -0.5px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
}

.transaction-amount.income {
  color: #059669;
}

.transaction-amount.expense {
  color: #dc2626;
}

/* 서비스 섹션 - TOSS 스타일 */
.services-section {
  margin-bottom: 16px;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.service-card {
  background: var(--white);
  border-radius: var(--radius-2xl);
  padding: 20px 16px;
  text-align: center;
  box-shadow: var(--shadow-lg);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.service-card:hover {
  box-shadow: var(--shadow-xl);
  transform: translateY(-4px);
}

.service-card::before {
  display: none;
}

.service-icon {
  font-size: 36px;
  margin-bottom: 12px;
  color: var(--kb-yellow-positive);
  background: var(--primary-light);
  padding: 12px;
  border-radius: var(--radius-lg);
  display: inline-block;
}

.service-card h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--kb-gray);
  letter-spacing: -0.3px;
}

.service-card p {
  font-size: 14px;
  color: var(--kb-dark-gray);
  margin-bottom: 16px;
  line-height: 1.6;
  font-weight: 500;
}

.service-btn {
  background: #605850;
  color: var(--white);
  border: none;
  padding: 12px 20px;
  border-radius: var(--radius-xl);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow);
  width: 100%;
}

.service-btn:hover {
  background: #4a433c;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.service-btn.primary {
  background: var(--kb-yellow-positive);
}

.service-btn.primary:hover {
  background: var(--primary-dark);
}

/* 빠른 도움말 - TOSS 스타일 */
.quick-help {
  margin-bottom: 16px;
}

.help-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.help-item {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow);
}

.help-item:hover {
  background: var(--primary-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.help-item .help-icon {
  font-size: 20px;
  color: var(--kb-yellow-positive);
  background: var(--primary-light);
  padding: 6px;
  border-radius: var(--radius);
}

.help-item span {
  font-size: 14px;
  font-weight: 600;
  color: var(--kb-gray);
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

  .account-grid {
    grid-template-columns: 1fr;
  }

  .services-grid {
    grid-template-columns: 1fr;
  }

  .help-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .welcome-title {
    font-size: 32px;
  }

  .balance-amount {
    font-size: 32px;
  }

  .section-header h2 {
    font-size: 24px;
  }

  .card-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
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

  .help-grid {
    grid-template-columns: 1fr;
  }

  .welcome-title {
    font-size: 28px;
  }

  .balance-amount {
    font-size: 28px;
  }

  .service-card {
    padding: 24px 20px;
  }

  .account-card {
    padding: 20px;
  }

  .code-text {
    font-size: 20px;
    letter-spacing: 1px;
  }

  .code-display h4 {
    font-size: 18px;
  }

  .action-btn {
    padding: 12px 20px;
    font-size: 14px;
  }
}
</style>
