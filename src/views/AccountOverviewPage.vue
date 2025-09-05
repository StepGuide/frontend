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
      <!-- 상단 총 잔액 섹션 -->
      <div class="total-balance-section">
        <div class="balance-header">
          <div class="balance-info">
            <h2>총 잔액(예금, 펀드, 신탁/ISA)</h2>
            <div class="balance-toggle">
              <span class="toggle-label">잔액보기</span>
              <button class="toggle-switch" :class="{ active: showAssets }" @click="toggleAssetVisibility">
                <span class="toggle-slider"></span>
              </button>
            </div>
          </div>
        </div>
        <div class="total-balance-amount">
          <span v-if="showAssets" class="balance-text">₩ {{ formatNumber(totalAssets) }}</span>
          <span v-else class="hidden-balance">••••••••</span>
        </div>
        <div class="balance-note">
          <a href="#" class="note-link">잔액에 포함되지 않는 계좌 안내?</a>
        </div>
      </div>

      <!-- 계좌 목록 헤더 -->
      <div class="account-list-header">
        <div class="list-header-info">
          <h3>총 예금 잔액 ₩ {{ formatNumber(totalAssets) }}({{ accounts.length }}계좌)</h3>
        </div>
        <div class="account-category">
          <div class="category-info">
            <span class="category-icon">●</span>
            <span class="category-text">입출금 ({{ accounts.length }}계좌) | 잔액 ₩ {{ formatNumber(totalAssets) }}</span>
          </div>
          <button class="sort-btn">계좌순서변경</button>
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
          >
            <div class="card-content">
              <div class="account-info">
                <div class="account-type">
                  <img :src="getBankInfo(account.bankCode).image" :alt="getBankInfo(account.bankCode).name" class="bank-logo" />
                  {{ account.accountType }}
                </div>
                <div class="account-number">{{ account.accountNumber }}</div>
                <div class="account-name">{{ account.accountName }}</div>
              </div>
              <div class="account-balance">
                <div class="balance-label">잔액</div>
                <div class="balance-amount">
                  <span v-if="showAssets">{{ formatNumber(account.balance) }}원</span>
                  <span v-else class="hidden-amount">••••••원</span>
                </div>
              </div>
            </div>
            <div class="card-actions">
              <button class="action-btn" @click="viewTransactions(account)">조회</button>
              <button class="action-btn" @click="transfer(account)">이체</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getBankInfo } from '@/utils/bankMapping.js'
import { Chart, registerables } from 'chart.js'

const router = useRouter()

// Chart.js 등록
Chart.register(...registerables)

// 반응형 데이터
const showAssets = ref(true)
const currentMonth = ref('2024년 1월')
const chartInstance = ref(null)

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
    isPrimary: true,
    transactions: [
      { type: 'income', amount: 2500000, date: '2024.01.01', description: '급여' },
      { type: 'expense', amount: -150000, date: '2024.01.05', description: '카드결제' },
      { type: 'expense', amount: -200000, date: '2024.01.10', description: '이체' },
      { type: 'income', amount: 50000, date: '2024.01.12', description: '이자' }
    ]
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
    isPrimary: false,
    transactions: [
      { type: 'income', amount: 100000, date: '2024.01.01', description: '적금 납입' },
      { type: 'income', amount: 100000, date: '2024.01.14', description: '적금 납입' },
      { type: 'expense', amount: -50000, date: '2024.01.20', description: '적금 해지 수수료' }
    ]
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
    isPrimary: false,
    transactions: [
      { type: 'expense', amount: -100000, date: '2024.01.08', description: 'ATM출금' },
      { type: 'expense', amount: -75000, date: '2024.01.13', description: '카드결제' },
      { type: 'expense', amount: -120000, date: '2024.01.18', description: '온라인 쇼핑' },
      { type: 'income', amount: 30000, date: '2024.01.22', description: '적립금' }
    ]
  }
])

// 월별 수입/지출 데이터 (실제 거래 데이터에서 계산)
const monthlyIncome = computed(() => {
  return accounts.value.reduce((total, account) => {
    return total + account.transactions
      .filter(transaction => transaction.type === 'income')
      .reduce((sum, transaction) => sum + transaction.amount, 0)
  }, 0)
})

const monthlyExpense = computed(() => {
  return Math.abs(accounts.value.reduce((total, account) => {
    return total + account.transactions
      .filter(transaction => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + transaction.amount, 0)
  }, 0))
})

// 계산된 속성
const totalAssets = computed(() => {
  return accounts.value.reduce((sum, account) => sum + account.balance, 0)
})



const netIncome = computed(() => {
  return monthlyIncome.value - monthlyExpense.value
})

// 그래프 높이 계산 함수
const getIncomeBarHeight = () => {
  const maxValue = Math.max(monthlyIncome.value, monthlyExpense.value)
  if (maxValue === 0) return 0
  const percentage = (monthlyIncome.value / maxValue) * 100
  return Math.max(percentage, 10) // 최소 10% 높이 보장
}

const getExpenseBarHeight = () => {
  const maxValue = Math.max(monthlyIncome.value, monthlyExpense.value)
  if (maxValue === 0) return 0
  const percentage = (monthlyExpense.value / maxValue) * 100
  return Math.max(percentage, 10) // 최소 10% 높이 보장
}

// 메서드
const goBack = () => {
  router.push('/')
}

const toggleAssetVisibility = () => {
  showAssets.value = !showAssets.value
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
  router.push('/')
}

const formatNumber = (num) => {
  return new Intl.NumberFormat('ko-KR').format(num)
}

// 차트 생성 함수
const createChart = () => {
  const ctx = document.getElementById('incomeExpenseChart')
  if (!ctx) return

  // 기존 차트가 있다면 제거
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }

  chartInstance.value = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['수입', '지출'],
      datasets: [{
        label: '금액 (원)',
        data: [monthlyIncome.value, monthlyExpense.value],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)', // 수입 - 녹색
          'rgba(239, 68, 68, 0.8)'  // 지출 - 빨간색
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.label}: ₩${formatNumber(context.parsed.y)}`
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '₩' + formatNumber(value)
            },
            font: {
              size: 12
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        x: {
          ticks: {
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          grid: {
            display: false
          }
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
      }
    }
  })
}

// 컴포넌트 마운트 시 차트 생성
onMounted(() => {
  nextTick(() => {
    createChart()
  })
})

// 수입/지출 데이터 변경 시 차트 업데이트
watch([monthlyIncome, monthlyExpense], () => {
  if (chartInstance.value) {
    chartInstance.value.data.datasets[0].data = [monthlyIncome.value, monthlyExpense.value]
    chartInstance.value.update()
  }
})
</script>

<style scoped>
/* CSS 변수 정의 - KB국민은행 공식 브랜드 컬러 */
.account-overview-page {
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

.account-overview-page {
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
  font-size: 26px;
  font-weight: 600;
  color: var(--kb-gray);
  letter-spacing: -0.3px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
}

.help-btn {
  background: var(--gray-200);
  color: var(--gray-600);
  border: none;
  padding: 14px 20px;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.1px;
}

.help-btn:hover {
  background: var(--gray-300);
}

/* 메인 콘텐츠 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 상단 총 잔액 섹션 */
.total-balance-section {
  background: var(--white);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: var(--shadow);
  border: 1px solid var(--gray-200);
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.balance-info h2 {
  font-size: 22px;
  font-weight: 600;
  color: var(--gray-800);
  margin: 0;
}

.balance-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-label {
  font-size: 16px;
  color: var(--gray-600);
  font-weight: 500;
}

.toggle-switch {
  position: relative;
  width: 60px;
  height: 30px;
  background: var(--gray-300);
  border-radius: 15px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-switch.active {
  background: var(--kb-yellow-positive);
}

.toggle-slider {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 24px;
  height: 24px;
  background: var(--white);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.toggle-switch.active .toggle-slider {
  transform: translateX(30px);
}

.total-balance-amount {
  text-align: center;
  margin-bottom: 16px;
}

.balance-text {
  font-size: 40px;
  font-weight: 700;
  color: var(--gray-800);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
}

.hidden-balance {
  font-size: 40px;
  font-weight: 700;
  color: var(--gray-600);
  letter-spacing: 6px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
}

.balance-note {
  text-align: center;
}

.note-link {
  font-size: 12px;
  color: var(--gray-500);
  text-decoration: none;
}

.note-link:hover {
  text-decoration: underline;
}

/* 계좌 목록 헤더 */
.account-list-header {
  background: var(--white);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);
}

.list-header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.list-header-info h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--gray-800);
  margin: 0;
}


.account-category {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-icon {
  color: var(--kb-yellow-positive);
  font-size: 12px;
}

.category-text {
  font-size: 16px;
  color: var(--gray-600);
  font-weight: 500;
}

.sort-btn {
  background: none;
  border: none;
  font-size: 14px;
  color: var(--gray-500);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

/* 총 자산 요약 */
.total-assets-summary {
  background: var(--white);
  border-radius: 12px;
  padding: 16px;
  color: var(--gray-800);
  box-shadow: var(--shadow);
  border: 1px solid var(--gray-200);
}

.summary-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--gray-200);
}

.summary-header h2 {
  font-size: 16px;
  font-weight: 700;
  color: var(--gray-800);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.3px;
}

.toggle-btn {
  background: var(--gray-200);
  border: none;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background: var(--gray-300);
}

.toggle-icon {
  font-size: 18px;
}

.total-amount {
  text-align: center;
  padding: 20px 0;
}

.amount {
  font-size: 24px;
  font-weight: 700;
  color: var(--kb-yellow-positive);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.3px;
}

.hidden-amount {
  font-size: 24px;
  font-weight: 700;
  color: var(--gray-600);
  letter-spacing: 4px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
}



/* 수입/지출 그래프 */
.income-expense-chart {
  background: var(--white);
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--shadow);
  border: 1px solid var(--gray-200);
  display: flex;
  flex-direction: column;
}

.chart-header {
  margin-bottom: 16px;
  text-align: center;
}

.chart-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 4px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.2px;
}

.chart-period {
  font-size: 12px;
  color: var(--gray-500);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
}

.chart-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chart-wrapper {
  position: relative;
  height: 200px;
  width: 100%;
}



.chart-summary {
  border-top: 1px solid var(--gray-200);
  padding-top: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--gray-600);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.1px;
}

.summary-value {
  font-size: 18px;
  font-weight: 700;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.2px;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.summary-value.positive {
  color: #059669;
  background: rgba(5, 150, 105, 0.1);
  border: 1px solid rgba(5, 150, 105, 0.2);
}

.summary-value.negative {
  color: #DC2626;
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.2);
}

.summary-value.neutral {
  color: #6B7280;
  background: rgba(107, 114, 128, 0.1);
  border: 1px solid rgba(107, 114, 128, 0.2);
}

/* 섹션 헤더 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 12px 16px;
  background: var(--white);
  border-radius: 12px;
  border-left: 4px solid var(--kb-yellow-positive);
  box-shadow: var(--shadow);
}

.section-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--kb-gray);
  letter-spacing: -0.3px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
}

.account-count {
  font-size: 16px;
  font-weight: 500;
  color: var(--gray-600);
  background: var(--primary-light);
  padding: 8px 16px;
  border-radius: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.1px;
}

/* 계좌 목록 */
.accounts-section {
  background: var(--white);
  border-radius: 10px;
  padding: 8px;
  box-shadow: var(--shadow);
  border: 1px solid var(--gray-200);
}

.account-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 12px;
}


.account-card {
  background: var(--white);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid var(--gray-200);
  border-left: 4px solid var(--kb-yellow-positive);
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
}

.account-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}



.card-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-top: 8px;
}

.account-info {
  flex: 1;
}

.account-number {
  font-size: 32px;
  font-weight: 800;
  color: var(--gray-900);
  margin-bottom: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: 1px;
}

.account-type {
  font-size: 32px;
  color: var(--gray-700);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 14px;
  font-weight: 700;
}

.account-name {
  font-size: 22px;
  color: var(--gray-700);
  font-weight: 600;
}

.bank-logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
  border-radius: 5px;
}

.account-balance {
  text-align: right;
}

.balance-label {
  font-size: 14px;
  color: var(--gray-500);
  margin-bottom: 6px;
  font-weight: 500;
}

.balance-amount {
  font-size: 20px;
  font-weight: 700;
  color: var(--gray-800);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
}

.hidden-amount {
  font-size: 20px;
  font-weight: 700;
  color: var(--gray-600);
  letter-spacing: 3px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
}

.card-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.account-card.primary {
  border-color: var(--kb-yellow-positive);
  background: var(--primary-light);
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.bank-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bank-icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.bank-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bank-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-800);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.2px;
}

.account-type {
  font-size: 14px;
  color: var(--gray-600);
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.1px;
}

.account-actions {
  display: flex;
  gap: 8px;
  flex-direction: column;
}

.action-btn {
  background: var(--gray-100);
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.1px;
  flex: 1;
  min-height: 44px;
}

.action-btn:hover {
  background: var(--gray-200);
  border-color: var(--gray-400);
}



.account-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.account-number {
  font-size: 13px;
  color: var(--gray-600);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.account-name {
  font-size: 12px;
  color: var(--gray-500);
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.1px;
}

.balance-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--gray-50);
  border-radius: 8px;
  gap: 8px;
}

.balance-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.balance-label {
  font-size: 12px;
  color: var(--gray-500);
  font-weight: 600;
}

.balance-amount {
  font-size: 20px;
  font-weight: 700;
  color: var(--kb-yellow-positive);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.3px;
}

.balance-change {
  font-size: 12px;
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
  background: var(--white);
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
  background: var(--white);
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
    padding: 12px;
  }
  
  .summary-section {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .asset-breakdown {
    flex-direction: column;
    gap: 12px;
  }
  
  .account-list {
    grid-template-columns: 1fr;
  }
  
  .account-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .account-actions {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    gap: 8px;
  }
  
  .chart-wrapper {
    height: 150px;
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
  

  
  .chart-wrapper {
    height: 120px;
  }
  
  .chart-header h3 {
    font-size: 14px;
  }
  
  .chart-period {
    font-size: 11px;
  }
}
</style>


