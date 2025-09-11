<template>
  <div class="main-page">
    <!-- 상단 네비게이션 -->
    <nav class="navbar">
      <div class="nav-content">
        <div class="logo" v-tts:MAIN_INTRO.hover="'SERVICE_OVERVIEW'">
          <img src="/images/login/logo.png" alt="금융 도우미" class="logo-image" />
        </div>
        <div class="nav-actions">
      <!-- 로그인 안됨: 카카오 로그인 버튼 -->
      <button v-if="!auth.isLoggedIn" class="mode-toggle-btn login-btn" @click="goLogin">
        로그인
      </button>
      <!-- 로그인 됨: 로그아웃 + (옵션) 보호자 푸시 테스트 -->
        <button v-else class="mode-toggle-btn logout-btn" @click="kakaoHardLogout">
    로그아웃
  </button>
  <button
            class="mode-toggle-btn"
            @click="toggleToGuardianMode"
            v-tts:SERVICE_GUIDE.hover="'GUARDIAN_MODE_INFO'"
          >
            <span class="toggle-text">보호자 모드</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- 숨겨진 비디오 요소 (WebRTC 용) -->
    <video
      ref="localVideo"
      autoplay
      muted
      playsinline
      style="display: none"
    ></video>

    <!-- 메인 콘텐츠 -->
    <div class="main-content">
      <!-- 환영 메시지 -->
      <div class="welcome-section">
        <div
          class="welcome-content"
          v-tts:MAIN_INTRO.auto="'TIME_BASED_WELCOME'"
        >
          <h1 class="welcome-title">안녕하세요, {{ userName }}님!</h1>
          <p class="welcome-subtitle">
            오늘도 안전하게 금융 서비스를 이용해보세요
          </p>
        </div>
        <div class="help-request-card" v-tts:HELP_GUIDE.hover="'GUARDIAN_HELP'">
          <div class="help-content">
            <!-- 헤더 섹션 -->
            <div class="help-header">
              <div class="help-title-section">
                <h3 v-tts:ONBOARDING.auto="'WELCOME_BACK'">도움이 필요하세요?</h3>
                <p>6자리 코드로 실시간 상담 연결</p>
              </div>
            </div>

            <!-- 코드가 생성되지 않은 상태 -->
            <div v-if="!helpCode" class="code-generation-section">
              <div class="generation-info">
                <div
                  class="info-item"
                  v-tts:SERVICE_GUIDE.hover="'SECURITY_INFO'"
                >
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
                v-tts:HELP_GUIDE.focus="'HOW_TO_USE'"
              >
                <div class="btn-content">
                  <span v-if="isLoading" class="loading-spinner"></span>
                  <span class="btn-text">
                    {{ isLoading ? '코드 생성 중...' : '도움 요청하기' }}
                  </span>
                </div>
              </button>

              <div v-if="errorMessage" class="error-message">
                <span class="error-icon">⚠️</span>
                <span>{{ errorMessage }}</span>
              </div>
            </div>

            <!-- 코드가 생성된 상태 -->
            <div v-else class="generated-code-section">
              <div class="success-header"></div>

              <div class="code-display">
                <!-- 연결 상태 표시 -->
                <div class="connection-status">
                  <div
                    class="status-indicator"
                    :class="{ 
                      connected: isGuardianConnected && !helpCodeStore.isCheckingConnection,
                      checking: helpCodeStore.isCheckingConnection
                    }"
                  >
                    <span class="status-dot"></span>
                    <span class="status-text">
                      {{
                        helpCodeStore.isCheckingConnection
                          ? '연결 상태 확인 중...'
                          : isGuardianConnected
                          ? '보호자 연결됨'
                          : '보호자 연결 대기 중'
                      }}
                    </span>
                  </div>
                </div>

                <div class="code-label">연결 코드</div>
                <div class="code-box">
                  <span class="code-text">{{ helpCode }}</span>
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
                  <div>화면 공유 중: {{ isSharing }}</div>
                  <div>WebRTC 연결됨: {{ isSharing }}</div>
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

                <!-- 화면 공유 버튼 -->
                <button
                  v-if="isGuardianConnected"
                  class="action-btn screen-share"
                  :class="{ 'sharing': isSharing }"
                  @click="toggleScreenShare"
                  :disabled="!isGuardianConnected || !isWebSocketConnected"
                >
                  <span class="btn-icon">{{ isSharing ? '🛑' : '📺' }}</span>
                  <span class="btn-text">
                    {{ isSharing ? '화면 공유 중지' : '화면 공유 시작' }}
                  </span>
                </button>

                <button
                  class="action-btn"
                  :class="{ 'primary': !helpCode, 'danger': helpCode }"
                  @click="toggleConnection"
                  :disabled="!helpCode"
                >
                  <span v-if="helpCode">연결 끊기</span>
                  <span v-else>연결하기</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 계좌 정보 -->
      <div class="account-overview">
        <div class="account-grid">
          <div
            class="account-card primary"
            v-tts:SERVICE_GUIDE.hover="'ACCOUNT_INFO'"
          >
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
              <div class="balance-amount">₩ {{ formatNumber(totalBalance) }}</div>
              <div class="account-number">{{ primaryAccountNumber }}</div>
            </div>
            <div class="card-actions">
              <button
                class="action-btn transfer"
                @click="goToTransfer"
                v-tts:SERVICE_GUIDE.focus="'TRANSFER_INFO'"
              >
                이체
              </button>
              <button class="view-all-btn" @click="goToAccountOverview"
          v-tts:INTERACTION_GUIDE.hover="'BUTTON_HOVER'">
            전체보기
          </button>
            </div>
          </div>

          <div class="account-card secondary">
            <div class="card-header">
               <div class="card-title">최근 거래</div>
            </div>
            <div class="transaction-list">
              <div
                v-for="t in recentTransactions"
                :key="t.id"
                class="transaction-item"
              >
                <div class="transaction-info">
                  <span class="transaction-type" :class="t.amount > 0 ? 'income' : 'expense'">{{ t.amount > 0 ? '입금' : '출금' }}</span>
                  <span class="transaction-desc">{{ t.description || '거래' }}</span>
                </div>
                <span class="transaction-amount" :class="t.amount > 0 ? 'income' : 'expense'">
                  {{ t.amount > 0 ? '+' : '-' }}₩ {{ formatNumber(Math.abs(t.amount)) }}
                </span>
              </div>
            </div>
            <button
                class="action-btn"
                @click="goToInquiry"
                v-tts:SERVICE_GUIDE.focus="'ACCOUNT_INFO'"
              >
                조회
              </button>
          </div>
        </div>
      </div>

      <!-- 주요 서비스 -->
      <div class="services-section">
        <div class="section-header">
          <h2 v-tts:MAIN_INTRO.hover="'FEATURES_INTRO'">주요 서비스</h2>
        </div>
        <div class="services-grid">
          <div
            class="service-card"
            @mouseover="onServiceCardHover('transfer')"
            v-tts:SERVICE_GUIDE.hover="'TRANSFER_INFO'"
          >
            <div class="service-icon">💳</div>
            <h3>이체하기</h3>
            <p>안전하고 간편한 계좌이체</p>
            <button class="service-btn primary" @click="goToTransfer">
              이용하기
            </button>
          </div>

          <div
            class="service-card"
            @mouseover="onServiceCardHover('practice')"
            v-tts:SERVICE_GUIDE.hover="'PRACTICE_INFO'"
          >
            <div class="service-icon">🎯</div>
            <h3>연습 모드</h3>
            <p>실제 계좌에 영향 없이 연습</p>
            <button class="service-btn" @click="goToPractice">연습하기</button>
          </div>

          <div
            class="service-card"
            @mouseover="onServiceCardHover('security')"
            v-tts:SERVICE_GUIDE.hover="'SECURITY_INFO'"
          >
            <div class="service-icon">🔒</div>
            <h3>보안설정</h3>
            <p>계좌 보안 관리</p>
            <button class="service-btn">설정하기</button>
          </div>

          <div
            class="service-card"
            @mouseover="onServiceCardHover('favorites')"
            v-tts:SERVICE_GUIDE.hover="'FAVORITES_INFO'"
          >
            <div class="service-icon">⭐</div>
            <h3>즐겨찾기</h3>
            <p>계좌 즐겨찾기 관리</p>
            <button class="service-btn" @click="goToAccountFavorites">
              즐겨찾기
            </button>
          </div>

          <div
            class="service-card"
            @mouseover="onServiceCardHover('education')"
            v-tts:SERVICE_GUIDE.hover="'EDUCATION_INFO'"
          >
            <div class="service-icon">📚</div>
            <h3>금융교육</h3>
            <p>안전한 금융 이용법</p>
            <button class="service-btn" @click="goToEducation">학습하기</button>
          </div>
        </div>
      </div>

      <!-- 빠른 도움말 -->

    </div>
  </div>
  <GuardianPhoneModal 
    :open="showGuardianModal" 
    @close="skipGuardian"
    @saved="handleGuardianSaved"
  />
</template>

<script setup>
import { ref, computed, watch, onMounted, inject } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { createHelpRequest } from '@/api/index';
import { getBankInfo, extractBankCode } from '@/utils/bankMapping';
import { useHelpCodeStore } from '@/stores/helpCode';
import { useWebSocketUser } from '@/utils/useWebSocketUser';
import { useScreenShareStore } from '@/stores/screenShare';
import GuardianPhoneModal from './GuardianPhoneModal.vue';
import api from '@/api/axios';

const auth = useAuthStore();
const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
const LOGOUT_REDIRECT_URI = import.meta.env.VITE_KAKAO_LOGOUT_REDIRECT_URI;
const REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;

// 상태
const me = ref(null);
const showGuardianModal = ref(false);

const router = useRouter();
const isLoading = ref(false);
const isCopying = ref(false);
const errorMessage = ref('');

const showIntro = ref(true);
const showHelpTips = ref(false);
const currentTips = ref([]);
// 도움 요청 코드 store
const helpCodeStore = useHelpCodeStore();
const authStore = useAuthStore();

// 웹소켓 연결/메시지
const helpCode = computed(() => helpCodeStore.generatedCode);

// 사용자 이름 가져오기
const userName = computed(() => {
  // API에서 가져온 사용자 정보 사용
  if (me.value && me.value.username) {
    console.log('👤 computed userName:', me.value.username);
    return me.value.username;
  }
  // 사용자 정보가 없으면 기본값 사용
  console.log('⚠️ 사용자 이름이 없어서 기본값 사용');
  return '사용자';
});

const {
  connected: isWebSocketConnected,
  guardianMessage,
  connect: connectWebSocket,
  disconnect: disconnectWebSocket,
  client,
} = useWebSocketUser(null);

// 화면 공유 store
const screenShareStore = useScreenShareStore();
const localVideo = ref(null);
const { isSharing, isConnected } = screenShareStore;

// 보호자 연결 상태
const isGuardianConnected = computed(() => helpCodeStore.isGuardianConnected)

const tts = inject('tts'); // TTS 주입

const startInteractiveTour = () => {
  if (tts) {
    tts.speak('HELP_GUIDE', 'HOW_TO_USE');
  }

  const tourSteps = [
    { selector: '.account-card', message: 'ACCOUNT_INFO' },
    { selector: '.service-card:first-child', message: 'TRANSFER_INFO' },
    { selector: '.help-request-card', message: 'GUARDIAN_HELP' },
    { selector: '.service-card:nth-child(2)', message: 'PRACTICE_INFO' },
  ];

  tourSteps.forEach((step, index) => {
    setTimeout(() => {
      highlightElement(step.selector);
      if (tts) {
        tts.speak('SERVICE_GUIDE', step.message);
      }
    }, index * 4000);
  });
};
// 보호자 메시지 감지
watch(guardianMessage, (newMessage) => {
  if (newMessage && newMessage.trim()) {
    console.log('📨 MainPage 보호자 메시지 수신:', newMessage)
    console.log('🔍 현재 상태:', {
      helpCode: helpCode.value,
      currentGuardianConnected: helpCodeStore.isGuardianConnected,
      messageLength: newMessage.length,
      messageType: typeof newMessage
    })
    
    // 보호자 연결 신호인지 확인
    if (newMessage === 'GUARDIAN_CONNECTED') {
      helpCodeStore.setGuardianConnected(true)
      console.log('✅ 보호자 연결 감지됨!')
      // 사용자에게 연결 확인 응답 보내기 (지연 시간 단축)
      if (client && client.connected && helpCode.value) {
        setTimeout(() => {
          client.publish({
            destination: `/app/message/${helpCode.value}`,
            body: 'USER_CONNECTION_CONFIRMED'
          })
          console.log('📤 사용자 연결 확인 응답 전송됨')
        }, 100) // 500ms → 100ms로 단축
      }
    } else if (newMessage === 'GUARDIAN_DISCONNECTED') {
      helpCodeStore.setGuardianConnected(false)
      console.log('❌ 보호자 연결 해제 감지됨!')
    } else if (newMessage === 'GUARDIAN_CONNECTION_ALIVE') {
      // 보호자 연결 상태 확인 응답
      helpCodeStore.setGuardianConnected(true)
      console.log('✅ 보호자 연결 상태 확인됨 (페이지 복원)')
      
      // 타임아웃 취소
      if (window.guardianCheckTimeout) {
        clearTimeout(window.guardianCheckTimeout)
        window.guardianCheckTimeout = null
        console.log('⏰ 보호자 연결 확인 타임아웃 취소됨')
      }
    } else {
      // 일반 메시지 수신 시 연결 상태로 판단 (단, 빈 메시지나 시스템 메시지 제외)
      if (newMessage.trim() && 
          !newMessage.startsWith('SYSTEM_') && 
          !newMessage.startsWith('ERROR_') &&
          !newMessage.startsWith('USER_CONNECTION') && // 사용자가 보낸 연결 확인 메시지 제외
          newMessage !== 'ping' && 
          newMessage !== 'pong') {
        helpCodeStore.setGuardianConnected(true)
        console.log('✅ 보호자 일반 메시지 수신으로 연결 상태 확인됨:', newMessage)
      } else {
        console.log('⚠️ 시스템 메시지나 사용자 발신 메시지 무시됨:', newMessage)
      }
    }
  }
});

// 코드 변경 시 재연결
watch(guardianMessage, (newMessage) => {
  if (newMessage && newMessage.trim()) {
    console.log('📨 MainPage 보호자 메시지 수신:', newMessage)
    console.log('🔍 현재 상태:', {
      helpCode: helpCode.value,
      currentGuardianConnected: helpCodeStore.isGuardianConnected,
      messageLength: newMessage.length,
      messageType: typeof newMessage
    })
    
    // 보호자 연결 신호인지 확인
    if (newMessage === 'GUARDIAN_CONNECTED') {
      helpCodeStore.setGuardianConnected(true)
      console.log('✅ 보호자 연결 감지됨!')
      // 사용자에게 연결 확인 응답 보내기 (지연 시간 단축)
      if (client && client.connected && helpCode.value) {
        setTimeout(() => {
          client.publish({
            destination: `/app/message/${helpCode.value}`,
            body: 'USER_CONNECTION_CONFIRMED'
          })
          console.log('📤 사용자 연결 확인 응답 전송됨')
        }, 100) // 500ms → 100ms로 단축
      }
    } else if (newMessage === 'GUARDIAN_DISCONNECTED') {
      helpCodeStore.setGuardianConnected(false)
      console.log('❌ 보호자 연결 해제 감지됨!')
    } else if (newMessage === 'GUARDIAN_CONNECTION_ALIVE') {
      // 보호자 연결 상태 확인 응답
      helpCodeStore.setGuardianConnected(true)
      console.log('✅ 보호자 연결 상태 확인됨 (페이지 복원)')
      
      // 타임아웃 취소
      if (window.guardianCheckTimeout) {
        clearTimeout(window.guardianCheckTimeout)
        window.guardianCheckTimeout = null
        console.log('⏰ 보호자 연결 확인 타임아웃 취소됨')
      }
    } else {
      // 일반 메시지 수신 시 연결 상태로 판단 (단, 빈 메시지나 시스템 메시지 제외)
      if (newMessage.trim() && 
          !newMessage.startsWith('SYSTEM_') && 
          !newMessage.startsWith('ERROR_') &&
          !newMessage.startsWith('USER_CONNECTION') && // 사용자가 보낸 연결 확인 메시지 제외
          newMessage !== 'ping' && 
          newMessage !== 'pong') {
        helpCodeStore.setGuardianConnected(true)
        console.log('✅ 보호자 일반 메시지 수신으로 연결 상태 확인됨:', newMessage)
      } else {
        console.log('⚠️ 시스템 메시지나 사용자 발신 메시지 무시됨:', newMessage)
      }
    }
  }
});

// 코드 변경 감지하여 웹소켓 재연결
watch(helpCode, (newCode, oldCode) => {
  console.log('🔄 MainPage 코드 변경됨:', oldCode, '->', newCode)
  if (newCode && newCode !== oldCode) {
    // 기존 연결 해제 후 새 코드로 재연결
    disconnectWebSocket()
    // 보호자 연결 상태 초기화
    helpCodeStore.setGuardianConnected(false)
    
    // WebRTC 코드 업데이트 (store를 통해)
    if (screenShareStore.helpCode !== newCode) {
      // 새로운 코드로 WebRTC 인스턴스 재초기화
      screenShareStore.initializeWebRTC(newCode, client)
      console.log('🔄 WebRTC 코드 업데이트됨:', newCode)
    }
    
    setTimeout(() => {
      connectWebSocket(newCode)
      // WebRTC 시그널링도 재설정
      setupWebRTCSignaling()
      console.log('🔗 MainPage 새 코드로 웹소켓 재연결:', newCode)
    }, 500)
  }
}, { immediate: true })

// WebSocket 연결 상태 감지 - 연결 완료 시 필요한 경우에만 보호자 상태 확인
watch(isWebSocketConnected, (newConnected, oldConnected) => {
  if (newConnected && !oldConnected && helpCode.value && !helpCodeStore.isGuardianConnected) {
    console.log('🔗 WebSocket 연결 완료 감지, 보호자 상태 확인 시작')
    setTimeout(() => {
      checkGuardianConnectionStatus()
    }, 200)
  }
})

// 계좌 정보
// 메인 계좌/총잔액/최근 거래 (API 연동)
const primaryAccount = ref(null)
const primaryAccountNumber = computed(() => primaryAccount.value?.accountNumber || '')
const totalBalance = ref(0)
const recentTransactions = ref([])

// 은행 정보
const primaryBankInfo = computed(() => {
  const bankCode = extractBankCode(primaryAccountNumber.value);
  return getBankInfo(bankCode);
});
const secondaryBankInfo = computed(() => getBankInfo('004'))

// 라우팅
const toggleToGuardianMode = () => router.push('/guardian');
const goToTransfer = () => {
  console.log('[MainPage] goToTransfer clicked, primaryAccount:', primaryAccount.value)
  if (primaryAccount.value?.accountId) {
    router.push({ path: '/accountTransfer', query: { accountId: primaryAccount.value.accountId } })
  } else {
    console.warn('[MainPage] primaryAccount.accountId 없음. 일반 이동 처리')
    router.push('/accountTransfer')
  }
}
const goToInquiry = () => {
  console.log('[MainPage] goToInquiry clicked, primaryAccount:', primaryAccount.value)
  if (primaryAccount.value?.accountId) {
    router.push({ path: '/inquiry', query: { accountId: primaryAccount.value.accountId } })
  } else {
    console.warn('[MainPage] primaryAccount.accountId 없음. 일반 이동 처리')
    router.push('/inquiry')
  }
}
const goToAccountOverview = () => router.push('/account-overview');
const goToPractice = () => router.push('/practice/PracticeMainPage');
const goToAccountFavorites = () => router.push('/account-favorites');
const goToEducation = () => router.push('/education');

// 숫자 포맷터
const formatNumber = (num) => new Intl.NumberFormat('ko-KR').format(num || 0)

// 도움 요청 코드 생성
const generateHelpCode = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';

    const userId = 'user123';
    const helpCodeResult = await createHelpRequest(userId);

    // 🎵 코드 생성 시 숫자를 하나씩 읽어주기
    if (tts) {
      setTimeout(() => {
        tts.speakDigits(helpCodeResult, '인증 코드가 생성되었습니다.');
      }, 500);
    }

    helpCodeStore.setGeneratedCode(helpCodeResult);
  } catch (error) {
    console.error('도움 요청 생성 실패:', error);
    errorMessage.value = '도움 요청 생성에 실패했습니다. 다시 시도해주세요.';
    helpCodeStore.setGeneratedCode('123456');
  } finally {
    isLoading.value = false;
  }
};



const generateNewCode = async () => {
  await generateHelpCode();
};

// WebSocket을 통한 보호자 연결 상태 확인
const checkGuardianConnectionStatus = () => {
  console.log('🔍 checkGuardianConnectionStatus 호출됨')
  
  if (!helpCode.value) {
    console.log('⚠️ 도움 코드가 없어서 연결 상태 확인 불가')
    helpCodeStore.setGuardianConnected(false)
    return
  }
  
  console.log('🔍 WebSocket을 통한 보호자 연결 상태 확인:', helpCode.value)
  
  // 초기 상태를 false로 설정하고 확인 시작 (중요!)
  console.log('🔄 연결 상태 확인 시작 - false로 초기화')
  helpCodeStore.setGuardianConnected(false)
  helpCodeStore.setCheckingConnection(true)
  
  // WebSocket 연결 확인 후 보호자에게 상태 확인 메시지 전송
  const attemptStatusCheck = () => {
    if (client && client.connected && isWebSocketConnected.value) {
      try {
        console.log('📤 보호자 연결 상태 확인 요청 전송')
        client.publish({
          destination: `/app/message/${helpCode.value}`,
          body: 'USER_CONNECTION_CHECK'
        })
        
        // 1.5초 후에도 응답이 없으면 연결 해제 상태로 확정 (2초 → 1.5초로 단축)
        const timeoutId = setTimeout(() => {
          if (!helpCodeStore.isGuardianConnected) {
            console.log('⚠️ 보호자 연결 확인 응답 없음 - 연결 해제 상태 확정')
            helpCodeStore.setGuardianConnected(false)
          }
        }, 1500) // 2000ms → 1500ms로 단축
        
        // 응답을 받으면 타임아웃 취소하도록 ID 저장
        window.guardianCheckTimeout = timeoutId
      } catch (error) {
        console.error('❌ 보호자 연결 상태 확인 실패:', error)
        helpCodeStore.setGuardianConnected(false)
      }
    } else {
      console.log('⏳ WebSocket 연결 대기 중...')
      setTimeout(attemptStatusCheck, 300) // 500ms → 300ms로 단축
    }
  }
  
  attemptStatusCheck()
};

// 코드 복사
const copyCode = async () => {
  try {
    isCopying.value = true;
    await navigator.clipboard.writeText(helpCode.value);

    // 🎵 코드 복사 시 음성 안내
    if (tts) {
      tts.speak('SYSTEM', 'CODE_COPIED');
    }
  } catch (error) {
    console.error('코드 복사 실패:', error);
    errorMessage.value = '코드 복사에 실패했습니다.';
  } finally {
    isCopying.value = false;
  }
};

// 화면 공유 토글
const toggleScreenShare = async () => {
  try {
    // WebSocket 연결 상태 확인
    if (!isWebSocketConnected.value) {
      errorMessage.value = 'WebSocket에 연결되지 않았습니다. 먼저 도움 요청 코드를 생성해주세요.';
      return;
    }

    // 보호자 연결 상태 확인
    if (!isGuardianConnected.value) {
      errorMessage.value = '보호자가 연결되지 않았습니다. 보호자가 연결될 때까지 기다려주세요.';
      return;
    }

    if (isSharing.value) {
      // 화면 공유 중지
      screenShareStore.stopScreenShare()
      console.log('🛑 화면 공유 중지됨')
    } else {
      // 화면 공유 시작
      try {
        await screenShareStore.startScreenShare()
        console.log('📺 화면 공유 시작됨')
      } catch (error) {
        console.error('❌ 화면 공유 시작 실패:', error)
        errorMessage.value = '화면 공유에 실패했습니다: ' + error.message
        throw error
      }
    }
  } catch (error) {
    console.error('❌ 화면 공유 토글 실패:', error)
    errorMessage.value = '화면 공유에 실패했습니다: ' + error.message
  }
}

// WebRTC 시그널링 구독
const setupWebRTCSignaling = () => {
  if (!client) {
    console.log('⚠️ STOMP 클라이언트 준비 전');
    return;
  }
  // STOMP 연결 상태 확인
  if (!client.connected) {
    console.log('⚠️ STOMP 연결이 아직 완료되지 않음. 2초 후 재시도...');
    setTimeout(() => {
      setupWebRTCSignaling();
    }, 2000);
    return;
  }

  console.log('✅ STOMP 연결 확인. 시그널링 구독 시작...');
  const webrtcMethods = screenShareStore.getWebRTCMethods()
  if (!webrtcMethods || !webrtcMethods.handleAnswer) {
    console.warn('⚠️ WebRTC 메서드를 사용할 수 없습니다. WebRTC 인스턴스를 먼저 초기화해주세요.');
    return;
  }

  try {
    // Answer 수신
    client.subscribe(`/topic/webrtc/answer/${helpCode.value || '123456'}`, (message) => {
      console.log('📥 Answer 메시지 수신:', message.body);
      const data = JSON.parse(message.body);
      if (data.type === 'answer') {
        console.log('✅ Answer 타입 확인됨, 처리 시작...');
        webrtcMethods.handleAnswer(new RTCSessionDescription(data));
      } else {
        console.warn('⚠️ 잘못된 Answer 타입:', data.type);
      }
    });

    // ICE 후보 수신
    client.subscribe(`/topic/webrtc/ice/${helpCode.value || '123456'}`, (message) => {
      console.log('📥 ICE 후보 메시지 수신:', message.body);
      const data = JSON.parse(message.body);
      if (data.type === 'ice-candidate') {
        console.log('✅ ICE 후보 타입 확인됨, 처리 시작...');
        webrtcMethods.handleIceCandidate(data.candidate);
      } else {
        console.warn('⚠️ 잘못된 ICE 후보 타입:', data.type);
      }
    });

    // 연결 종료 수신
    client.subscribe(`/topic/webrtc/end/${helpCode.value || '123456'}`, (message) => {
      console.log('📥 연결 종료 메시지 수신:', message.body);
      const data = JSON.parse(message.body);
      if (data.type === 'end') {
        console.log('✅ 연결 종료 타입 확인됨, 처리 시작...');
        webrtcMethods.handleEnd();
      } else {
        console.warn('⚠️ 잘못된 연결 종료 타입:', data.type);
      }
    });

    console.log('✅ WebRTC 시그널링 구독 완료');
  } catch (error) {
    console.error('❌ WebRTC 시그널링 구독 실패:', error);
  }
};

// 연결 상태 토글
const toggleConnection = () => {
  console.log('🔌 MainPage toggleConnection 호출됨');
  console.log('🔌 MainPage isGuardianConnected:', isGuardianConnected.value);
  console.log('🔌 MainPage helpCode:', helpCode.value);
  console.log('🔌 MainPage store 상태:', {
    generatedCode: helpCodeStore.generatedCode,
    isConnectionDisabled: helpCodeStore.isConnectionDisabled,
    connectionTerminated: helpCodeStore.connectionTerminated,
  });

  // 코드가 생성되어 있으면 연결 끊기로 처리
  if (helpCode.value) {
    console.log('🔌 MainPage 연결 끊기 시작 (코드 존재)');

    // 연결 끊기 처리
    disconnectWebSocket();
    helpCodeStore.setGuardianConnected(false);
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

// 서비스 카드 호버 시 상세 설명
const onServiceCardHover = (serviceType) => {
  if (tts && tts.isEnabled.value) {
    const messages = {
      transfer: 'TRANSFER_INFO',
      practice: 'PRACTICE_INFO',
      account: 'ACCOUNT_INFO',
      education: 'EDUCATION_INFO',
      security: 'SECURITY_INFO',
    };

    if (messages[serviceType]) {
      tts.speak('SERVICE_GUIDE', messages[serviceType]);
    }
  }
};


// ---------- 마운트 시: WebRTC 초기화 대기 & 시그널링 설정 ----------
onMounted(() => {
  console.log('🚀 MainPage 마운트됨')
  
  // 지능적인 초기 상태 설정
  console.log('🔄 현재 상태 확인:', {
    helpCode: helpCode.value,
    isWebSocketConnected: isWebSocketConnected.value,
    isGuardianConnected: helpCodeStore.isGuardianConnected
  })
  
  // WebSocket이 이미 연결되어 있고 보호자도 연결된 상태라면 초기화하지 않음
  if (helpCode.value && isWebSocketConnected.value && client?.connected && helpCodeStore.isGuardianConnected) {
    console.log('✅ 이미 연결된 상태 - 초기화 건너뛰기')
    // 상태 유지, 추가 확인 불필요
  } else {
    // 연결 상태가 불확실한 경우에만 초기화 및 확인
    console.log('🔄 연결 상태 불확실 - 초기화 후 확인')
    helpCodeStore.setGuardianConnected(false)
    
    if (helpCode.value) {
      helpCodeStore.setCheckingConnection(true)
    }
  }
  
  if (helpCode.value) {
    console.log('🔄 기존 코드 감지:', helpCode.value)
  }
  
  // 기존 코드가 있다면 연결 상태 복원 (필요한 경우에만)
  if (helpCode.value && !helpCodeStore.isGuardianConnected) {
    console.log('🔄 기존 코드 감지, 연결 상태 복원 시작:', helpCode.value)
    
    // 즉시 상태 확인 시도 (WebSocket이 이미 연결되어 있을 수 있음)
    if (isWebSocketConnected.value && client && client.connected) {
      console.log('✅ WebSocket 이미 연결됨 - 즉시 상태 확인')
      setTimeout(() => {
        checkGuardianConnectionStatus()
      }, 100) // 즉시 확인
    } else {
      // WebSocket 재연결을 안전하게 시도
      const attemptReconnection = () => {
        if (!isWebSocketConnected.value) {
          console.log('🔗 WebSocket 재연결 시도')
          try {
            connectWebSocket(helpCode.value)
            
            // 연결 완료 후 보호자 상태 확인
            setTimeout(() => {
              checkGuardianConnectionStatus()
            }, 600)
            
          } catch (error) {
            console.error('❌ WebSocket 재연결 실패:', error)
          }
        } else {
          console.log('✅ WebSocket 재연결 완료 - 상태 확인')
          setTimeout(() => {
            checkGuardianConnectionStatus()
          }, 200)
        }
      }
      
      // 300ms 후 재연결 시도
      setTimeout(attemptReconnection, 300)
    }
  } else if (helpCode.value && helpCodeStore.isGuardianConnected) {
    console.log('✅ 이미 보호자 연결된 상태 - 추가 확인 불필요')
  }
  
  // WebRTC 인스턴스 초기화를 위한 함수
  const initializeWebRTCIfReady = () => {
    if (helpCode.value && client) {
      console.log('🔧 WebRTC 인스턴스 초기화:', helpCode.value)
      const webrtcInstance = screenShareStore.initializeWebRTC(helpCode.value, client)
      
      // localVideo ref 연결
      if (webrtcInstance && webrtcInstance.localVideo) {
        webrtcInstance.localVideo.value = localVideo.value
      }
      
      // WebRTC 시그널링 설정
      setTimeout(() => {
        setupWebRTCSignaling(webrtcInstance);
      }, 1000);
    } else {
      console.log('⏳ WebRTC 초기화 대기 중... (helpCode:', helpCode.value, ', client:', !!client, ')')
      // 1초 후 재시도
      setTimeout(initializeWebRTCIfReady, 1000);
    }
  }
  
  initializeWebRTCIfReady()
})

// ---------- 마운트 시: 사용자 정보 조회 & 보호자번호 모달 ----------
onMounted(async () => {
  try {
    console.log('🔍 /api/me API 호출 시작...');
    const { data } = await api.get('/me');
    console.log('📊 /api/me 응답 데이터:', data);
    
    if (data?.isSuccess) {
      me.value = data.result;
      console.log('✅ 사용자 정보 로드 성공:', me.value);
      console.log('👤 사용자 이름:', me.value?.username);
      console.log('📱 전화번호:', me.value?.phoneNumber);
      console.log('🛡️ 보호자 전화번호:', me.value?.guardianPhone);
      
      if (!me.value?.guardianPhone) {
        console.log('⚠️ 보호자 전화번호가 없어서 모달 표시');
        showGuardianModal.value = true;
      }
    } else {
      console.warn('❌ /me 실패:', data?.message);
    }
  } catch (e) {
    console.error('❌ /api/me API 호출 에러:', e);
    console.error('📊 에러 응답:', e?.response?.data);
    console.error('🔢 상태 코드:', e?.response?.status);
    
    if (e?.response?.status === 401) {
      console.log('🔐 인증 실패 - 로그인 페이지로 이동');
      router.replace('/login');
    } else {
      console.error('💥 예상치 못한 에러:', e);
    }
  }
  // 추가: 계좌/거래 조회 (백엔드 오류 대비 안전 가드)
  try {
    const userId = authStore.currentUserId
    console.log('[MainPage] userId:', userId)
    if (userId) {
      const { getUserAccounts, getAccountTransactions, getFirstAccountTransfer } = await import('@/api/accountTransferApi')

      // 1) 전체 계좌 먼저 조회해 총잔액 계산 및 기본 후보 선정
      let accounts = []
      try {
        accounts = await getUserAccounts(userId)
        console.log('[MainPage] getUserAccounts result (len):', accounts?.length, accounts)
        totalBalance.value = (accounts || []).reduce((sum, a) => sum + (a.balance || 0), 0)
        console.log('[MainPage] totalBalance:', totalBalance.value)
        if (!primaryAccount.value && accounts && accounts.length) {
          primaryAccount.value = accounts[0]
          console.log('[MainPage] primaryAccount fallback set from accounts[0]:', primaryAccount.value)
        }
      } catch (e) {
        console.error('[MainPage] getUserAccounts failed:', e?.message || e)
      }

      // 2) 기본 계좌 API가 있으면 우선 적용 (실패해도 화면은 유지)
      try {
        const first = await getFirstAccountTransfer(userId)
        console.log('[MainPage] getFirstAccountTransfer result:', first)
        if (first && first.accountId) {
          primaryAccount.value = first
          console.log('[MainPage] primaryAccount set (from Oneaccounts):', primaryAccount.value)
        }
      } catch (e) {
        console.warn('[MainPage] getFirstAccountTransfer failed (will use fallback):', e?.message || e)
      }

      // 3) 최근 거래 조회 (primaryAccount가 확정된 경우만)
      try {
        if (primaryAccount.value?.accountId) {
          const tx = await getAccountTransactions(primaryAccount.value.accountId)
          console.log('[MainPage] recent transactions raw:', tx)
          recentTransactions.value = (tx || []).slice(0, 5).map((t) => ({
            id: t.transactionId,
            amount: (t.depositWithdrawal === 'DEPOSIT' ? 1 : -1) * (t.transactionAmount || 0),
            description: t.memo || ''
          }))
          console.log('[MainPage] recentTransactions mapped:', recentTransactions.value)
        } else {
          console.warn('[MainPage] primaryAccount.accountId 없음. 최근 거래 조회 생략')
        }
      } catch (e) {
        console.error('[MainPage] getAccountTransactions failed:', e?.message || e)
      }
    }
  } catch (err) {
    console.error('메인 계좌/거래 조회 실패(outer):', err?.message || err, err)
  }
});

// ---------- 보호자 번호 저장 ----------
function skipGuardian() {
  showGuardianModal.value = false;
}

function handleGuardianSaved(phone) {
  me.value = { ...(me.value || {}), guardianPhone: phone };
  showGuardianModal.value = false;
}
// 로그인 
function goLogin() {
  router.push({ name: 'login' });
}

// 로그아웃(내 서비스 로그아웃 + 카카오 로그아웃)
async function kakaoHardLogout() {
  try {
    try { await unregisterPushNotifications(); } catch {}
    await auth.logout(); // 서버 RT 폐기 + 쿠키 삭제 + 프론트 토큰 비움

    const url = new URL('https://kauth.kakao.com/oauth/logout');
    url.searchParams.set('client_id', KAKAO_CLIENT_ID);
    url.searchParams.set('logout_redirect_uri', LOGOUT_REDIRECT_URI);
    window.location.href = url.toString();
  } catch (e) {
    console.error('[kakaoHardLogout] error:', e);
  }
}
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

.logo-image {
  height: 40px;
  width: auto;
  object-fit: contain;
  max-width: 200px;
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
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px 16px;
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #dc2626;
  font-size: 14px;
  font-weight: 600;
  text-align: left;
}

.error-icon {
  font-size: 16px;
  flex-shrink: 0;
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

.status-indicator.checking {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #fde68a;
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

.status-indicator.checking .status-dot {
  background: #d97706;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
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
  background: #605850;
  color: #ffffff;
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
  
  /* 화면 공유 버튼 스타일 */
  .action-btn.screen-share {
    background: var(--kb-blue);
    color: var(--white);
    border: 2px solid var(--kb-blue);
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
  }
  
  .action-btn.screen-share:hover {
    background: var(--kb-blue-dark);
    border-color: var(--kb-blue-dark);
  }
  
  .action-btn.screen-share.sharing {
    background: var(--kb-danger);
    border-color: var(--kb-danger);
  }
  
  .action-btn.screen-share.sharing:hover {
    background: #d32f2f;
    border-color: #d32f2f;
  }
  
  .btn-icon {
    font-size: 16px;
  }
  
  .btn-text {
    font-size: 14px;
    font-weight: 600;
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
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 1050;
}
.modal-box {
  background: #fff;
  width: 100%;
  max-width: 420px;
  border-radius: 12px;
  padding: 16px 16px 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}


.mode-toggle-btn.login-btn {
  background: var(--success);        /*로그인 */
  color: var(--white);
}
.mode-toggle-btn.login-btn:hover {
  background: #2e7d32;               /* hover용 진한 초록 */
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* 로그아웃(빨강) 변형 */
.mode-toggle-btn.logout-btn {
  background: var(--danger);         /* 로그아웃 */
  color: var(--white);
}
.mode-toggle-btn.logout-btn:hover {
  background: #b91c1c;               /* hover용 진한 빨강 */
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
.card-actions .action-btn,
.card-actions .view-all-btn {
  flex: 1;               /* 두 버튼이 동일한 너비를 가지도록 */
  min-width: 0;          /* flex-grow와 충돌하지 않게 */
  padding: 12px 20px;    /* 높이와 내부 여백 동일하게 */
  font-size: 14px;       /* 글자 크기 동일하게 */
  border-radius: var(--radius-xl); /* 모서리 동일하게 */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;              /* 아이콘과 글자 간격 */
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: all 0.2s ease;
}
</style>