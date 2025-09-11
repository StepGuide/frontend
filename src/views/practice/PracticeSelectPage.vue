<template>
  <div class="practice-page">
    <!-- 상단 네비게이션 -->
    <nav class="navbar">
      <div class="nav-content">
        <div class="logo">
          <button class="back-btn" @click="goBack">
            <span class="back-icon">←</span>
          </button>
          <span class="logo-text">연습 모드</span>
        </div>
        <div class="nav-actions">
          <div class="practice-indicator" v-if="quizActive">
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

    <div class="practice-container">
      <div class="practice-notice">
        <div class="notice-card">
          <div class="notice-icon">🛡️</div>
          <div class="notice-content">
            <h3>안전한 연습 환경</h3>
            <p>
              실제 계좌에 영향을 주지 않는 가상 환경에서 금융 서비스를
              연습해보세요.
            </p>
          </div>
        </div>
      </div>
      <!-- 연습 기능 선택 -->
      <div
        v-if="selectedAccount && !quizActive && !practiceCompleted"
        class="practice-features"
      >
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
      <div v-if="quizActive && isPracticing" class="practice-session">
        <div class="session-header">
          <h2>{{ currentPractice.title }}</h2>
          <div class="session-progress">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: practiceProgress + '%' }"
              ></div>
            </div>
            <span class="progress-text"
              >{{ currentStep }} / {{ totalSteps }} 단계</span
            >
          </div>
        </div>

        <div class="practice-content">
          <div class="step-indicator">
            <div
              v-for="(step, index) in practiceSteps[currentPractice.type]"
              :key="index"
              class="step"
              :class="{
                active: index === currentStep - 1,
                completed: index < currentStep - 1,
              }"
            >
              <span class="step-number">{{ index + 1 }}</span>
              <span class="step-text">{{ step.title }}</span>
            </div>
          </div>

          <div class="current-step">
            <div class="step-content">
              <h3>
                {{
                  practiceSteps[currentPractice.type][currentStep - 1]?.title
                }}
              </h3>
              <p>
                {{
                  practiceSteps[currentPractice.type][currentStep - 1]
                    ?.description
                }}
              </p>

              <div class="step-actions">
                <!-- Info Step -->
                <div
                  v-if="
                    practiceSteps[currentPractice.type][currentStep - 1]
                      ?.type === 'info'
                  "
                  class="info-step"
                >
                  <div class="info-icon">ℹ️</div>
                  <div class="info-content">
                    <p>
                      {{
                        practiceSteps[currentPractice.type][currentStep - 1]
                          ?.content
                      }}
                    </p>
                  </div>
                </div>

                <!-- Interaction Step -->
                <div
                  v-else-if="
                    practiceSteps[currentPractice.type][currentStep - 1]
                      ?.type === 'interaction'
                  "
                  class="interaction-step"
                >
                  <div class="interaction-content">
                    <p>
                      {{
                        practiceSteps[currentPractice.type][currentStep - 1]
                          ?.content
                      }}
                    </p>
                    <div class="interaction-buttons">
                      <button
                        v-for="option in practiceSteps[currentPractice.type][
                          currentStep - 1
                        ]?.options"
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

                <!-- Demo Step -->
                <div
                  v-else-if="
                    practiceSteps[currentPractice.type][currentStep - 1]
                      ?.type === 'demo'
                  "
                  class="demo-step"
                >
                  <div class="demo-content">
                    <div class="demo-screen">
                      <div class="demo-header">연습 화면</div>
                      <div class="demo-body">
                        <p>
                          {{
                            practiceSteps[currentPractice.type][currentStep - 1]
                              ?.content
                          }}
                        </p>
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
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const selectedAccount = ref(true);
const isPracticing = ref(false);
const quizActive = ref(false);
const practiceCompleted = ref(false);

const currentStep = ref(1);
const totalSteps = ref(1);
const practiceProgress = ref(0);

const currentPractice = ref({
  title: '',
  type: '',
});

const practiceSteps = {
  transfer: [
    {
      title: '계좌번호 입력',
      description: '받는 사람 계좌번호 입력',
      type: 'interaction',
      content: '올바른 계좌번호 선택',
      options: [
        { label: '123-456-7890', value: '1', correct: false },
        { label: '1002-345-678901', value: '2', correct: true },
      ],
    },
    {
      title: '송금 금액 입력',
      description: '보낼 금액 입력',
      type: 'interaction',
      content: '정확한 금액 선택',
      options: [
        { label: '1000원', value: '1000', correct: false },
        { label: '50000원', value: '50000', correct: true },
      ],
    },
  ],
  inquiry: [
    {
      title: '메뉴 선택',
      description: '거래내역 조회 메뉴 찾기',
      type: 'interaction',
      content: '어떤 메뉴가 거래내역 조회?',
      options: [
        { label: '계좌 이체', value: 'transfer', correct: false },
        { label: '거래내역 조회', value: 'inquiry', correct: true },
      ],
    },
  ],
  balance: [
    {
      title: '잔액 확인',
      description: '잔액 확인 버튼 누르기',
      type: 'demo',
      content: '아래 버튼 눌러 확인',
    },
  ],
  security: [
    {
      title: '비밀번호 변경',
      description: '비밀번호 변경',
      type: 'info',
      content: '최소 8자리, 영문+숫자 포함',
    },
    {
      title: '이중 인증',
      description: 'OTP 인증 활성화',
      type: 'interaction',
      content: '이중 인증 메뉴 선택',
      options: [
        { label: '계좌 조회', value: 'inquiry', correct: false },
        { label: '보안 설정', value: 'security', correct: true },
      ],
    },
  ],
};

function startPractice(type) {
  // 메인으로 이동해 어떤 버튼을 눌러야 하는지 가이드 표시 후, 해당 버튼 클릭 시 실전연습 페이지로 이동
  const guideMap = {
    transfer: 'transfer',
    inquiry: 'inquiry',
    balance: 'balance',
  }
  const guide = guideMap[type] || 'inquiry'
  router.push({ path: '/', query: { practiceGuide: guide } })
}

function nextStep() {
  if (currentStep.value < totalSteps.value) {
    currentStep.value++;
    practiceProgress.value = (currentStep.value / totalSteps.value) * 100;
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
    practiceProgress.value = (currentStep.value / totalSteps.value) * 100;
  }
}

function selectOption(option) {
  if (option.correct) nextStep();
  else alert('틀렸습니다. 다시 시도하세요.');
}

function completePractice() {
  // 사용되지 않음: 실전연습으로 즉시 이동
  router.push({ name: 'realPractice', params: { type: currentPractice.value.type } });
}

function goBack() {
  router.back();
}

function requestHelp() {
  alert('도움 요청!');
}
</script>

<style scoped>
.practice-page {
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

.practice-container {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Noto Sans KR', sans-serif;
  color: #333;
}

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

.back-btn {
  background: linear-gradient(135deg, var(--white) 0%, var(--gray-100) 100%);
  border: 1px solid var(--gray-200);
  padding: 12px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
}

.back-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    var(--kb-yellow-positive) 0%,
    var(--primary-dark) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 16px;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: var(--kb-yellow-positive);
}

.back-btn:hover::before {
  opacity: 0.1;
}

.back-icon {
  font-size: 18px;
  color: var(--gray-700);
  font-weight: 600;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.back-btn:hover .back-icon {
  color: var(--kb-yellow-positive);
  transform: translateX(-2px);
}

.logo-icon {
  font-size: 32px;
  color: var(--kb-yellow-positive);
}

.logo-text {
  font-size: 22px;
  font-weight: 600;
  color: var(--kb-gray);
  letter-spacing: -0.3px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
}

.practice-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--warning);
  color: var(--gray-800);
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.1px;
}

.help-btn {
  background: var(--gray-200);
  color: var(--gray-600);
  border: none;
  padding: 10px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.1px;
}

.help-btn:hover {
  background: var(--gray-300);
}

/* ===== 기능 선택 ===== */
.section-header {
  text-align: center;
  margin-bottom: 2rem;
}
.section-header h2 {
  font-size: 1.6rem;
  margin-bottom: 0.5rem;
}
.section-header p {
  color: #666;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 항상 4개 한 줄 */
  gap: 1rem; /* 카드 사이 간격 */
}

.feature-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}
.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
.feature-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}
.feature-content h3 {
  font-size: 1.2rem;
  margin-bottom: 0.3rem;
}
.feature-content p {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.8rem;
}
.feature-difficulty {
  font-size: 0.85rem;
  color: #444;
}
.feature-btn {
  margin-top: 1rem;
  padding: 0.6rem 1rem;
  border: none;
  background: #ffbc00;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  color: #fff;
  transition: background 0.2s ease;
}
.feature-btn:hover {
  background: #e0a700;
}

/* ===== 연습 진행 중 ===== */
.practice-session {
  background: #fff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.session-header {
  margin-bottom: 1.5rem;
}
.session-header h2 {
  font-size: 1.4rem;
  margin-bottom: 0.8rem;
}
.session-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.progress-bar {
  flex: 1;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: #4a90e2;
  transition: width 0.3s ease;
}
.progress-text {
  font-size: 0.85rem;
  color: #555;
}

.step-indicator {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}
.step {
  flex: 1;
  text-align: center;
  position: relative;
}
.step-number {
  display: inline-block;
  width: 28px;
  height: 28px;
  line-height: 28px;
  border-radius: 50%;
  background: #ddd;
  font-size: 0.85rem;
}
.step.active .step-number {
  background: #4a90e2;
  color: #fff;
}
.step.completed .step-number {
  background: #4caf50;
  color: #fff;
}
.step-text {
  display: block;
  font-size: 0.8rem;
  margin-top: 0.3rem;
}

.current-step {
  margin-bottom: 2rem;
}
.step-content h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}
.step-content p {
  margin-bottom: 1rem;
  color: #555;
}

/* step 타입별 */
.info-step {
  background: #f5f7fa;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
}
.info-icon {
  font-size: 1.2rem;
}
.interaction-buttons {
  margin-top: 1rem;
  display: flex;
  gap: 0.8rem;
}
.option-btn {
  flex: 1;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}
.option-btn:hover {
  background: #f0f0f0;
}
.option-btn.correct {
  border-color: #4caf50;
  color: #4caf50;
}
.demo-screen {
  border: 1px solid #ddd;
  border-radius: 12px;
  overflow: hidden;
}
.demo-header {
  background: #f0f0f0;
  padding: 0.6rem;
  font-weight: bold;
}
.demo-body {
  padding: 1rem;
}
.demo-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: #ffbc00;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
}

.step-navigation {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
}
.nav-btn {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.nav-actions {
  display: flex;
  gap: 12px;
}
.prev-btn {
  background: #eee;
}
.next-btn {
  background: #4a90e2;
  color: #fff;
}
.complete-btn {
  background: #4caf50;
  color: #fff;
}

/* ===== 연습 완료 ===== */
.practice-complete {
  text-align: center;
}
.complete-card {
  background: #fff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  display: inline-block;
}
.complete-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}
.completion-stats {
  margin: 1.5rem 0;
  text-align: left;
}
.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.completion-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}
.btn-primary {
  background: #4a90e2;
  color: #fff;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}
.btn-secondary {
  background: #eee;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}
/* 연습 모드 안내 */
.practice-notice {
  margin: 0px 0 30px 0;
  background: #fff4d6;
  border-radius: 12px;
  padding: 12px;
  border-left: 4px solid var(--kb-yellow-positive);
}
.notice-card {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notice-icon {
  font-size: 32px;
}

.notice-content h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 4px;
}

.notice-content p {
  font-size: 14px;
  color: var(--gray-600);
}
</style>
