<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTransferStore } from '@/stores/accountTransferStore'

const router = useRouter()
const store = useTransferStore()

const currentStep = computed(() => store.currentStep)

const accounts = computed(() => store.accounts)

const selectedAccount = computed({
  get: () => store.selectedAccount,
  set: val => store.selectedAccount = val
})

const transferDTO = computed({
  get: () => store.transferDTO,
  set: val => store.transferDTO = val
})

const isStep2Valid = computed(() => {
  return transferDTO.value.sendBankCode &&
         transferDTO.value.payeeAccountNumber &&
         transferDTO.value.transactionAmount > 0
})

const selectAccount = (account) => {
  selectedAccount.value = account
  transferDTO.value.accountId = account.accountId
  transferDTO.value.accountNumber = account.accountNumber
  transferDTO.value.accountName = account.accountName
  transferDTO.value.balance = account.balance
  transferDTO.value.bankCode = account.bankCode
}

const nextStep = async () => {
  if (currentStep.value === 2) {
    try {
      await store.validate()
      alert('검증 성공!')
    } catch (err) {
      alert('검증 실패: ' + err.message)
      return
    }
  }
  store.nextStep()
}

const prevStep = () => store.prevStep()

const confirmTransfer = async () => {
  try {
    const res = await store.execute()
    alert(res || '이체 완료!')
    router.push('/')
  } catch (err) {
    alert('이체 실패: ' + err.message)
  }
}

const goBack = () => router.push('/')
const requestHelp = () => router.push('/')

const formatNumber = (num) => new Intl.NumberFormat('ko-KR').format(num)

// 은행리스트 (은행코드-은행이름 매칭)
const bankList = [
  { code: "004", name: "KB국민은행" },
  { code: "023", name: "SC제일은행" },
  { code: "039", name: "경남은행" },
  { code: "034", name: "광주은행" },
  { code: "003", name: "기업은행" },
  { code: "011", name: "농협" },
  { code: "031", name: "대구은행" },
  { code: "032", name: "부산은행" },
  { code: "002", name: "산업은행" },
  { code: "007", name: "수협" },
  { code: "088", name: "신한은행" },
  { code: "048", name: "신협" },
  { code: "005", name: "외환은행" },
  { code: "020", name: "우리은행" },
  { code: "071", name: "우체국" },
  { code: "037", name: "전북은행" },
  { code: "035", name: "제주은행" },
  { code: "012", name: "축협" },
  { code: "081", name: "하나은행(서울은행)" },
  { code: "027", name: "한국씨티은행(한미은행)" },
  { code: "089", name: "K뱅크" },
  { code: "090", name: "카카오뱅크" },
  { code: "209", name: "유안타증권" },
  { code: "218", name: "현대증권" },
  { code: "230", name: "미래에셋증권" },
  { code: "238", name: "대우증권" },
  { code: "240", name: "삼성증권" },
  { code: "243", name: "한국투자증권" },
  { code: "247", name: "우리투자증권" },
  { code: "261", name: "교보증권" },
  { code: "262", name: "하이투자증권" },
  { code: "263", name: "에이치엠씨투자증권" },
  { code: "264", name: "키움증권" },
  { code: "265", name: "이트레이드증권" },
  { code: "266", name: "에스케이증권" },
  { code: "267", name: "대신증권" },
  { code: "268", name: "솔로몬투자증권" },
  { code: "269", name: "한화증권" },
  { code: "270", name: "하나대투증권" },
  { code: "278", name: "굿모닝신한증권" },
  { code: "279", name: "동부증권" },
  { code: "280", name: "유진투자증권" },
  { code: "287", name: "메리츠증권" },
  { code: "289", name: "엔에이치투자증권" },
  { code: "290", name: "부국증권" }
]

// 은행코드로 은행이름 가져오기
const getBankName = (code) => {
  const bank = bankList.find(b => b.code === code)
  return bank ? bank.name : code
}


onMounted(() => {
  const userId = 1 // 로그인 유저 ID
  store.fetchAccounts(userId)
})
</script>

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
          <div v-for="acc in accounts" :key="acc.accountId" class="account-item"
             :class="{ selected: selectedAccount?.accountId === acc.accountId }"
             @click="selectAccount(acc)">
          <div>{{ acc.bankName }} {{ acc.accountNumber }} ({{ acc.accountName }})</div>
          <div>잔액: {{ formatNumber(acc.balance) }} 원</div>
        </div>
        </div>

        <div class="action-buttons">
          <button class="btn-secondary" @click="goBack">취소</button>
          <button class="btn-primary" :disabled="!selectedAccount" @click="nextStep">다음</button>
        </div>
      </div><!-- end 1단계 -->

      <!-- 2단계: 이체 정보 입력 -->
      <div v-if="currentStep === 2" class="step-content">
        <div class="section-header">
          <h2>이체 정보 입력</h2>
          <p>받는 분의 계좌 정보를 입력해주세요</p>
        </div>

        <div class="form-section">
          <div class="form-group">
            <label>받는 은행</label>
            <select v-model="transferDTO.sendBankCode">
            <option value="">은행 선택</option>
            <option v-for="bank in bankList" 
                    :key="bank.code" 
                    :value="bank.code">
                {{ bank.name }}
            </option>
            </select>
          </div>

          <div class="form-group">
            <label>받는 분 계좌번호</label>
            <input type="text" v-model="transferDTO.payeeAccountNumber" placeholder="계좌번호"/>
          </div>

          <!-- <div class="form-group">
            <label>예금주 이름</label>
            <input type="text" v-model="transferDTO.accountHolderName" placeholder="예금주 이름"/>
          </div>  -->

          <div class="form-group">
            <label>금액</label>
            <div class="amount-input-group">
              <input type="number" v-model.number="transferDTO.transactionAmount" placeholder="0"/>
              <span class="currency">원</span>
            </div>
            <div class="amount-display">
              {{ formatNumber(transferDTO.transactionAmount || 0) }} 원
            </div>
          </div>

          <div class="form-group">
            <label>이체 메모 (선택사항)</label>
            <input type="text" v-model="transferDTO.memo" placeholder="메모" class="form-input"/>
          </div>
        </div>

        <div class="action-buttons">
          <button class="btn-secondary" @click="prevStep">이전</button>
          <button class="btn-primary" :disabled="!isStep2Valid" @click="nextStep">다음</button>
        </div>
      </div><!-- end 2단계 -->

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
              <div class="bank-name">{{ getBankName(selectedAccount.bankCode) }}</div>
              <div class="account-number">{{ selectedAccount.accountNumber }}</div>
              <div class="balance">잔액: ₩ {{ formatNumber(selectedAccount.balance) }}</div>
            </div>
          </div>

          <div class="confirmation-section">
            <h3>받는 계좌</h3>
            <div class="transfer-detail">
              <div class="detail-row">
                <span class="label">은행:</span>
                <span class="value">{{ getBankName(transferDTO.sendBankCode) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">계좌번호:</span>
                <span class="value">{{ transferDTO.payeeAccountNumber }}</span>
              </div>
              <div class="detail-row">
                <span class="label">받는 분:</span>
                <span class="value">{{ transferDTO.accountHolderName }}</span>
              </div>
              <div class="detail-row">
                <span class="label">이체 금액:</span>
                <span class="value amount">{{ formatNumber(transferDTO.transactionAmount) }} 원</span>
              </div>
              <div v-if="transferDTO.memo" class="detail-row">
                <span class="label">메모:</span>
                <span class="value">{{ transferDTO.memo }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button class="btn-secondary" @click="prevStep">이전</button>
          <button class="btn-primary" @click="confirmTransfer">이체하기</button>
        </div>
      </div><!-- end 3단계-->

    </div>
  </div>
</template>

<style scoped>
/* CSS 변수 정의 - KB국민은행 공식 브랜드 컬러 */
.transfer-page {
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

.transfer-page {
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
}

.section-header p {
  font-size: 14px;
  color: var(--gray-600);
  font-weight: 500;
  line-height: 1.4;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.2px;
}

.account-number {
  font-size: 13px;
  color: var(--gray-600);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  margin-bottom: 2px;
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

.balance {
  text-align: right;
  margin-right: 12px;
}

.balance-amount {
  font-size: 18px;
  font-weight: 700;
  color: var(--kb-yellow-positive);
  margin-bottom: 2px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.3px;
}

.balance-label {
  font-size: 11px;
  color: var(--gray-500);
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
}

.check-icon {
  color: var(--success);
  font-size: 14px;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.1px;
}

.form-input select {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.1px;
}

.detail-row .value {
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-800);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
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
  
  .btn-primary, .btn-secondary {
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
