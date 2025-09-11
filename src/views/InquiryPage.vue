<template>
  <div class="inquiry-page">
    <!-- 상단 네비게이션 -->
    <nav class="navbar">
      <div class="nav-content">
        <div class="logo">
          <button class="back-btn" @click="goBack">
            <span class="back-icon">←</span>
          </button>
          <span class="logo-text">거래내역 조회</span>
        </div>
        <div class="nav-actions">
          <button class="help-btn" @click="requestHelp">
            ❓ 도움
          </button>
        </div>
      </div>
    </nav>

    <!-- 메인 콘텐츠 -->
    <div class="main-content">
      <!-- 계좌 선택 -->
      <div class="account-selector">
        <div class="section-header">
          <h2>조회할 계좌 선택</h2>
        </div>
        <div class="account-list">
          <div 
            v-for="account in accounts" 
            :key="account.accountId" 
            class="account-item"
            :class="{ active: selectedAccountId === account.accountId }"
            @click="selectedAccountId = account.accountId"
          >
            <img 
              :src="getBankImage(account.bankCode || '004')" 
              :alt="getBankName(account.bankCode || '004')"
              class="bank-logo"
            />
            <div class="account-info">
              <div class="account-name">{{ account.accountName }}</div>
              <div class="account-number">{{ account.accountNumber }}</div>
              <div class="bank-name">{{ getBankName(account.bankCode || '004') }}</div>
            </div>
            <div class="account-balance">
              ₩{{ formatNumber(account.balance || 0) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 조회 조건 -->
      <div class="inquiry-conditions">
        <div class="section-header"><h2>조회 조건</h2></div>

        <div class="condition-tabs">
          <button
            v-for="period in periods"
            :key="period.value"
            class="period-tab"
            :class="{ active: selectedPeriod === period.value }"
            @click="selectPeriod(period.value)"
          >
            {{ period.label }}
          </button>
        </div>

        <div v-if="selectedPeriod === 'custom'" class="custom-period">
          <div class="date-inputs">
            <div class="date-group">
              <label>시작일</label>
              <input v-model="customStartDate" type="date" :max="today" />
            </div>
            <div class="date-group">
              <label>종료일</label>
              <input v-model="customEndDate" type="date" :max="today" />
            </div>
          </div>
        </div>

        <div class="transaction-type-filter">
          <label>거래 유형</label>
          <div class="filter-options">
            <label class="filter-option">
              <input type="checkbox" value="all" v-model="transactionTypes" @change="toggleAllTypes" /> 전체
            </label>
            <label class="filter-option">
              <input type="checkbox" value="income" v-model="transactionTypes" @change="handleIndividualTypeChange" /> 입금
            </label>
            <label class="filter-option">
              <input type="checkbox" value="expense" v-model="transactionTypes" @change="handleIndividualTypeChange" /> 출금
            </label>
            <label class="filter-option">
              <input type="checkbox" value="transfer" v-model="transactionTypes" @change="handleIndividualTypeChange" /> 이체
            </label>
          </div>
        </div>

        <div class="search-actions">
          <button class="btn-secondary" @click="resetConditions">초기화</button>
          <button class="btn-primary" @click="searchTransactions">조회하기</button>
        </div>
      </div>

      <!-- 거래내역 결과 -->
      <div class="transaction-results">
        <div class="results-header">
          <h2>거래내역</h2>
          <div class="results-summary">
            <span>총 {{ transactions.length }}건</span>
            <span>잔액: ₩ {{ formatNumber(selectedAccount?.balance || 0) }}</span>
          </div>
        </div>

        <div class="transaction-list-container">
          <div v-if="transactions.length" class="transaction-list">
            <div v-for="t in transactions" :key="t.id" class="transaction-item">
              <img 
                :src="getBankImage(t.bankCode || selectedAccount?.bankCode || '004')" 
                :alt="getBankName(t.bankCode || selectedAccount?.bankCode || '004')"
                class="transaction-bank-logo"
              />
              <div class="transaction-info">
                <div class="transaction-type" :class="{ income: t.amount>0, expense: t.amount<0 }">
                  {{ getTransactionTypeName(t.type) }}
                </div>
                <div class="transaction-desc">{{ t.description }}</div>
                <div class="transaction-details">
                  <span>{{ formatDate(t.date) }}</span>
                  <span>{{ t.time }}</span>
                  <span v-if="t.balance" class="transaction-balance">잔액: ₩ {{ formatNumber(t.balance) }}</span>
                </div>
              </div>
              <div class="transaction-amount" :class="{ income: t.amount>0, expense: t.amount<0 }">
                {{ t.amount > 0 ? '+' : '' }}₩{{ formatNumber(Math.abs(t.amount)) }}
              </div>
            </div>
          </div>
          <div v-else class="no-transactions">
            <div class="no-transactions-icon">📋</div>
            <p>조회된 거래내역이 없습니다</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';
import { useRouter, useRoute } from 'vue-router';
import { getBankImage, getBankName } from '@/utils/bankMapping';
import { useAuthStore } from '@/stores/auth';
const router = useRouter();
const route = useRoute();

// 상태
const auth = useAuthStore();
const accounts = ref([]);
const selectedAccountId = ref('');
const selectedPeriod = ref('week');
const customStartDate = ref('');
const customEndDate = ref('');
const transactionTypes = ref(['all']);
const transactions = ref([]);
const hasSearched = ref(false);

// 예시: 조회할 기간 탭
const periods = [
  { label: '이번주', value: 'week' },
  { label: '이번달', value: 'month' },
  { label: '1년', value: 'year' },
  { label: '기간설정', value: 'custom' },
];

// 오늘 날짜
const today = computed(() => new Date().toISOString().split('T')[0]);

// 선택 계좌
const selectedAccount = computed(() =>
  accounts.value.find(a => (a.id ?? a.accountId) == selectedAccountId.value)
);

// 초기 계좌 조회
onMounted(async () => {
 if (!auth.userId) {
    console.log('userId가 아직 없음');
    return; // userId 없으면 조회하지 않음
  }

  try {
    const res = await axios.get(`/api/transfer/accounts/${auth.userId}`);
     // 예시: userId = 1
    accounts.value = res.data;
    // 쿼리 파라미터 우선
    const qAccountId = route.query.accountId;
    if (qAccountId) {
      const target = accounts.value.find(a => String(a.id || a.accountId) === String(qAccountId));
      if (target) {
        selectedAccountId.value = target.id || target.accountId;
      }
    }
    // 기본 선택 보정
    if (!selectedAccountId.value && accounts.value.length) {
      selectedAccountId.value = accounts.value[0].id || accounts.value[0].accountId;
    }
  } catch (err) {
    console.log(auth.userId);
    console.error(err);
  }
});

// 거래내역 조회
const fetchTransactions = async (accountId) => {
  if (!accountId) return;
  try {
    const res = await axios.get(`/api/transfer/transactions/${accountId}`);
    transactions.value = res.data.map(t => ({
      id: t.transactionId,
      type: t.depositWithdrawal === 'DEPOSIT' ? 'income'
           : t.depositWithdrawal === 'TRANSFER' ? 'transfer'
           : 'expense',
      description: t.memo,
      amount: t.depositWithdrawal === 'DEPOSIT' ? t.transactionAmount : -t.transactionAmount,
      date: t.createdTime?.split('T')[0] || '',
      time: t.createdTime?.split('T')[1] || '',
      balance: selectedAccount.value?.balance || null,
      bankCode: t.bankCode || selectedAccount.value?.bankCode || '004',
    }));

    if (!transactionTypes.value.includes('all')) {
      transactions.value = transactions.value.filter(t => transactionTypes.value.includes(t.type));
    }

    hasSearched.value = true;
  } catch (err) {
    console.error(err);
    transactions.value = [];
    hasSearched.value = true;
  }
};

// 선택 계좌 변경 시 자동 조회
watch(selectedAccountId, (id) => {
  if (id) fetchTransactions(id);
});

// 조회 버튼
const searchTransactions = () => fetchTransactions(selectedAccountId.value);

// 초기화
const resetConditions = () => {
  selectedPeriod.value = 'week';
  customStartDate.value = '';
  customEndDate.value = '';
  transactionTypes.value = ['all'];
  transactions.value = [];
  hasSearched.value = false;
};

// 기간 선택
const selectPeriod = (p) => {
  selectedPeriod.value = p;
  if (p !== 'custom') {
    customStartDate.value = '';
    customEndDate.value = '';
  }
};

// 전체/개별 거래 유형 토글
const toggleAllTypes = () => {
  if (transactionTypes.value.includes('all')) {
    // 전체가 체크되어 있으면 모든 개별 옵션을 체크
    transactionTypes.value = ['income', 'expense', 'transfer'];
  } else {
    // 개별 옵션이 모두 체크되어 있으면 전체를 체크
    const hasAllIndividual = ['income', 'expense', 'transfer'].every(type => 
      transactionTypes.value.includes(type)
    );
    transactionTypes.value = hasAllIndividual ? ['all'] : transactionTypes.value;
  }
};

// 개별 거래 유형 선택 시 전체 체크 해제
const handleIndividualTypeChange = () => {
  if (transactionTypes.value.includes('all')) {
    transactionTypes.value = transactionTypes.value.filter(type => type !== 'all');
  }
};

// 유틸
const formatNumber = (num) => new Intl.NumberFormat('ko-KR').format(num);
const formatDate = (d) => new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
const getTransactionTypeName = (type) => ({ income: '입금', expense: '출금', transfer: '이체' }[type] || '기타');

// 뒤로가기
const goBack = () => router.push('/');
const requestHelp = () => router.push('/');
</script>
<style scoped>
/* CSS 변수 정의 - KB국민은행 공식 브랜드 컬러 */
.inquiry-page {
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

.inquiry-page {
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

/* 메인 콘텐츠 */
.main-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 섹션 헤더 */
.section-header {
  margin-bottom: 12px;
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

/* 계좌 선택 */
.account-selector {
  background: var(--white);
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--gray-200);
  margin-bottom: 24px;
}

.account-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.account-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--gray-50);
  border: 2px solid var(--gray-200);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.account-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--kb-yellow-positive) 0%, var(--primary-dark) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 12px;
}

.account-item:hover {
  background: var(--white);
  border-color: var(--kb-yellow-positive);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.account-item:hover::before {
  opacity: 0.05;
}

.account-item.active {
  background: var(--white);
  border-color: var(--kb-yellow-positive);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.account-item.active::before {
  opacity: 0.1;
}

.bank-logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
  border-radius: 8px;
  background: var(--white);
  padding: 4px;
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.account-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
  z-index: 1;
}

.account-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--gray-800);
  letter-spacing: -0.2px;
}

.account-number {
  font-size: 14px;
  color: var(--gray-600);
  font-weight: 500;
  font-family: 'Courier New', monospace;
}

.bank-name {
  font-size: 12px;
  color: var(--gray-500);
  font-weight: 600;
  background: var(--gray-100);
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
  width: fit-content;
}

.account-balance {
  font-size: 18px;
  font-weight: 700;
  color: var(--kb-yellow-positive);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.3px;
  position: relative;
  z-index: 1;
}

/* 조회 조건 */
.inquiry-conditions {
  background: var(--white);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--gray-200);
  margin-bottom: 24px;
}

.condition-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.period-tab {
  padding: 14px 24px;
  border: 2px solid var(--gray-200);
  border-radius: 24px;
  background: var(--white);
  color: var(--gray-600);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.1px;
  position: relative;
  overflow: hidden;
}

.period-tab::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--kb-yellow-positive) 0%, var(--primary-dark) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 24px;
}

.period-tab:hover {
  border-color: var(--kb-yellow-positive);
  color: var(--kb-yellow-positive);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.period-tab:hover::before {
  opacity: 0.1;
}

.period-tab.active {
  background: var(--kb-yellow-positive);
  border-color: var(--kb-yellow-positive);
  color: var(--white);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.period-tab.active::before {
  opacity: 0;
}

.custom-period {
  margin-bottom: 20px;
}

.date-inputs {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.date-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 150px;
}

.date-group label {
  font-size: 14px;
  font-weight: 600;
  color: var(--kb-text-primary);
}

.date-input {
  padding: 12px;
  border: 2px solid var(--kb-border);
  border-radius: 8px;
  font-size: 14px;
  background: var(--white);
  cursor: pointer;
}

.date-input:focus {
  outline: none;
  border-color: var(--kb-orange);
}

.transaction-type-filter {
  margin-bottom: 24px;
}

.transaction-type-filter label {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 16px;
  letter-spacing: -0.2px;
}

.filter-options {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-700);
  padding: 8px 16px;
  border-radius: 20px;
  background: var(--gray-50);
  border: 2px solid var(--gray-200);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.filter-option::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--kb-yellow-positive) 0%, var(--primary-dark) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 20px;
}

.filter-option:hover {
  background: var(--white);
  border-color: var(--kb-yellow-positive);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.filter-option:hover::before {
  opacity: 0.05;
}

.filter-option input[type='checkbox'] {
  width: 20px;
  height: 20px;
  accent-color: var(--kb-yellow-positive);
  cursor: pointer;
  position: relative;
  z-index: 1;
}

.filter-option input[type='checkbox']:checked + span {
  color: var(--kb-yellow-positive);
  font-weight: 700;
}

.search-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 거래내역 결과 */
.transaction-results {
  background: var(--white);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--gray-200);
  margin-bottom: 24px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid var(--gray-200);
}

.results-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--kb-gray);
  letter-spacing: -0.3px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
}

.results-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.total-count {
  font-size: 14px;
  font-weight: 600;
  color: var(--kb-text-secondary);
}

.total-amount {
  font-size: 18px;
  font-weight: 700;
  color: var(--kb-yellow-positive);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.3px;
}

/* 거래내역 컨테이너 */
.transaction-list-container {
  max-height: 500px;
  overflow-y: auto;
  border-radius: 12px;
  background: var(--gray-50);
  padding: 8px;
}

.transaction-list-container::-webkit-scrollbar {
  width: 6px;
}

.transaction-list-container::-webkit-scrollbar-track {
  background: var(--gray-200);
  border-radius: 3px;
}

.transaction-list-container::-webkit-scrollbar-thumb {
  background: var(--kb-yellow-positive);
  border-radius: 3px;
}

.transaction-list-container::-webkit-scrollbar-thumb:hover {
  background: var(--primary-dark);
}

/* 거래내역 목록 */
.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.no-transactions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: var(--gray-500);
}

.no-transactions-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.no-transactions p {
  font-size: 16px;
  font-weight: 600;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--white);
  border-radius: 12px;
  border: 1px solid var(--gray-200);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  min-height: 80px;
  flex-shrink: 0;
}

.transaction-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--kb-yellow-positive) 0%, var(--primary-dark) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 16px;
}

.transaction-item:hover {
  background: var(--gray-50);
  border-color: var(--kb-yellow-positive);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.transaction-item:hover::before {
  opacity: 0.03;
}

/* .transaction-icon {
  width: 40px; 
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--white);
  border-radius: 50%;
  box-shadow: var(--shadow-sm);
  flex-shrink: 0; 
} */

.bank-logo {
  width: 60px; /* 적절한 은행 로고 크기 */
  height: 60px;
  object-fit: contain; /* 비율 유지 */
}

.transaction-bank-logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
  border-radius: 8px;
  background: var(--white);
  padding: 4px;
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.transaction-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
  z-index: 1;
}

.transaction-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.transaction-type {
  font-size: 16px;
  font-weight: 700;
  color: var(--gray-800);
  letter-spacing: -0.2px;
}

.transaction-type.income {
  color: #2563eb; /* 파란색 - 입금 */
}

.transaction-type.expense {
  color: #dc2626; /* 빨간색 - 출금 */
}

.transaction-desc {
  font-size: 14px;
  color: var(--gray-600);
  font-weight: 600;
  line-height: 1.4;
}

.transaction-details {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--gray-500);
  font-weight: 600;
  flex-wrap: wrap;
}

.transaction-details span {
  background: var(--gray-100);
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 11px;
}

.transaction-balance {
  color: var(--gray-600);
  background: var(--kb-yellow-positive) !important;
  color: var(--white) !important;
  font-weight: 700;
}

.transaction-amount {
  text-align: right;
  position: relative;
  z-index: 1;
}

.amount {
  font-size: 20px;
  font-weight: 700;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.3px;
}

.amount.income {
  color: #2563eb; /* 파란색 - 입금 */
}

.amount.expense {
  color: #dc2626; /* 빨간색 - 출금 */
}

.load-more {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--kb-border);
}

/* 조회 결과 없음 */
.no-results {
  background: var(--white);
  border-radius: 16px;
  padding: 48px 24px;
  text-align: center;
  box-shadow: 0 4px 16px var(--kb-shadow);
}

.no-results-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.no-results h3 {
  font-size: 24px;
  font-weight: 700;
  color: var(--kb-text-primary);
  margin-bottom: 8px;
}

.no-results p {
  font-size: 16px;
  color: var(--kb-text-secondary);
  margin-bottom: 24px;
  font-weight: 600;
}

/* 계좌 미선택 안내 */
.select-account-prompt {
  background: var(--white);
  border-radius: 16px;
  padding: 48px 24px;
  text-align: center;
  box-shadow: 0 4px 16px var(--kb-shadow);
}

.prompt-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.select-account-prompt h3 {
  font-size: 24px;
  font-weight: 700;
  color: var(--kb-text-primary);
  margin-bottom: 8px;
}

.select-account-prompt p {
  font-size: 16px;
  color: var(--kb-text-secondary);
  font-weight: 600;
}

/* 버튼 */
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

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background: var(--white);
  color: var(--gray-800);
  border: 2px solid var(--gray-300);
  box-shadow: var(--shadow);
}

.btn-secondary:hover {
  background: var(--gray-50);
  border-color: var(--gray-400);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }

  .account-selector,
  .inquiry-conditions,
  .transaction-results {
    padding: 16px;
  }

  .condition-tabs {
    flex-direction: column;
    gap: 8px;
  }

  .period-tab {
    text-align: center;
    padding: 12px 20px;
  }

  .date-inputs {
    flex-direction: column;
    gap: 12px;
  }

  .filter-options {
    flex-direction: column;
    gap: 12px;
  }

  .filter-option {
    justify-content: center;
    padding: 12px 20px;
  }

  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .results-summary {
    align-items: flex-start;
  }

  .account-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 20px;
  }

  .account-info {
    width: 100%;
  }

  .account-balance {
    align-self: flex-end;
    font-size: 16px;
  }

  .transaction-list-container {
    max-height: 400px;
  }

  .transaction-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    min-height: 100px;
  }

  .transaction-bank-logo {
    align-self: flex-start;
  }

  .transaction-amount {
    text-align: left;
    width: 100%;
    align-self: flex-end;
  }

  .transaction-details {
    flex-direction: column;
    gap: 8px;
  }

  .search-actions {
    flex-direction: column;
    gap: 12px;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    padding: 16px 24px;
    font-size: 16px;
  }
}
</style>
