<template>
  <div class="practice-page">
    <!-- 상단 네비게이션 -->
    <nav class="navbar">
      <div class="nav-content">
        <div class="logo">
          <button class="back-btn" @click="goBack">
            <span class="back-icon">←</span>
          </button>
          <span class="logo-icon">🎯</span>
          <span class="logo-text">연습 모드</span>
        </div>
        <div class="nav-actions">
          <div class="practice-indicator">
            <span class="indicator-icon">🎮</span>
            <span class="indicator-text">연습 중</span>
          </div>
          <button class="help-btn" @click="requestHelp">
            <span class="help-icon">❓</span>
            <span class="help-text">도움</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- 메인 콘텐츠 -->
    <div class="main-content">
      <!-- 연습 모드 안내 -->
      <div class="practice-notice">
        <div class="notice-card">
          <div class="notice-icon">🛡️</div>
          <div class="notice-content">
            <h3>안전한 연습 환경</h3>
            <p>실제 계좌에 영향을 주지 않는 가상 환경에서 금융 서비스를 연습해보세요.</p>
          </div>
        </div>
      </div>

      <!-- 연습 계좌 정보 -->
      <div class="practice-accounts">
        <div class="section-header">
          <h2>연습 계좌</h2>
          <div class="practice-badge">가상 계좌</div>
        </div>

        <div class="account-list">
          <div 
            v-for="account in practiceAccounts" 
            :key="account.id"
            class="account-card"
            :class="{ selected: selectedAccount?.id === account.id }"
            @click="selectAccount(account)"
          >
            <div class="account-header">
              <div class="bank-info">
                <div class="bank-icon">{{ getBankIcon(account.bankCode) }}</div>
                <div class="bank-details">
                  <div class="bank-name">{{ account.bankName }}</div>
                  <div class="account-type">{{ account.accountType }}</div>
                </div>
              </div>
              <div class="practice-indicator">
                <span class="practice-icon">🎯</span>
              </div>
            </div>

            <div class="account-details">
              <div class="account-number">{{ account.accountNumber }}</div>
              <div class="account-name">{{ account.accountName }}</div>
            </div>

            <div class="balance-section">
              <div class="balance-info">
                <div class="balance-label">연습 잔액</div>
                <div class="balance-amount">₩ {{ formatNumber(account.balance) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 연습 기능 선택 -->
      <div v-if="selectedAccount" class="practice-features">
        <div class="section-header">
          <h2>연습할 기능 선택</h2>
          <p>선택한 계좌로 연습할 기능을 선택해주세요</p>
        </div>

        <div class="feature-grid">
          <div class="feature-card" @click="startPractice('transfer')">
            <div class="feature-icon">💸</div>
            <div class="feature-content">
              <h3>이체 연습</h3>
              <p>계좌이체 과정을 단계별로 연습해보세요</p>
              <div class="feature-difficulty">
                <span class="difficulty-label">난이도:</span>
                <span class="difficulty-stars">⭐⭐⭐</span>
              </div>
            </div>
            <button class="feature-btn">연습 시작</button>
          </div>

          <div class="feature-card" @click="startPractice('inquiry')">
            <div class="feature-icon">📋</div>
            <div class="feature-content">
              <h3>조회 연습</h3>
              <p>거래내역 조회 방법을 연습해보세요</p>
              <div class="feature-difficulty">
                <span class="difficulty-label">난이도:</span>
                <span class="difficulty-stars">⭐⭐</span>
              </div>
            </div>
            <button class="feature-btn">연습 시작</button>
          </div>

          <div class="feature-card" @click="startPractice('balance')">
            <div class="feature-icon">💰</div>
            <div class="feature-content">
              <h3>잔액 확인</h3>
              <p>계좌 잔액 확인 방법을 연습해보세요</p>
              <div class="feature-difficulty">
                <span class="difficulty-label">난이도:</span>
                <span class="difficulty-stars">⭐</span>
              </div>
            </div>
            <button class="feature-btn">연습 시작</button>
          </div>

          <div class="feature-card" @click="startPractice('security')">
            <div class="feature-icon">🔒</div>
            <div class="feature-content">
              <h3>보안 설정</h3>
              <p>계좌 보안 설정 방법을 연습해보세요</p>
              <div class="feature-difficulty">
                <span class="difficulty-label">난이도:</span>
                <span class="difficulty-stars">⭐⭐⭐⭐</span>
              </div>
            </div>
            <button class="feature-btn">연습 시작</button>
          </div>
        </div>
      </div>

      <!-- 연습 진행 중 -->
      <div v-if="isPracticing" class="practice-session">
        <div class="session-header">
          <h2>{{ currentPractice.title }}</h2>
          <div class="session-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: practiceProgress + '%' }"></div>
            </div>
            <span class="progress-text">{{ currentStep }} / {{ totalSteps }} 단계</span>
          </div>
        </div>

        <div class="practice-content">
          <div class="step-indicator">
            <div 
              v-for="(step, index) in practiceSteps" 
              :key="index"
              class="step"
              :class="{ 
                active: index === currentStep - 1, 
                completed: index < currentStep - 1 
              }"
            >
              <span class="step-number">{{ index + 1 }}</span>
              <span class="step-text">{{ step.title }}</span>
            </div>
          </div>

          <div class="current-step">
            <div class="step-content">
              <h3>{{ practiceSteps[currentStep - 1]?.title }}</h3>
              <p>{{ practiceSteps[currentStep - 1]?.description }}</p>
              
              <div class="step-actions">
                <div v-if="practiceSteps[currentStep - 1]?.type === 'info'" class="info-step">
                  <div class="info-icon">ℹ️</div>
                  <div class="info-content">
                    <p>{{ practiceSteps[currentStep - 1]?.content }}</p>
                  </div>
                </div>

                <div v-else-if="practiceSteps[currentStep - 1]?.type === 'interaction'" class="interaction-step">
                  <div class="interaction-content">
                    <p>{{ practiceSteps[currentStep - 1]?.content }}</p>
                    <div class="interaction-buttons">
                      <button 
                        v-for="option in practiceSteps[currentStep - 1]?.options" 
                        :key="option.value"
                        class="option-btn"
                        :class="{ correct: option.correct }"
                        @click="selectOption(option)"
                      >
                        {{ option.label }}
                      </button>
                    </div>
                  </div>
                </div>

                <div v-else-if="practiceSteps[currentStep - 1]?.type === 'demo'" class="demo-step">
                  <div class="demo-content">
                    <div class="demo-screen">
                      <div class="demo-header">연습 화면</div>
                      <div class="demo-body">
                        <p>{{ practiceSteps[currentStep - 1]?.content }}</p>
                        <div class="demo-actions">
                          <button class="demo-btn">실제 버튼</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="step-navigation">
            <button 
              v-if="currentStep > 1" 
              class="nav-btn prev-btn" 
              @click="prevStep"
            >
              이전
            </button>
            <button 
              v-if="currentStep < totalSteps" 
              class="nav-btn next-btn" 
              @click="nextStep"
            >
              다음
            </button>
            <button 
              v-if="currentStep === totalSteps" 
              class="nav-btn complete-btn" 
              @click="completePractice"
            >
              연습 완료
            </button>
          </div>
        </div>
      </div>

      <!-- 연습 완료 -->
      <div v-if="practiceCompleted" class="practice-complete">
        <div class="complete-card">
          <div class="complete-icon">🎉</div>
          <h2>연습 완료!</h2>
          <p>{{ currentPractice.title }} 연습을 성공적으로 완료했습니다.</p>
          
          <div class="completion-stats">
            <div class="stat-item">
              <span class="stat-label">완료 시간:</span>
              <span class="stat-value">{{ completionTime }}분</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">정답률:</span>
              <span class="stat-value">{{ accuracy }}%</span>
            </div>
          </div>

          <div class="completion-actions">
            <button class="btn-secondary" @click="resetPractice">다시 연습</button>
            <button class="btn-primary" @click="goToMain">메인으로</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 반응형 데이터
const selectedAccount = ref(null)
const isPracticing = ref(false)
const practiceCompleted = ref(false)
const currentStep = ref(1)
const startTime = ref(null)
const correctAnswers = ref(0)
const totalQuestions = ref(0)

// 연습 계좌 (샘플 데이터)
const practiceAccounts = ref([
  {
    id: 1,
    bankCode: 'KB',
    bankName: 'KB국민은행',
    accountNumber: '999-999999-99-999',
    accountName: '연습용 계좌',
    accountType: '입출금통장',
    balance: 1000000
  },
  {
    id: 2,
    bankCode: 'SHINHAN',
    bankName: '신한은행',
    accountNumber: '999-999-999999',
    accountName: '연습용 계좌',
    accountType: '입출금통장',
    balance: 500000
  }
])

// 현재 연습 정보
const currentPractice = ref({})
const practiceSteps = ref([])

// 계산된 속성
const totalSteps = computed(() => practiceSteps.value.length)
const practiceProgress = computed(() => {
  return totalSteps.value > 0 ? (currentStep.value / totalSteps.value) * 100 : 0
})
const completionTime = computed(() => {
  if (!startTime.value) return 0
  const endTime = new Date()
  const diffMs = endTime - startTime.value
  return Math.round(diffMs / 60000) // 분 단위
})
const accuracy = computed(() => {
  return totalQuestions.value > 0 ? Math.round((correctAnswers.value / totalQuestions.value) * 100) : 100
})

// 연습 시나리오 데이터
const practiceScenarios = {
  transfer: {
    title: '이체 연습',
    steps: [
      {
        title: '이체 시작',
        description: '이체 기능을 시작하는 방법을 알아보세요.',
        type: 'info',
        content: '이체를 시작하려면 메인 화면에서 "이체하기" 버튼을 클릭하세요.'
      },
      {
        title: '계좌 선택',
        description: '출금할 계좌를 선택하는 방법을 연습해보세요.',
        type: 'interaction',
        content: '다음 중 출금 계좌를 선택하는 올바른 방법은?',
        options: [
          { label: '계좌번호를 직접 입력', value: 'input', correct: false },
          { label: '목록에서 계좌를 선택', value: 'select', correct: true },
          { label: 'QR코드로 스캔', value: 'qr', correct: false }
        ]
      },
      {
        title: '이체 정보 입력',
        description: '받는 분의 정보를 입력하는 방법을 연습해보세요.',
        type: 'demo',
        content: '받는 은행, 계좌번호, 받는 분 이름을 순서대로 입력하세요.'
      },
      {
        title: '금액 입력',
        description: '이체할 금액을 입력하는 방법을 연습해보세요.',
        type: 'interaction',
        content: '이체 금액을 입력할 때 주의해야 할 점은?',
        options: [
          { label: '잔액을 확인하지 않아도 됨', value: 'no_check', correct: false },
          { label: '잔액을 먼저 확인해야 함', value: 'check', correct: true },
          { label: '임의의 금액 입력 가능', value: 'any', correct: false }
        ]
      },
      {
        title: '최종 확인',
        description: '이체 정보를 최종 확인하는 방법을 연습해보세요.',
        type: 'info',
        content: '이체 전에 입력한 모든 정보를 다시 한번 확인하고, 정확하면 "이체하기" 버튼을 클릭하세요.'
      }
    ]
  },
  inquiry: {
    title: '조회 연습',
    steps: [
      {
        title: '조회 시작',
        description: '거래내역 조회를 시작하는 방법을 알아보세요.',
        type: 'info',
        content: '거래내역을 조회하려면 메인 화면에서 "조회" 버튼을 클릭하세요.'
      },
      {
        title: '조회 기간 선택',
        description: '조회할 기간을 선택하는 방법을 연습해보세요.',
        type: 'interaction',
        content: '거래내역 조회 시 가장 적절한 기간은?',
        options: [
          { label: '1년', value: 'year', correct: false },
          { label: '1개월', value: 'month', correct: true },
          { label: '1주일', value: 'week', correct: false }
        ]
      },
      {
        title: '조회 결과 확인',
        description: '조회 결과를 확인하는 방법을 연습해보세요.',
        type: 'demo',
        content: '조회된 거래내역에서 입금, 출금, 잔액을 확인할 수 있습니다.'
      }
    ]
  },
  balance: {
    title: '잔액 확인 연습',
    steps: [
      {
        title: '잔액 확인 방법',
        description: '계좌 잔액을 확인하는 방법을 알아보세요.',
        type: 'info',
        content: '계좌 잔액은 메인 화면의 계좌 카드에서 바로 확인할 수 있습니다.'
      },
      {
        title: '상세 잔액 조회',
        description: '더 자세한 잔액 정보를 확인하는 방법을 연습해보세요.',
        type: 'demo',
        content: '계좌를 클릭하면 더 자세한 잔액 정보를 볼 수 있습니다.'
      }
    ]
  },
  security: {
    title: '보안 설정 연습',
    steps: [
      {
        title: '보안 설정 접근',
        description: '보안 설정에 접근하는 방법을 알아보세요.',
        type: 'info',
        content: '보안 설정은 메인 화면의 "보안설정" 메뉴에서 접근할 수 있습니다.'
      },
      {
        title: '비밀번호 변경',
        description: '비밀번호를 변경하는 방법을 연습해보세요.',
        type: 'interaction',
        content: '비밀번호 변경 시 주의해야 할 점은?',
        options: [
          { label: '간단한 비밀번호 사용', value: 'simple', correct: false },
          { label: '복잡한 비밀번호 사용', value: 'complex', correct: true },
          { label: '생년월일 사용', value: 'birth', correct: false }
        ]
      },
      {
        title: '2단계 인증 설정',
        description: '2단계 인증을 설정하는 방법을 연습해보세요.',
        type: 'demo',
        content: '2단계 인증을 설정하면 더욱 안전하게 계좌를 보호할 수 있습니다.'
      }
    ]
  }
}

// 메서드
const goBack = () => {
  router.push('/')
}

const selectAccount = (account) => {
  selectedAccount.value = account
}

const startPractice = (practiceType) => {
  currentPractice.value = practiceScenarios[practiceType]
  practiceSteps.value = [...practiceScenarios[practiceType].steps]
  isPracticing.value = true
  practiceCompleted.value = false
  currentStep.value = 1
  startTime.value = new Date()
  correctAnswers.value = 0
  totalQuestions.value = 0
}

const nextStep = () => {
  if (currentStep.value < totalSteps.value) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const selectOption = (option) => {
  totalQuestions.value++
  if (option.correct) {
    correctAnswers.value++
  }
  // 정답 여부에 관계없이 다음 단계로 진행
  setTimeout(() => {
    nextStep()
  }, 1000)
}

const completePractice = () => {
  isPracticing.value = false
  practiceCompleted.value = true
}

const resetPractice = () => {
  isPracticing.value = false
  practiceCompleted.value = false
  currentStep.value = 1
  startTime.value = null
  correctAnswers.value = 0
  totalQuestions.value = 0
}

const goToMain = () => {
  router.push('/')
}

const requestHelp = () => {
  router.push('/user')
}

const getBankIcon = (bankCode) => {
  const icons = {
    'KB': '🏦',
    'SHINHAN': '🏛️',
    'WOORI': '🏢',
    'HANA': '🏪',
    'NH': '🌾'
  }
  return icons[bankCode] || '🏦'
}

const formatNumber = (num) => {
  return new Intl.NumberFormat('ko-KR').format(num)
}
</script>

<style scoped>
/* CSS 변수 정의 */
.practice-page {
  --kb-yellow: #FFD700;
  --kb-orange: #FF8C00;
  --kb-orange-light: #FFE4B3;
  --kb-orange-dark: #E67300;
  --kb-blue: #0066B3;
  --kb-blue-light: #E6F0FA;
  --kb-blue-dark: #004C8C;
  --kb-gray: #F8F9FA;
  --kb-gray-light: #FFFFFF;
  --kb-gray-dark: #495057;
  --kb-text-primary: #1A1A1A;
  --kb-text-secondary: #666666;
  --kb-text-light: #999999;
  --kb-border: #E1E5E9;
  --kb-shadow: rgba(0, 0, 0, 0.08);
  --kb-shadow-hover: rgba(0, 0, 0, 0.12);
  --success-color: #28A745;
  --error-color: #DC3545;
  --warning-color: #FFC107;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.practice-page {
  min-height: 100vh;
  background: var(--kb-gray);
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--kb-text-primary);
}

/* 네비게이션 */
.navbar {
  background: var(--kb-gray-light);
  border-bottom: 3px solid var(--kb-orange);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  background: var(--kb-orange);
  border: none;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn:hover {
  background: var(--kb-orange-dark);
}

.back-icon {
  font-size: 20px;
  color: var(--kb-gray-light);
  font-weight: bold;
}

.logo-icon {
  font-size: 28px;
  color: var(--kb-orange);
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--kb-orange);
}

.practice-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--warning-color);
  color: var(--kb-text-primary);
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
}

.help-btn {
  background: var(--kb-blue);
  color: var(--kb-gray-light);
  border: none;
  padding: 10px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.help-btn:hover {
  background: var(--kb-blue-dark);
}

/* 메인 콘텐츠 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 연습 모드 안내 */
.practice-notice {
  background: var(--kb-blue-light);
  border-radius: 16px;
  padding: 24px;
  border-left: 4px solid var(--kb-blue);
}

.notice-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notice-icon {
  font-size: 48px;
}

.notice-content h3 {
  font-size: 20px;
  font-weight: 700;
  color: var(--kb-text-primary);
  margin-bottom: 8px;
}

.notice-content p {
  font-size: 16px;
  color: var(--kb-text-secondary);
  font-weight: 600;
  line-height: 1.6;
}

/* 섹션 헤더 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: var(--kb-gray-light);
  border-radius: 12px;
  border-left: 4px solid var(--kb-orange);
  box-shadow: 0 2px 8px var(--kb-shadow);
}

.section-header h2 {
  font-size: 24px;
  font-weight: 800;
  color: var(--kb-text-primary);
}

.section-header p {
  font-size: 16px;
  color: var(--kb-text-secondary);
  font-weight: 600;
}

.practice-badge {
  background: var(--warning-color);
  color: var(--kb-text-primary);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

/* 연습 계좌 */
.practice-accounts {
  background: var(--kb-gray-light);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px var(--kb-shadow);
}

.account-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.account-card {
  background: var(--kb-gray);
  border-radius: 16px;
  padding: 24px;
  border: 2px solid var(--kb-border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.account-card:hover {
  box-shadow: 0 6px 20px var(--kb-shadow-hover);
  transform: translateY(-2px);
}

.account-card.selected {
  border-color: var(--kb-orange);
  background: var(--kb-orange-light);
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.bank-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bank-icon {
  font-size: 32px;
}

.bank-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bank-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--kb-text-primary);
}

.account-type {
  font-size: 14px;
  color: var(--kb-text-secondary);
  font-weight: 600;
}

.practice-indicator {
  background: var(--warning-color);
  color: var(--kb-text-primary);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

.account-details {
  margin-bottom: 16px;
}

.account-number {
  font-size: 16px;
  color: var(--kb-text-primary);
  font-family: 'Courier New', monospace;
  font-weight: 700;
  margin-bottom: 4px;
}

.account-name {
  font-size: 14px;
  color: var(--kb-text-secondary);
  font-weight: 600;
}

.balance-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--kb-gray-light);
  border-radius: 12px;
}

.balance-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.balance-label {
  font-size: 14px;
  color: var(--kb-text-secondary);
  font-weight: 600;
}

.balance-amount {
  font-size: 24px;
  font-weight: 800;
  color: var(--kb-orange);
}

/* 연습 기능 */
.practice-features {
  background: var(--kb-gray-light);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px var(--kb-shadow);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.feature-card {
  background: var(--kb-gray);
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-card:hover {
  background: var(--kb-orange-light);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--kb-shadow-hover);
}

.feature-icon {
  font-size: 48px;
  text-align: center;
}

.feature-content {
  text-align: center;
}

.feature-content h3 {
  font-size: 20px;
  font-weight: 700;
  color: var(--kb-text-primary);
  margin-bottom: 8px;
}

.feature-content p {
  font-size: 14px;
  color: var(--kb-text-secondary);
  font-weight: 600;
  margin-bottom: 12px;
  line-height: 1.6;
}

.feature-difficulty {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.difficulty-label {
  font-size: 12px;
  color: var(--kb-text-light);
  font-weight: 600;
}

.difficulty-stars {
  font-size: 16px;
}

.feature-btn {
  background: var(--kb-orange);
  color: var(--kb-gray-light);
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.feature-btn:hover {
  background: var(--kb-orange-dark);
}

/* 연습 세션 */
.practice-session {
  background: var(--kb-gray-light);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px var(--kb-shadow);
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--kb-border);
}

.session-header h2 {
  font-size: 24px;
  font-weight: 800;
  color: var(--kb-text-primary);
}

.session-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  width: 200px;
  height: 8px;
  background: var(--kb-border);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--kb-orange);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--kb-text-secondary);
}

/* 단계 표시기 */
.step-indicator {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
  padding: 20px;
  background: var(--kb-gray);
  border-radius: 16px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
}

.step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 20px;
  right: -30px;
  width: 60px;
  height: 2px;
  background: var(--kb-border);
}

.step.completed:not(:last-child)::after {
  background: var(--kb-orange);
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--kb-border);
  color: var(--kb-text-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background: var(--kb-orange);
  color: var(--kb-gray-light);
}

.step.completed .step-number {
  background: var(--success-color);
  color: var(--kb-gray-light);
}

.step-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--kb-text-secondary);
  text-align: center;
  max-width: 80px;
}

.step.active .step-text {
  color: var(--kb-orange);
}

/* 현재 단계 */
.current-step {
  margin-bottom: 24px;
}

.step-content {
  background: var(--kb-gray);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
}

.step-content h3 {
  font-size: 24px;
  font-weight: 700;
  color: var(--kb-text-primary);
  margin-bottom: 12px;
}

.step-content p {
  font-size: 16px;
  color: var(--kb-text-secondary);
  font-weight: 600;
  margin-bottom: 24px;
  line-height: 1.6;
}

/* 단계 타입별 스타일 */
.info-step {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--kb-blue-light);
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid var(--kb-blue);
}

.info-icon {
  font-size: 32px;
}

.info-content p {
  font-size: 16px;
  color: var(--kb-text-primary);
  font-weight: 600;
  margin: 0;
}

.interaction-step {
  background: var(--kb-gray-light);
  padding: 24px;
  border-radius: 12px;
}

.interaction-content p {
  font-size: 18px;
  color: var(--kb-text-primary);
  font-weight: 700;
  margin-bottom: 20px;
}

.interaction-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
  margin: 0 auto;
}

.option-btn {
  background: var(--kb-gray);
  border: 2px solid var(--kb-border);
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--kb-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-btn:hover {
  background: var(--kb-orange-light);
  border-color: var(--kb-orange);
}

.option-btn.correct {
  background: var(--success-color);
  border-color: var(--success-color);
  color: var(--kb-gray-light);
}

.demo-step {
  background: var(--kb-gray-light);
  padding: 24px;
  border-radius: 12px;
}

.demo-content p {
  font-size: 16px;
  color: var(--kb-text-primary);
  font-weight: 600;
  margin-bottom: 20px;
}

.demo-screen {
  background: var(--kb-gray);
  border-radius: 12px;
  overflow: hidden;
  max-width: 400px;
  margin: 0 auto;
}

.demo-header {
  background: var(--kb-orange);
  color: var(--kb-gray-light);
  padding: 12px;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
}

.demo-body {
  padding: 20px;
  text-align: center;
}

.demo-actions {
  margin-top: 16px;
}

.demo-btn {
  background: var(--kb-orange);
  color: var(--kb-gray-light);
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.demo-btn:hover {
  background: var(--kb-orange-dark);
}

/* 단계 네비게이션 */
.step-navigation {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.nav-btn {
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 120px;
}

.prev-btn {
  background: var(--kb-gray-light);
  color: var(--kb-text-primary);
  border: 2px solid var(--kb-border);
}

.prev-btn:hover {
  background: var(--kb-gray);
  border-color: var(--kb-text-light);
}

.next-btn, .complete-btn {
  background: var(--kb-orange);
  color: var(--kb-gray-light);
}

.next-btn:hover, .complete-btn:hover {
  background: var(--kb-orange-dark);
}

/* 연습 완료 */
.practice-complete {
  background: var(--kb-gray-light);
  border-radius: 16px;
  padding: 48px 24px;
  text-align: center;
  box-shadow: 0 4px 16px var(--kb-shadow);
}

.complete-card {
  max-width: 500px;
  margin: 0 auto;
}

.complete-icon {
  font-size: 80px;
  margin-bottom: 24px;
}

.complete-card h2 {
  font-size: 32px;
  font-weight: 800;
  color: var(--kb-text-primary);
  margin-bottom: 16px;
}

.complete-card p {
  font-size: 18px;
  color: var(--kb-text-secondary);
  font-weight: 600;
  margin-bottom: 32px;
  line-height: 1.6;
}

.completion-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 32px;
  padding: 24px;
  background: var(--kb-gray);
  border-radius: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--kb-text-secondary);
  font-weight: 600;
}

.stat-value {
  font-size: 20px;
  font-weight: 800;
  color: var(--kb-orange);
}

.completion-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn-primary, .btn-secondary {
  padding: 16px 32px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 120px;
}

.btn-primary {
  background: var(--kb-orange);
  color: var(--kb-gray-light);
}

.btn-primary:hover {
  background: var(--kb-orange-dark);
}

.btn-secondary {
  background: var(--kb-gray-light);
  color: var(--kb-text-primary);
  border: 2px solid var(--kb-border);
}

.btn-secondary:hover {
  background: var(--kb-gray);
  border-color: var(--kb-text-light);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
  }
  
  .step-indicator {
    flex-direction: column;
    gap: 16px;
  }
  
  .step:not(:last-child)::after {
    display: none;
  }
  
  .interaction-buttons {
    max-width: 100%;
  }
  
  .completion-stats {
    flex-direction: column;
    gap: 16px;
  }
  
  .completion-actions {
    flex-direction: column;
  }
  
  .btn-primary, .btn-secondary {
    width: 100%;
  }
  
  .session-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .progress-bar {
    width: 100%;
  }
}
</style>
