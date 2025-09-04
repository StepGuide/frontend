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
            <span class="help-icon">❓</span>
            <span class="help-text">도움</span>
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
        <div class="account-dropdown">
          <select v-model="selectedAccountId" @change="loadTransactions" class="account-select">
            <option value="">계좌를 선택하세요</option>
            <option v-for="account in accounts" :key="account.id" :value="account.id">
              {{ account.bankName }} - {{ account.accountNumber }} (₩ {{ formatNumber(account.balance) }})
            </option>
          </select>
        </div>
      </div>

      <!-- 조회 조건 -->
      <div v-if="selectedAccountId" class="inquiry-conditions">
        <div class="section-header">
          <h2>조회 조건</h2>
        </div>
        
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

        <div class="custom-period" v-if="selectedPeriod === 'custom'">
          <div class="date-inputs">
            <div class="date-group">
              <label>시작일</label>
              <input 
                v-model="customStartDate" 
                type="date" 
                class="date-input"
                :max="today"
              />
            </div>
            <div class="date-group">
              <label>종료일</label>
              <input 
                v-model="customEndDate" 
                type="date" 
                class="date-input"
                :max="today"
              />
            </div>
          </div>
        </div>

        <div class="transaction-type-filter">
          <label>거래 유형</label>
          <div class="filter-options">
            <label class="filter-option">
              <input 
                v-model="transactionTypes" 
                type="checkbox" 
                value="all"
                @change="toggleAllTypes"
              />
              <span>전체</span>
            </label>
            <label class="filter-option">
              <input v-model="transactionTypes" type="checkbox" value="income" />
              <span>입금</span>
            </label>
            <label class="filter-option">
              <input v-model="transactionTypes" type="checkbox" value="expense" />
              <span>출금</span>
            </label>
            <label class="filter-option">
              <input v-model="transactionTypes" type="checkbox" value="transfer" />
              <span>이체</span>
            </label>
          </div>
        </div>

        <div class="search-actions">
          <button class="btn-secondary" @click="resetConditions">초기화</button>
          <button class="btn-primary" @click="searchTransactions">조회하기</button>
        </div>
      </div>

      <!-- 거래내역 결과 -->
      <div v-if="transactions.length > 0" class="transaction-results">
        <div class="results-header">
          <h2>거래내역</h2>
          <div class="results-summary">
            <span class="total-count">총 {{ transactions.length }}건</span>
            <span class="total-amount">
              잔액: ₩ {{ formatNumber(selectedAccount?.balance || 0) }}
            </span>
          </div>
        </div>

        <div class="transaction-list">
          <div 
            v-for="transaction in transactions" 
            :key="transaction.id"
            class="transaction-item"
          >
            <div class="transaction-icon">
              <span :class="getTransactionIcon(transaction.type)">
                {{ getTransactionEmoji(transaction.type) }}
              </span>
            </div>
            
            <div class="transaction-info">
              <div class="transaction-main">
                <div class="transaction-type">{{ getTransactionTypeName(transaction.type) }}</div>
                <div class="transaction-desc">{{ transaction.description }}</div>
              </div>
              <div class="transaction-details">
                <div class="transaction-date">{{ formatDate(transaction.date) }}</div>
                <div class="transaction-time">{{ transaction.time }}</div>
                <div v-if="transaction.balance" class="transaction-balance">
                  잔액: ₩ {{ formatNumber(transaction.balance) }}
                </div>
              </div>
            </div>

            <div class="transaction-amount">
              <div 
                class="amount"
                :class="{ 
                  income: transaction.amount > 0, 
                  expense: transaction.amount < 0 
                }"
              >
                {{ transaction.amount > 0 ? '+' : '' }}₩ {{ formatNumber(Math.abs(transaction.amount)) }}
              </div>
            </div>
          </div>
        </div>

        <div class="load-more">
          <button class="btn-secondary" @click="loadMoreTransactions">
            더보기
          </button>
        </div>
      </div>

      <!-- 조회 결과 없음 -->
      <div v-else-if="selectedAccountId && hasSearched" class="no-results">
        <div class="no-results-icon">📋</div>
        <h3>조회된 거래내역이 없습니다</h3>
        <p>선택한 조건에 해당하는 거래내역이 없습니다.</p>
        <button class="btn-primary" @click="resetConditions">조건 다시 설정</button>
      </div>

      <!-- 계좌 미선택 안내 -->
      <div v-else-if="!selectedAccountId" class="select-account-prompt">
        <div class="prompt-icon">🏦</div>
        <h3>계좌를 선택해주세요</h3>
        <p>조회할 계좌를 선택하면 거래내역을 확인할 수 있습니다.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 반응형 데이터
const selectedAccountId = ref('')
const selectedPeriod = ref('week')
const customStartDate = ref('')
const customEndDate = ref('')
const transactionTypes = ref(['all'])
const transactions = ref([])
const hasSearched = ref(false)

// 오늘 날짜
const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

// 계좌 목록 (샘플 데이터)
const accounts = ref([
  {
    id: 1,
    bankName: 'KB국민은행',
    accountNumber: '123-456789-01-234',
    accountName: '김영희',
    balance: 2450000
  },
  {
    id: 2,
    bankName: 'KB국민은행',
    accountNumber: '987-654321-02-345',
    accountName: '김영희',
    balance: 1200000
  }
])

// 조회 기간 옵션
const periods = ref([
  { label: '최근 1주', value: 'week' },
  { label: '최근 1개월', value: 'month' },
  { label: '최근 3개월', value: 'quarter' },
  { label: '직접 선택', value: 'custom' }
])

// 선택된 계좌
const selectedAccount = computed(() => {
  return accounts.value.find(account => account.id == selectedAccountId.value)
})

// 샘플 거래내역 데이터
const sampleTransactions = ref([
  {
    id: 1,
    type: 'income',
    description: '월급',
    amount: 500000,
    date: '2024-01-15',
    time: '09:30',
    balance: 2450000
  },
  {
    id: 2,
    type: 'expense',
    description: 'ATM 출금',
    amount: -50000,
    date: '2024-01-14',
    time: '14:20',
    balance: 1950000
  },
  {
    id: 3,
    type: 'transfer',
    description: '이체 - 김철수',
    amount: -100000,
    date: '2024-01-13',
    time: '16:45',
    balance: 2000000
  },
  {
    id: 4,
    type: 'income',
    description: '이자',
    amount: 2500,
    date: '2024-01-12',
    time: '00:00',
    balance: 2100000
  },
  {
    id: 5,
    type: 'expense',
    description: '카드 결제',
    amount: -75000,
    date: '2024-01-11',
    time: '19:30',
    balance: 2097500
  }
])

// 메서드
const goBack = () => {
  router.push('/')
}

const selectPeriod = (period) => {
  selectedPeriod.value = period
  if (period !== 'custom') {
    customStartDate.value = ''
    customEndDate.value = ''
  }
}

const toggleAllTypes = () => {
  if (transactionTypes.value.includes('all')) {
    transactionTypes.value = ['all']
  } else {
    transactionTypes.value = []
  }
}

const loadTransactions = () => {
  transactions.value = []
  hasSearched.value = false
}

const searchTransactions = () => {
  // 실제 API 호출 대신 샘플 데이터 사용
  transactions.value = [...sampleTransactions.value]
  hasSearched.value = true
}

const loadMoreTransactions = () => {
  // 더 많은 거래내역 로드 로직
  alert('더 많은 거래내역을 불러옵니다.')
}

const resetConditions = () => {
  selectedPeriod.value = 'week'
  customStartDate.value = ''
  customEndDate.value = ''
  transactionTypes.value = ['all']
  transactions.value = []
  hasSearched.value = false
}

const formatNumber = (num) => {
  return new Intl.NumberFormat('ko-KR').format(num)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getTransactionIcon = (type) => {
  const icons = {
    income: 'income-icon',
    expense: 'expense-icon',
    transfer: 'transfer-icon'
  }
  return icons[type] || 'default-icon'
}

const getTransactionEmoji = (type) => {
  const emojis = {
    income: '💰',
    expense: '💸',
    transfer: '🔄'
  }
  return emojis[type] || '📄'
}

const getTransactionTypeName = (type) => {
  const names = {
    income: '입금',
    expense: '출금',
    transfer: '이체'
  }
  return names[type] || '기타'
}

const requestHelp = () => {
  router.push('/user')
}

onMounted(() => {
  // 초기화 로직
})
</script>

<style scoped>
/* CSS 변수 정의 - KB국민은행 공식 브랜드 컬러 */
.inquiry-page {
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

.inquiry-page {
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
  background: linear-gradient(135deg, var(--kb-yellow-positive) 0%, var(--primary-dark) 100%);
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
}

/* 계좌 선택 */
.account-selector {
  background: var(--white);
  border-radius: 12px;
  padding: 12px;
  box-shadow: var(--shadow);
  border: 1px solid var(--gray-200);
}

.account-select {
  width: 100%;
  padding: 12px;
  border: 2px solid var(--gray-200);
  border-radius: 8px;
  font-size: 14px;
  background: var(--white);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 500;
  letter-spacing: -0.1px;
}

.account-select:focus {
  outline: none;
  border-color: var(--kb-yellow-positive);
  box-shadow: 0 0 0 3px rgba(255, 188, 0, 0.1);
}

/* 조회 조건 */
.inquiry-conditions {
  background: var(--white);
  border-radius: 12px;
  padding: 12px;
  box-shadow: var(--shadow);
  border: 1px solid var(--gray-200);
}

.condition-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.period-tab {
  padding: 12px 20px;
  border: 2px solid var(--gray-200);
  border-radius: 20px;
  background: var(--white);
  color: var(--gray-600);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.1px;
}

.period-tab:hover {
  border-color: var(--kb-yellow-positive);
  color: var(--kb-yellow-positive);
}

.period-tab.active {
  background: var(--kb-yellow-positive);
  border-color: var(--kb-yellow-positive);
  color: var(--white);
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
  margin-bottom: 20px;
}

.transaction-type-filter label {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: var(--kb-text-primary);
  margin-bottom: 12px;
}

.filter-options {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: var(--kb-text-secondary);
}

.filter-option input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--kb-orange);
}

.search-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 거래내역 결과 */
.transaction-results {
  background: var(--white);
  border-radius: 12px;
  padding: 12px;
  box-shadow: var(--shadow);
  border: 1px solid var(--gray-200);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--kb-border);
}

.results-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--kb-gray);
  letter-spacing: -0.3px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.3px;
}

/* 거래내역 목록 */
.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--white);
  border-radius: 12px;
  border: 1px solid var(--gray-200);
  box-shadow: var(--shadow);
  transition: all 0.2s ease;
}

.transaction-item:hover {
  background: var(--gray-50);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.transaction-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--white);
  border-radius: 50%;
  font-size: 24px;
}

.transaction-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.transaction-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.transaction-type {
  font-size: 16px;
  font-weight: 700;
  color: var(--kb-text-primary);
}

.transaction-desc {
  font-size: 14px;
  color: var(--kb-text-secondary);
  font-weight: 600;
}

.transaction-details {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--kb-text-light);
  font-weight: 600;
}

.transaction-balance {
  color: var(--kb-text-secondary);
}

.transaction-amount {
  text-align: right;
}

.amount {
  font-size: 18px;
  font-weight: 700;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.3px;
}

.amount.income {
  color: var(--success);
}

.amount.expense {
  color: var(--danger);
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
.btn-primary, .btn-secondary {
  padding: 12px 24px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 100px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
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
  
  .condition-tabs {
    flex-direction: column;
  }
  
  .period-tab {
    text-align: center;
  }
  
  .date-inputs {
    flex-direction: column;
  }
  
  .filter-options {
    flex-direction: column;
    gap: 8px;
  }
  
  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .results-summary {
    align-items: flex-start;
  }
  
  .transaction-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .transaction-amount {
    text-align: left;
    width: 100%;
  }
  
  .search-actions {
    flex-direction: column;
  }
  
  .btn-primary, .btn-secondary {
    width: 100%;
  }
}
</style>
