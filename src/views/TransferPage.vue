<template>
  <div class="transfer-page">
    <!-- 상단 네비게이션 -->
    <nav class="navbar">
      <div class="nav-content">
        <div class="logo">
          <button class="back-btn" @click="goBack">
            <span class="back-icon">←</span>
          </button>
          <span class="logo-icon">🏦</span>
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
        <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
          <span class="step-number">1</span>
          <span class="step-text">계좌 선택</span>
        </div>
        <div class="step-line" :class="{ active: currentStep > 1 }"></div>
        <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
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
              <div class="balance-amount">₩ {{ formatNumber(account.balance) }}</div>
              <div class="balance-label">잔액</div>
            </div>
            <div class="select-indicator">
              <span v-if="selectedAccount?.id === account.id" class="check-icon">✓</span>
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
              <div class="account-number">{{ selectedAccount.accountNumber }}</div>
              <div class="balance">잔액: ₩ {{ formatNumber(selectedAccount.balance) }}</div>
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
                <span class="value amount">₩ {{ formatNumber(transferInfo.amount) }}</span>
              </div>
              <div v-if="transferInfo.memo" class="detail-row">
                <span class="label">메모:</span>
                <span class="value">{{ transferInfo.memo }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button class="btn-secondary" @click="prevStep">이전</button>
          <button class="btn-primary" @click="confirmTransfer">이체하기</button>
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
const currentStep = ref(1)
const selectedAccount = ref(null)
const transferInfo = ref({
  bank: '',
  accountNumber: '',
  recipientName: '',
  amount: '',
  memo: ''
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

// 계산된 속성
const isTransferInfoValid = computed(() => {
  return transferInfo.value.bank && 
         transferInfo.value.accountNumber && 
         transferInfo.value.recipientName && 
         transferInfo.value.amount && 
         transferInfo.value.amount > 0
})

// 메서드
const goBack = () => {
  router.push('/')
}

const selectAccount = (account) => {
  selectedAccount.value = account
}

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const formatNumber = (num) => {
  return new Intl.NumberFormat('ko-KR').format(num)
}

const formatAmount = (event) => {
  const value = event.target.value
  transferInfo.value.amount = value
}

const getBankName = (bankCode) => {
  const banks = {
    'KB': 'KB국민은행',
    'SHINHAN': '신한은행',
    'WOORI': '우리은행',
    'HANA': '하나은행',
    'NH': '농협은행'
  }
  return banks[bankCode] || bankCode
}

const confirmTransfer = () => {
  // 실제 이체 로직 구현
  alert('이체가 완료되었습니다!')
  router.push('/')
}

const requestHelp = () => {
  router.push('/user')
}
</script>

<style scoped>
/* CSS 변수 정의 */
.transfer-page {
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

.transfer-page {
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
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

/* 단계 표시기 */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  padding: 20px;
  background: var(--kb-gray-light);
  border-radius: 16px;
  box-shadow: 0 4px 16px var(--kb-shadow);
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
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
  font-size: 14px;
  font-weight: 600;
  color: var(--kb-text-secondary);
}

.step.active .step-text {
  color: var(--kb-orange);
}

.step-line {
  width: 60px;
  height: 2px;
  background: var(--kb-border);
  margin: 0 20px;
  transition: all 0.3s ease;
}

.step-line.active {
  background: var(--kb-orange);
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
  margin-bottom: 32px;
}

.section-header h2 {
  font-size: 28px;
  font-weight: 800;
  color: var(--kb-text-primary);
  margin-bottom: 8px;
}

.section-header p {
  font-size: 16px;
  color: var(--kb-text-secondary);
  font-weight: 600;
}

/* 계좌 목록 */
.account-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.account-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border: 2px solid var(--kb-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--kb-gray-light);
}

.account-item:hover {
  border-color: var(--kb-orange);
  box-shadow: 0 4px 12px var(--kb-shadow-hover);
}

.account-item.selected {
  border-color: var(--kb-orange);
  background: var(--kb-orange-light);
}

.account-info {
  flex: 1;
}

.bank-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--kb-text-primary);
  margin-bottom: 4px;
}

.account-number {
  font-size: 16px;
  color: var(--kb-text-secondary);
  font-family: 'Courier New', monospace;
  margin-bottom: 4px;
}

.account-name {
  font-size: 14px;
  color: var(--kb-text-light);
  font-weight: 600;
}

.balance {
  text-align: right;
  margin-right: 16px;
}

.balance-amount {
  font-size: 20px;
  font-weight: 800;
  color: var(--kb-orange);
  margin-bottom: 4px;
}

.balance-label {
  font-size: 12px;
  color: var(--kb-text-light);
  font-weight: 600;
}

.select-indicator {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon {
  color: var(--success-color);
  font-size: 20px;
  font-weight: bold;
}

/* 폼 스타일 */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 16px;
  font-weight: 700;
  color: var(--kb-text-primary);
}

.form-input {
  padding: 16px;
  border: 2px solid var(--kb-border);
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.2s ease;
  background: var(--kb-gray-light);
}

.form-input:focus {
  outline: none;
  border-color: var(--kb-orange);
  box-shadow: 0 0 0 3px rgba(255, 140, 0, 0.1);
}

.amount-input-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.amount-input {
  flex: 1;
}

.currency {
  font-size: 18px;
  font-weight: 700;
  color: var(--kb-text-primary);
}

.amount-display {
  font-size: 24px;
  font-weight: 800;
  color: var(--kb-orange);
  text-align: center;
  padding: 16px;
  background: var(--kb-orange-light);
  border-radius: 12px;
  margin-top: 8px;
}

/* 확인 카드 */
.confirmation-card {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
}

.confirmation-section {
  padding: 24px;
  background: var(--kb-gray);
  border-radius: 12px;
  border-left: 4px solid var(--kb-orange);
}

.confirmation-section h3 {
  font-size: 20px;
  font-weight: 700;
  color: var(--kb-text-primary);
  margin-bottom: 16px;
}

.account-detail {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.transfer-detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-row .label {
  font-size: 16px;
  font-weight: 600;
  color: var(--kb-text-secondary);
}

.detail-row .value {
  font-size: 16px;
  font-weight: 700;
  color: var(--kb-text-primary);
}

.detail-row .value.amount {
  color: var(--kb-orange);
  font-size: 20px;
}

/* 버튼 */
.action-buttons {
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

.btn-primary:hover:not(:disabled) {
  background: var(--kb-orange-dark);
}

.btn-primary:disabled {
  background: var(--kb-border);
  color: var(--kb-text-light);
  cursor: not-allowed;
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
  
  .step-content {
    padding: 24px;
  }
  
  .step-indicator {
    padding: 16px;
  }
  
  .step-line {
    width: 40px;
    margin: 0 10px;
  }
  
  .account-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .balance {
    text-align: left;
    margin-right: 0;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn-primary, .btn-secondary {
    width: 100%;
  }
}
</style>
