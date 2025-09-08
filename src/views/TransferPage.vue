<template>
  <div class="transfer-page">
    <!-- 상단 네비게이션 -->
    <nav class="navbar">
      <div class="nav-content">
        <div class="logo">
          <button class="back-btn" @click="goBack">
            <span class="back-icon">←</span>
          </button>
          <span class="logo-text">이체하기</span>
        </div>
        <div class="nav-actions">
          <button class="help-btn" @click="requestHelp">
            <span class="help-icon">❓</span>
            <span class="help-text">도움</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- 메인 콘텐츠 -->
    <div class="main-content">
      <!-- 이체 단계 표시 -->
      <div class="step-indicator">
        <div
          class="step"
          :class="{ active: currentStep >= 1, completed: currentStep > 1 }"
        >
          <span class="step-number">1</span>
          <span class="step-text">계좌 선택</span>
        </div>
        <div class="step-line" :class="{ active: currentStep > 1 }"></div>
        <div
          class="step"
          :class="{ active: currentStep >= 2, completed: currentStep > 2 }"
        >
          <span class="step-number">2</span>
          <span class="step-text">이체 정보</span>
        </div>
        <div class="step-line" :class="{ active: currentStep > 2 }"></div>
        <div class="step" :class="{ active: currentStep >= 3 }">
          <span class="step-number">3</span>
          <span class="step-text">확인</span>
        </div>
      </div>

      <!-- 1단계: 계좌 선택 -->
      <div v-if="currentStep === 1" class="step-content">
        <div class="section-header">
          <h2>출금 계좌 선택</h2>
          <p>이체할 계좌를 선택해주세요</p>
        </div>

        <div class="account-list">
          <div
            v-for="account in accounts"
            :key="account.id"
            class="account-item"
            :class="{ selected: selectedAccount?.id === account.id }"
            @click="selectAccount(account)"
          >
            <div class="account-info">
              <div class="bank-name">{{ account.bankName }}</div>
              <div class="account-number">{{ account.accountNumber }}</div>
              <div class="account-name">{{ account.accountName }}</div>
            </div>
            <div class="balance">
              <div class="balance-amount">
                ₩ {{ formatNumber(account.balance) }}
              </div>
              <div class="balance-label">잔액</div>
            </div>
            <div class="select-indicator">
              <span v-if="selectedAccount?.id === account.id" class="check-icon"
                >✓</span
              >
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button class="btn-secondary" @click="goBack">취소</button>
          <button
            class="btn-primary"
            :disabled="!selectedAccount"
            @click="nextStep"
          >
            다음
          </button>
        </div>
      </div>

      <!-- 2단계: 이체 정보 입력 -->
      <div v-if="currentStep === 2" class="step-content">
        <div class="section-header">
          <h2>이체 정보 입력</h2>
          <p>받는 분의 계좌 정보를 입력해주세요</p>
        </div>

        <div class="form-section">
          <div class="form-group">
            <label>받는 은행</label>
            <select v-model="transferInfo.bank" class="form-input">
              <option value="">은행을 선택하세요</option>
              <option value="KB">KB국민은행</option>
              <option value="SHINHAN">신한은행</option>
              <option value="WOORI">우리은행</option>
              <option value="HANA">하나은행</option>
              <option value="NH">농협은행</option>
            </select>
          </div>

          <div class="form-group">
            <label>받는 계좌번호</label>
            <input
              v-model="transferInfo.accountNumber"
              type="text"
              placeholder="계좌번호를 입력하세요"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>받는 분 이름</label>
            <input
              v-model="transferInfo.recipientName"
              type="text"
              placeholder="받는 분의 이름을 입력하세요"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>이체 금액</label>
            <div class="amount-input-group">
              <input
                v-model="transferInfo.amount"
                type="number"
                placeholder="0"
                class="form-input amount-input"
                @input="formatAmount"
              />
              <span class="currency">원</span>
            </div>
            <div class="amount-display">
              ₩ {{ formatNumber(transferInfo.amount || 0) }}
            </div>
          </div>

          <div class="form-group">
            <label>이체 메모 (선택사항)</label>
            <input
              v-model="transferInfo.memo"
              type="text"
              placeholder="이체 메모를 입력하세요"
              class="form-input"
            />
          </div>
        </div>

        <div class="action-buttons">
          <button class="btn-secondary" @click="prevStep">이전</button>
          <button
            class="btn-primary"
            :disabled="!isTransferInfoValid"
            @click="nextStep"
          >
            다음
          </button>
        </div>
      </div>

      <!-- 3단계: 확인 -->
      <div v-if="currentStep === 3" class="step-content">
        <div class="section-header">
          <h2>이체 정보 확인</h2>
          <p>입력하신 정보를 확인해주세요</p>
        </div>

        <div class="confirmation-card">
          <div class="confirmation-section">
            <h3>출금 계좌</h3>
            <div class="account-detail">
              <div class="bank-name">{{ selectedAccount.bankName }}</div>
              <div class="account-number">
                {{ selectedAccount.accountNumber }}
              </div>
              <div class="balance">
                잔액: ₩ {{ formatNumber(selectedAccount.balance) }}
              </div>
            </div>
          </div>

          <div class="confirmation-section">
            <h3>받는 계좌</h3>
            <div class="transfer-detail">
              <div class="detail-row">
                <span class="label">은행:</span>
                <span class="value">{{ getBankName(transferInfo.bank) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">계좌번호:</span>
                <span class="value">{{ transferInfo.accountNumber }}</span>
              </div>
              <div class="detail-row">
                <span class="label">받는 분:</span>
                <span class="value">{{ transferInfo.recipientName }}</span>
              </div>
              <div class="detail-row">
                <span class="label">이체 금액:</span>
                <span class="value amount"
                  >₩ {{ formatNumber(transferInfo.amount) }}</span
                >
              </div>
              <div v-if="transferInfo.memo" class="detail-row">
                <span class="label">메모:</span>
                <span class="value">{{ transferInfo.memo }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 사기 민원 체크 경고 박스 (3건 이상일 때만 노출) -->
        <div
          v-if="isFraudHighRisk"
          class="fraud-warning"
          :class="{ danger: isFraudHighRisk }"
        >
          <span class="fraud-icon">⚠️</span>
          <span class="fraud-text">{{ fraudCheckMessage }}</span>
        </div>

        <!-- 이상징후 점수 표시 -->
        <div class="anomaly-section" v-if="anomalyScore && !isFraudHighRisk">
          <div class="anomaly-header">
            <div class="anomaly-title-section">
              <h3>이상탐지 결과</h3>
              <button
                class="help-icon"
                @click="showScoreModal = true"
                title="점수 기준 보기"
              >
                <span class="help-text">?</span>
              </button>
            </div>
            <div class="anomaly-badge" :class="anomalyLevel">
              <span class="badge-text">{{ anomalyLabel }}</span>
              <span
                v-if="
                  anomalyScore?.result?.totalScore !== null &&
                  anomalyScore?.result?.totalScore !== undefined
                "
                class="badge-score"
              >
                {{ anomalyScore.result.totalScore }}
              </span>
            </div>
          </div>
          <!-- 레벨별 상세 안내 메시지 -->
          <div v-if="anomalyLevel === 'normal'" class="anomaly-note success">
            거래가 안전하게 확인되었습니다.
          </div>
          <div
            v-else-if="anomalyLevel === 'caution'"
            class="anomaly-note caution"
          >
            <p>
              거래의 일부 요소가 위험 신호를 보였습니다. 계속 진행하시겠습니까?
            </p>
            <ul class="risk-list">
              <li v-for="risk in riskFactors" :key="risk">{{ risk }}</li>
            </ul>
          </div>
          <div v-else-if="anomalyLevel === 'high'" class="anomaly-note high">
            <p>
              거래의 여러 요소에서 위험 신호가 감지되어 자동으로 지연
              처리됩니다.
            </p>
            <p>또한, 보호자/관리자에게 알림이 발송됩니다.</p>
          </div>
          <div class="anomaly-toggle">
            <button
              class="score-toggle-btn"
              @click="showScoreDetails = !showScoreDetails"
            >
              <span class="chevron">{{ showScoreDetails ? '▾' : '▸' }}</span>
              <span class="label-text">점수 보기</span>
            </button>
          </div>
          <div
            class="anomaly-breakdown"
            v-if="anomalyScore?.result && showScoreDetails"
          >
            <div class="breakdown-row">
              <span class="label">이전 송금 점수</span>
              <span class="value">{{
                anomalyScore.result.previousTransferScore
              }}</span>
            </div>
            <div class="breakdown-row">
              <span class="label">송금액 점수</span>
              <span class="value">{{
                anomalyScore.result.largeAmountScore
              }}</span>
            </div>
            <div class="breakdown-row">
              <span class="label">송금 시각 점수</span>
              <span class="value">{{
                anomalyScore.result.nightTimeScore
              }}</span>
            </div>
            <div class="breakdown-row">
              <span class="label">송금 횟수 점수</span>
              <span class="value">{{
                anomalyScore.result.dailyFrequencyScore
              }}</span>
            </div>
            <div class="breakdown-row">
              <span class="label">즐겨찾기 점수</span>
              <span class="value">{{
                anomalyScore.result.favoriteAccountScore
              }}</span>
            </div>
          </div>
        </div>

        <!-- 이상징후 로딩 -->
        <div v-if="isLoadingAnomaly" class="anomaly-loading">
          <div class="loading-spinner"></div>
          <span>이상징후 점수 계산 중...</span>
        </div>

        <div class="action-buttons">
          <button class="btn-secondary" @click="prevStep">이전</button>
          <button class="btn-primary" @click="confirmTransfer">이체하기</button>
        </div>
      </div>
    </div>

    <!-- 점수 기준 모달창 -->
    <div
      v-if="showScoreModal"
      class="modal-overlay"
      @click="showScoreModal = false"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>이상탐지 점수 기준</h3>
          <button class="modal-close" @click="showScoreModal = false">×</button>
        </div>
        <div class="modal-body">
          <!-- 점수 계산 기준 설명 -->
          <div class="score-explanation">
            <h4>점수 계산 기준</h4>
            <p class="explanation-text">
              거래의 안전성을 확인하기 위해 아래 기준으로 점수가 계산됩니다.<br />
              점수가 높을수록 위험 가능성이 커집니다. (총점 60점)
            </p>

            <div class="score-breakdown">
              <div class="breakdown-item">
                <span class="breakdown-label">이전 송금 점수 (15점)</span>
                <span class="breakdown-desc"
                  >최근 1년 이내에 해당 계좌로 송금한 적이 없으면 점수
                  부여</span
                >
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">송금액 점수 (20점)</span>
                <span class="breakdown-desc"
                  >1회 송금 금액이 50만 원 이상이거나, 최근 30일 평균 송금액의
                  2배 이상이면 점수 부여</span
                >
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">송금 시간 점수 (10점)</span>
                <span class="breakdown-desc"
                  >밤 10시부터 새벽 6시 사이에 송금하면 점수 부여</span
                >
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">송금 횟수 점수 (10점)</span>
                <span class="breakdown-desc"
                  >같은 날 2회 이상 송금했을 경우 점수 부여</span
                >
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">즐겨찾기 점수 (5점)</span>
                <span class="breakdown-desc"
                  >해당 계좌가 즐겨찾기에 등록되지 않은 경우 점수 부여</span
                >
              </div>
            </div>
          </div>

          <!-- 점수 단계 해석 -->
          <div class="score-criteria">
            <h4>점수 단계 해석</h4>
            <div class="criteria-summary">
              <div class="criteria-row normal">
                <span class="criteria-range">Score < 30</span>
                <span class="criteria-label">정상</span>
              </div>
              <div class="criteria-row caution">
                <span class="criteria-range">30 ≤ Score < 50</span>
                <span class="criteria-label">주의/안심경고</span>
              </div>
              <div class="criteria-row high">
                <span class="criteria-range">50 ≤ Score ≤ 60</span>
                <span class="criteria-label">고위험</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-primary" @click="showScoreModal = false">
            확인
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { calculateAnomalyScore } from '@/api/AnomalyDetectionApi';
import { checkFraudAccount } from '@/api/fraudAccountApi';

const router = useRouter();

// 반응형 데이터
const currentStep = ref(1);
const selectedAccount = ref(null);
const transferInfo = ref({
  bank: '',
  accountNumber: '',
  recipientName: '',
  amount: '',
  memo: '',
});

// 이상징후 점수 상태 및 표시 계산값
const anomalyScore = ref(null);
const isLoadingAnomaly = ref(false);
const showScoreDetails = ref(false);
const showScoreModal = ref(false);
const fraudCheckMessage = ref('');
const isFraudHighRisk = ref(false);

const anomalyLevel = computed(() => {
  const score = anomalyScore?.value?.result?.totalScore ?? null;
  if (score === null || score === undefined) return null;
  if (score < 30) return 'normal';
  if (score < 50) return 'caution';
  return 'high';
});

const anomalyLabel = computed(() => {
  if (!anomalyLevel.value) return '';
  return anomalyLevel.value === 'normal'
    ? '정상'
    : anomalyLevel.value === 'caution'
    ? '주의/안심경고'
    : '고위험';
});

const anomalyDescription = computed(() => {
  if (!anomalyLevel.value) return '';
  if (anomalyLevel.value === 'normal')
    return '대부분 위험 요소 없음 · 바로 송금 가능';
  if (anomalyLevel.value === 'caution')
    return '일부 위험 요소 존재 · 팝업 안내 + 필요 시 AI 판단';
  return '고위험 · 송금 전 추가 확인 권장';
});

// 주의 단계에서 노출할 위험 요소 리스트
const riskFactors = computed(() => {
  const list = [];
  const res =
    anomalyScore && anomalyScore.value ? anomalyScore.value.result : null;
  if (!res) return list;
  if (res.previousTransferScore > 0)
    list.push('최근 1년간 송금한 적 없는 계좌');
  if (res.largeAmountScore > 0) list.push('큰 금액 송금');
  if (res.nightTimeScore > 0) list.push('야간 시간대 거래');
  if (res.dailyFrequencyScore > 0) list.push('송금횟수 많음');
  if (res.favoriteAccountScore > 0) list.push('즐겨찾기 등록되지 않은 계좌');
  return list;
});

// 계좌 목록 (샘플 데이터)
const accounts = ref([
  {
    id: 1,
    bankName: 'KB국민은행',
    accountNumber: '123-456789-01-234',
    accountName: '김영희',
    balance: 2450000,
  },
  {
    id: 2,
    bankName: 'KB국민은행',
    accountNumber: '987-654321-02-345',
    accountName: '김영희',
    balance: 1200000,
  },
]);

// 계산된 속성
const isTransferInfoValid = computed(() => {
  return (
    transferInfo.value.bank &&
    transferInfo.value.accountNumber &&
    transferInfo.value.recipientName &&
    transferInfo.value.amount &&
    transferInfo.value.amount > 0
  );
});

// 메서드
const goBack = () => {
  router.push('/');
};

const selectAccount = (account) => {
  selectedAccount.value = account;
};

const nextStep = async () => {
  if (currentStep.value < 3) {
    currentStep.value++;
    if (currentStep.value === 3) {
      await calculateAnomaly();
    }
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('ko-KR').format(num);
};

const formatAmount = (event) => {
  const value = event.target.value;
  transferInfo.value.amount = value;
};

const getBankName = (bankCode) => {
  const banks = {
    KB: 'KB국민은행',
    SHINHAN: '신한은행',
    WOORI: '우리은행',
    HANA: '하나은행',
    NH: '농협은행',
  };
  return banks[bankCode] || bankCode;
};

const confirmTransfer = () => {
  // 실제 이체 로직 구현
  alert('이체가 완료되었습니다!');
  router.push('/');
};

const requestHelp = () => {
  router.push('/');
};

// 이상징후 점수 계산 호출 (사기 민원 선행 체크 포함)
const calculateAnomaly = async () => {
  try {
    isLoadingAnomaly.value = true;
    anomalyScore.value = null;

    // 1) 사기 민원 체크 선행 호출
    const fraudReqBody = {
      accountNumber: transferInfo.value.accountNumber,
    };
    const fraudResp = await checkFraudAccount(fraudReqBody);
    const fraudMsg = fraudResp?.data?.result || '';
    // 화면 반영 메시지 및 위험 여부 판정
    if (fraudMsg === '최근 3개월 내 사기민원  3건이상있습니다.') {
      fraudCheckMessage.value = '3개월 내 3건이상 사기 신고를 당한 계좌입니다.';
      isFraudHighRisk.value = true;
    } else {
      fraudCheckMessage.value = '3개월 내 3건이상 사기 신고를 당한 계좌입니다.';
      isFraudHighRisk.value = false;
    }

    // 고위험일 경우 점수 계산 중단 (경고만 표시)
    if (isFraudHighRisk.value) {
      return;
    }

    // 2) 안전 메시지의 경우 점수 계산 진행
    const requestBody = {
      accountNumber: transferInfo.value.accountNumber,
      transactionAmount: Number(transferInfo.value.amount),
      transactionDateTime: new Date().toISOString(),
    };
    const response = await calculateAnomalyScore(requestBody);
    if (response && response.data) {
      anomalyScore.value = response.data;
    }
  } catch (e) {
    console.error('이상징후 점수 계산 실패:', e);
    anomalyScore.value = {
      isSuccess: false,
      code: 500,
      message: '이상징후 점수 계산 실패',
      result: { totalScore: null },
    };
  } finally {
    isLoadingAnomaly.value = false;
  }
};
</script>

<style scoped>
/* CSS 변수 정의 - KB국민은행 공식 브랜드 컬러 */
.transfer-page {
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

.transfer-page {
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
  max-width: 800px;
  margin: 0 auto;
  padding: 16px;
}

/* 단계 표시기 */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  padding: 12px;
  background: var(--white);
  border-radius: 12px;
  box-shadow: var(--shadow);
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--gray-300);
  color: var(--gray-500);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.2px;
}

.step.active .step-number {
  background: var(--kb-yellow-positive);
  color: var(--white);
}

.step.completed .step-number {
  background: var(--success);
  color: var(--white);
}

.step-text {
  font-size: 12px;
  font-weight: 500;
  color: var(--gray-600);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.1px;
}

.step.active .step-text {
  color: var(--kb-yellow-positive);
}

.step-line {
  width: 40px;
  height: 2px;
  background: var(--gray-300);
  margin: 0 12px;
  transition: all 0.3s ease;
}

.step-line.active {
  background: var(--kb-yellow-positive);
}

/* 단계 콘텐츠 */
.step-content {
  background: var(--kb-gray-light);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 16px var(--kb-shadow);
}

.section-header {
  text-align: center;
  margin-bottom: 16px;
  padding: 16px;
  background: var(--white);
  border-radius: 12px;
  box-shadow: var(--shadow);
  border: 1px solid var(--gray-200);
}

.section-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--kb-gray);
  margin-bottom: 4px;
  letter-spacing: -0.3px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
}

.section-header p {
  font-size: 14px;
  color: var(--gray-600);
  font-weight: 500;
  line-height: 1.4;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.1px;
}

/* 계좌 목록 */
.account-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.account-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 2px solid var(--gray-200);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--white);
  box-shadow: var(--shadow);
}

.account-item:hover {
  border-color: var(--kb-yellow-positive);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.account-item.selected {
  border-color: var(--kb-yellow-positive);
  background: var(--primary-light);
  box-shadow: var(--shadow-lg);
}

.account-item.selected .select-indicator {
  background: var(--kb-yellow-positive);
  color: var(--white);
}

.account-info {
  flex: 1;
}

.bank-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 2px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.2px;
}

.account-number {
  font-size: 13px;
  color: var(--gray-600);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
  margin-bottom: 2px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.account-name {
  font-size: 12px;
  color: var(--gray-500);
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.1px;
}

.balance {
  text-align: right;
  margin-right: 12px;
}

.balance-amount {
  font-size: 18px;
  font-weight: 700;
  color: var(--kb-yellow-positive);
  margin-bottom: 2px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.3px;
}

.balance-label {
  font-size: 11px;
  color: var(--gray-500);
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.1px;
}

.select-indicator {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--gray-300);
  color: var(--gray-500);
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
}

.check-icon {
  color: var(--success);
  font-size: 14px;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
}

/* 폼 스타일 */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: var(--white);
  border-radius: 12px;
  box-shadow: var(--shadow);
  border: 1px solid var(--gray-200);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: var(--gray-700);
  margin-bottom: 2px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.1px;
}

.form-input {
  padding: 12px;
  border: 2px solid var(--gray-200);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  background: var(--white);
  color: var(--gray-800);
  box-shadow: var(--shadow-sm);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.1px;
}

.form-input select {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
  font-weight: 500;
  letter-spacing: -0.1px;
}

.form-input:focus {
  outline: none;
  border-color: var(--kb-yellow-positive);
  box-shadow: 0 0 0 3px rgba(255, 188, 0, 0.1), var(--shadow-md);
  transform: translateY(-1px);
}

.form-input:hover {
  border-color: var(--gray-300);
  box-shadow: var(--shadow);
}

.amount-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: var(--gray-50);
  border-radius: 8px;
  border: 1px solid var(--gray-200);
}

.amount-input {
  flex: 1;
}

.currency {
  font-size: 14px;
  font-weight: 600;
  color: var(--kb-yellow-positive);
  padding: 6px 10px;
  background: var(--primary-light);
  border-radius: 6px;
  border: 1px solid var(--kb-yellow-positive);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.2px;
}

.amount-display {
  font-size: 20px;
  font-weight: 700;
  color: var(--kb-yellow-positive);
  text-align: center;
  padding: 12px;
  background: var(--primary-light);
  border-radius: 8px;
  margin-top: 4px;
  border: 1px solid var(--kb-yellow-positive);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.3px;
}

/* 확인 카드 */
.confirmation-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: var(--white);
  border-radius: 12px;
  box-shadow: var(--shadow);
  border: 1px solid var(--gray-200);
}

.confirmation-section {
  padding: 16px;
  background: var(--gray-50);
  border-radius: 8px;
  border-left: 4px solid var(--kb-yellow-positive);
  margin-bottom: 12px;
}

.confirmation-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--kb-gray);
  margin-bottom: 12px;
  letter-spacing: -0.2px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
}

.account-detail {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.transfer-detail {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--gray-200);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row .label {
  font-size: 13px;
  font-weight: 500;
  color: var(--gray-600);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.1px;
}

.detail-row .value {
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-800);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.1px;
}

.detail-row .value.amount {
  color: var(--kb-yellow-positive);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.3px;
}

/* 버튼 */
.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 16px;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 100px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.2px;
}

.btn-primary {
  background: var(--kb-yellow-positive);
  color: var(--white);
  box-shadow: var(--shadow);
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:disabled {
  background: var(--gray-300);
  color: var(--gray-500);
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: var(--white);
  color: var(--gray-800);
  border: 2px solid var(--gray-300);
  box-shadow: var(--shadow);
}

.btn-secondary:hover {
  background: var(--gray-100);
  border-color: var(--gray-400);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* 이상징후 점수 섹션 */
.anomaly-section {
  margin-top: 20px;
  padding: 16px;
  background: var(--white);
  border-radius: 12px;
  box-shadow: var(--shadow);
  border: 1px solid var(--gray-200);
}

.anomaly-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.anomaly-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--kb-gray);
  margin: 0;
  letter-spacing: -0.2px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
}

.anomaly-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

.anomaly-badge.normal {
  background: var(--success);
  color: var(--white);
}
.anomaly-badge.caution {
  background: var(--kb-yellow-negative);
  color: var(--gray-900);
}
.anomaly-badge.high {
  background: var(--danger);
  color: var(--white);
}

.badge-score {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 2px 8px;
}

.anomaly-description {
  font-size: 13px;
  color: var(--gray-700);
  margin-bottom: 10px;
}

/* 레벨별 안내 메모 */
.anomaly-note {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 10px;
  border: 1px solid var(--gray-200);
}
.anomaly-note.success {
  background: #e8f5e9;
  color: #1b5e20;
  border-color: #a5d6a7;
}
.anomaly-note.caution {
  background: #fff8e1;
  color: #6a4f00;
  border-color: #ffe082;
}
.anomaly-note.high {
  background: #ffebee;
  color: #b71c1c;
  border-color: #ef9a9a;
}

.risk-list {
  margin: 6px 0 6px 16px;
}
.risk-list li {
  list-style: disc;
  margin: 2px 0;
}

.anomaly-breakdown {
  background: var(--gray-50);
  border-radius: 8px;
  border: 1px solid var(--gray-200);
}

/* 점수 토글 버튼 */
.anomaly-toggle {
  display: flex;
  justify-content: flex-start;
  margin: 6px 0 10px 0;
}
.score-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 16px;
  border: 1px solid var(--gray-300);
  background: var(--white);
  color: var(--gray-800);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: var(--shadow-sm);
}
.score-toggle-btn:hover {
  background: var(--gray-100);
  border-color: var(--gray-400);
}
.score-toggle-btn:active {
  transform: translateY(1px);
}
.score-toggle-btn .chevron {
  width: 14px;
  display: inline-block;
  text-align: center;
  color: var(--kb-gray);
}
.score-toggle-btn .label-text {
  letter-spacing: -0.2px;
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--gray-200);
}

.breakdown-row:last-child {
  border-bottom: none;
}

.breakdown-row .label {
  font-size: 12px;
  color: var(--gray-600);
}
.breakdown-row .value {
  font-size: 13px;
  font-weight: 700;
  color: var(--gray-800);
}

.anomaly-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
  padding: 16px;
  background: var(--white);
  border-radius: 12px;
  box-shadow: var(--shadow);
  border: 1px solid var(--gray-200);
  color: var(--gray-600);
  font-size: 14px;
  font-weight: 500;
}

/* 사기 민원 경고 박스 */
.fraud-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid var(--gray-300);
  background: #fff1f2; /* 연한 빨간 배경 */
  color: #b91c1c; /* 짙은 빨강 텍스트 */
  font-weight: 600;
  margin-bottom: 10px;
}
.fraud-warning.danger {
  border-color: #ef4444;
  background: #fee2e2;
  color: #991b1b;
}
.fraud-icon {
  font-size: 16px;
}
.fraud-text {
  font-size: 13px;
}

/* 이상탐지 제목 섹션 */
.anomaly-title-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.help-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid var(--gray-400);
  background: var(--white);
  color: var(--gray-600);
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.help-icon:hover {
  background: var(--kb-yellow-positive);
  color: var(--white);
  border-color: var(--kb-yellow-positive);
  transform: scale(1.1);
}

.help-text {
  line-height: 1;
}

/* 모달창 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 100%;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--gray-200);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--gray-900);
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--gray-100);
  color: var(--gray-600);
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: var(--gray-200);
  color: var(--gray-800);
}

.modal-body {
  padding: 24px;
}

/* 점수 계산 기준 설명 스타일 */
.score-explanation {
  margin-bottom: 24px;
}

.score-explanation h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-900);
}

.explanation-text {
  margin: 0 0 16px 0;
  font-size: 13px;
  color: var(--gray-700);
  line-height: 1.5;
}

.score-breakdown {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.breakdown-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  background: var(--gray-50);
  border-radius: 4px;
  border-left: 3px solid #605850;
}

.breakdown-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-900);
}

.breakdown-desc {
  font-size: 11px;
  color: var(--gray-600);
  line-height: 1.3;
}

.score-criteria {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.score-criteria h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-900);
}

.criteria-summary {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.criteria-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: var(--gray-50);
  border-radius: 4px;
  border-left: 3px solid var(--gray-300);
}

.criteria-row.normal {
  border-left-color: #10b981;
}

.criteria-row.caution {
  border-left-color: #f59e0b;
}

.criteria-row.high {
  border-left-color: #ef4444;
}

.criteria-row .criteria-range {
  font-size: 12px;
  color: var(--gray-600);
  font-weight: 500;
}

.criteria-row .criteria-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-900);
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid var(--gray-200);
  display: flex;
  justify-content: flex-end;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .main-content {
    padding: 12px;
  }

  .step-content {
    padding: 16px;
  }

  .step-indicator {
    padding: 8px;
  }

  .step-line {
    width: 30px;
    margin: 0 8px;
  }

  .account-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 12px;
  }

  .balance {
    text-align: left;
    margin-right: 0;
  }

  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    padding: 10px 20px;
    font-size: 13px;
  }

  .section-header {
    padding: 12px;
    margin-bottom: 12px;
  }

  .form-section {
    padding: 12px;
    gap: 12px;
  }

  .confirmation-card {
    padding: 12px;
    gap: 12px;
  }
}
</style>
