<template>
  <div class="account-overview-page">
    <!-- 상단 네비게이션 -->
    <nav class="navbar">
      <div class="nav-content">
        <div class="logo">
          <button class="back-btn" @click="goBack">
            <span class="back-icon">←</span>
          </button>
          <span class="logo-icon">🏦</span>
          <span class="logo-text">내 계좌 현황</span>
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
      <!-- 총 자산 요약 -->
      <div class="total-assets-summary">
        <div class="summary-card">
          <div class="summary-header">
            <h2>총 자산</h2>
            <button class="toggle-btn" @click="toggleAssetVisibility">
              <span class="toggle-icon">{{ showAssets ? '👁️' : '🙈' }}</span>
            </button>
          </div>
          <div class="total-amount">
            <span v-if="showAssets" class="amount">₩ {{ formatNumber(totalAssets) }}</span>
            <span v-else class="hidden-amount">••••••••</span>
          </div>
          <div class="asset-breakdown">
            <div class="breakdown-item">
              <span class="label">예금</span>
              <span v-if="showAssets" class="value">₩ {{ formatNumber(totalDeposits) }}</span>
              <span v-else class="hidden-value">••••••</span>
            </div>
            <div class="breakdown-item">
              <span class="label">적금</span>
              <span v-if="showAssets" class="value">₩ {{ formatNumber(totalSavings) }}</span>
              <span v-else class="hidden-value">••••••</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 계좌 목록 -->
      <div class="accounts-section">
        <div class="section-header">
          <h2>보유 계좌</h2>
          <div class="account-count">총 {{ accounts.length }}개</div>
        </div>

        <div class="account-list">
          <div 
            v-for="account in accounts" 
            :key="account.id"
            class="account-card"
            :class="{ primary: account.isPrimary }"
          >
            <div class="account-header">
              <div class="bank-info">
                <div class="bank-icon">{{ getBankIcon(account.bankCode) }}</div>
                <div class="bank-details">
                  <div class="bank-name">{{ account.bankName }}</div>
                  <div class="account-type">{{ account.accountType }}</div>
                </div>
              </div>
              <div class="account-actions">
                <button class="action-btn" @click="viewTransactions(account)">
                  <span class="action-icon">📋</span>
                  <span class="action-text">조회</span>
                </button>
                <button class="action-btn" @click="transfer(account)">
                  <span class="action-icon">💸</span>
                  <span class="action-text">이체</span>
                </button>
              </div>
            </div>

            <div class="account-details">
              <div class="account-number">{{ account.accountNumber }}</div>
              <div class="account-name">{{ account.accountName }}</div>
            </div>

            <div class="balance-section">
              <div class="balance-info">
                <div class="balance-label">잔액</div>
                <div class="balance-amount">
                  <span v-if="showAssets">₩ {{ formatNumber(account.balance) }}</span>
                  <span v-else class="hidden-amount">••••••••</span>
                </div>
              </div>
              <div class="balance-change" :class="{ positive: account.change > 0, negative: account.change < 0 }">
                <span v-if="showAssets">
                  {{ account.change > 0 ? '+' : '' }}₩ {{ formatNumber(Math.abs(account.change)) }}
                </span>
                <span v-else class="hidden-value">••••</span>
              </div>
            </div>

            <div class="account-footer">
              <div class="last-transaction">
                <span class="label">최근 거래:</span>
                <span class="value">{{ account.lastTransaction }}</span>
              </div>
              <div class="account-status" :class="account.status">
                {{ getStatusText(account.status) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 월별 수입/지출 요약 -->
      <div class="monthly-summary">
        <div class="section-header">
          <h2>이번 달 수입/지출</h2>
          <div class="month-selector">
            <button class="month-btn" @click="changeMonth(-1)">←</button>
            <span class="current-month">{{ currentMonth }}</span>
            <button class="month-btn" @click="changeMonth(1)">→</button>
          </div>
        </div>

        <div class="summary-grid">
          <div class="summary-item income">
            <div class="summary-icon">💰</div>
            <div class="summary-content">
              <div class="summary-label">수입</div>
              <div class="summary-amount">₩ {{ formatNumber(monthlyIncome) }}</div>
            </div>
          </div>
          
          <div class="summary-item expense">
            <div class="summary-icon">💸</div>
            <div class="summary-content">
              <div class="summary-label">지출</div>
              <div class="summary-amount">₩ {{ formatNumber(monthlyExpense) }}</div>
            </div>
          </div>
          
          <div class="summary-item net">
            <div class="summary-icon">📊</div>
            <div class="summary-content">
              <div class="summary-label">순수입</div>
              <div class="summary-amount" :class="{ positive: netIncome > 0, negative: netIncome < 0 }">
                ₩ {{ formatNumber(Math.abs(netIncome)) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 빠른 액션 -->
      <div class="quick-actions">
        <div class="section-header">
          <h2>빠른 액션</h2>
        </div>
        
        <div class="action-grid">
          <button class="quick-action-btn" @click="goToTransfer">
            <div class="action-icon">💸</div>
            <div class="action-text">이체하기</div>
          </button>
          
          <button class="quick-action-btn" @click="goToInquiry">
            <div class="action-icon">📋</div>
            <div class="action-text">거래내역</div>
          </button>
          
          <button class="quick-action-btn" @click="goToPractice">
            <div class="action-icon">🎯</div>
            <div class="action-text">연습모드</div>
          </button>
          
          <button class="quick-action-btn" @click="requestHelp">
            <div class="action-icon">❓</div>
            <div class="action-text">도움 요청</div>
          </button>
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
const showAssets = ref(true)
const currentMonth = ref('2024년 1월')

// 계좌 목록 (샘플 데이터)
const accounts = ref([
  {
    id: 1,
    bankCode: 'KB',
    bankName: 'KB국민은행',
    accountNumber: '123-456789-01-234',
    accountName: '김영희',
    accountType: '입출금통장',
    balance: 2450000,
    change: 50000,
    lastTransaction: '2024.01.15',
    status: 'active',
    isPrimary: true
  },
  {
    id: 2,
    bankCode: 'KB',
    bankName: 'KB국민은행',
    accountNumber: '987-654321-02-345',
    accountName: '김영희',
    accountType: '적금통장',
    balance: 1200000,
    change: 100000,
    lastTransaction: '2024.01.14',
    status: 'active',
    isPrimary: false
  },
  {
    id: 3,
    bankCode: 'SHINHAN',
    bankName: '신한은행',
    accountNumber: '110-123-456789',
    accountName: '김영희',
    accountType: '입출금통장',
    balance: 850000,
    change: -25000,
    lastTransaction: '2024.01.13',
    status: 'active',
    isPrimary: false
  }
])

// 월별 수입/지출 데이터
const monthlyIncome = ref(500000)
const monthlyExpense = ref(175000)

// 계산된 속성
const totalAssets = computed(() => {
  return accounts.value.reduce((sum, account) => sum + account.balance, 0)
})

const totalDeposits = computed(() => {
  return accounts.value
    .filter(account => account.accountType === '입출금통장')
    .reduce((sum, account) => sum + account.balance, 0)
})

const totalSavings = computed(() => {
  return accounts.value
    .filter(account => account.accountType === '적금통장')
    .reduce((sum, account) => sum + account.balance, 0)
})

const netIncome = computed(() => {
  return monthlyIncome.value - monthlyExpense.value
})

// 메서드
const goBack = () => {
  router.push('/')
}

const toggleAssetVisibility = () => {
  showAssets.value = !showAssets.value
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

const getStatusText = (status) => {
  const statusTexts = {
    'active': '정상',
    'suspended': '정지',
    'closed': '해지'
  }
  return statusTexts[status] || '알 수 없음'
}

const viewTransactions = (account) => {
  router.push({
    path: '/inquiry',
    query: { accountId: account.id }
  })
}

const transfer = (account) => {
  router.push({
    path: '/transfer',
    query: { fromAccount: account.id }
  })
}

const changeMonth = (direction) => {
  // 월 변경 로직 (실제로는 날짜 계산)
  const months = ['1월', '2월', '3월', '4월', '5월', '6월', 
                  '7월', '8월', '9월', '10월', '11월', '12월']
  // 간단한 예시
  alert(`${direction > 0 ? '다음' : '이전'} 달로 이동합니다.`)
}

const goToTransfer = () => {
  router.push('/transfer')
}

const goToInquiry = () => {
  router.push('/inquiry')
}

const goToPractice = () => {
  router.push('/practice')
}

const requestHelp = () => {
  router.push('/user')
}

const formatNumber = (num) => {
  return new Intl.NumberFormat('ko-KR').format(num)
}
</script>

<style scoped>
/* CSS 변수 정의 */
.account-overview-page {
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
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.account-overview-page {
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

/* 총 자산 요약 */
.total-assets-summary {
  background: linear-gradient(135deg, var(--kb-orange) 0%, var(--kb-orange-dark) 100%);
  border-radius: 20px;
  padding: 32px;
  color: var(--kb-gray-light);
  box-shadow: 0 8px 32px rgba(255, 140, 0, 0.3);
}

.summary-card {
  text-align: center;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.summary-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--kb-gray-light);
}

.toggle-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.toggle-icon {
  font-size: 20px;
}

.total-amount {
  margin-bottom: 20px;
}

.amount {
  font-size: 48px;
  font-weight: 800;
  color: var(--kb-gray-light);
}

.hidden-amount {
  font-size: 48px;
  font-weight: 800;
  color: var(--kb-gray-light);
  letter-spacing: 8px;
}

.asset-breakdown {
  display: flex;
  justify-content: center;
  gap: 40px;
}

.breakdown-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.breakdown-item .label {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.breakdown-item .value {
  font-size: 18px;
  font-weight: 700;
  color: var(--kb-gray-light);
}

.hidden-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--kb-gray-light);
  letter-spacing: 4px;
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

.account-count {
  font-size: 14px;
  font-weight: 600;
  color: var(--kb-text-secondary);
  background: var(--kb-orange-light);
  padding: 6px 12px;
  border-radius: 20px;
}

/* 계좌 목록 */
.accounts-section {
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
  transition: all 0.2s ease;
}

.account-card:hover {
  box-shadow: 0 6px 20px var(--kb-shadow-hover);
  transform: translateY(-2px);
}

.account-card.primary {
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

.account-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: var(--kb-orange);
  color: var(--kb-gray-light);
  border: none;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-btn:hover {
  background: var(--kb-orange-dark);
}

.action-icon {
  font-size: 14px;
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
  margin-bottom: 16px;
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

.balance-change {
  font-size: 16px;
  font-weight: 700;
}

.balance-change.positive {
  color: var(--success-color);
}

.balance-change.negative {
  color: var(--error-color);
}

.account-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.last-transaction {
  display: flex;
  gap: 4px;
}

.last-transaction .label {
  color: var(--kb-text-light);
  font-weight: 600;
}

.last-transaction .value {
  color: var(--kb-text-secondary);
  font-weight: 600;
}

.account-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 11px;
}

.account-status.active {
  background: var(--success-color);
  color: var(--kb-gray-light);
}

.account-status.suspended {
  background: var(--error-color);
  color: var(--kb-gray-light);
}

/* 월별 요약 */
.monthly-summary {
  background: var(--kb-gray-light);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px var(--kb-shadow);
}

.month-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.month-btn {
  background: var(--kb-orange);
  color: var(--kb-gray-light);
  border: none;
  padding: 8px 12px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;
  font-weight: bold;
}

.month-btn:hover {
  background: var(--kb-orange-dark);
}

.current-month {
  font-size: 16px;
  font-weight: 700;
  color: var(--kb-text-primary);
  min-width: 100px;
  text-align: center;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--kb-gray);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.summary-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--kb-shadow-hover);
}

.summary-item.income {
  border-left: 4px solid var(--success-color);
}

.summary-item.expense {
  border-left: 4px solid var(--error-color);
}

.summary-item.net {
  border-left: 4px solid var(--kb-orange);
}

.summary-icon {
  font-size: 32px;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  font-size: 14px;
  color: var(--kb-text-secondary);
  font-weight: 600;
}

.summary-amount {
  font-size: 20px;
  font-weight: 800;
  color: var(--kb-text-primary);
}

.summary-amount.positive {
  color: var(--success-color);
}

.summary-amount.negative {
  color: var(--error-color);
}

/* 빠른 액션 */
.quick-actions {
  background: var(--kb-gray-light);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px var(--kb-shadow);
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.quick-action-btn {
  background: var(--kb-gray);
  border: 2px solid var(--kb-border);
  border-radius: 16px;
  padding: 24px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.quick-action-btn:hover {
  background: var(--kb-orange-light);
  border-color: var(--kb-orange);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--kb-shadow-hover);
}

.action-icon {
  font-size: 32px;
}

.action-text {
  font-size: 14px;
  font-weight: 700;
  color: var(--kb-text-primary);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }
  
  .asset-breakdown {
    flex-direction: column;
    gap: 16px;
  }
  
  .account-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .account-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .balance-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .account-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
  }
  
  .action-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .amount {
    font-size: 36px;
  }
  
  .hidden-amount {
    font-size: 36px;
  }
}

@media (max-width: 480px) {
  .action-grid {
    grid-template-columns: 1fr;
  }
  
  .month-selector {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
