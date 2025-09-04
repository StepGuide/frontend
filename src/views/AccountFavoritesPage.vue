<template>
  <div class="account-favorites-page">
    <!-- 상단 네비게이션 -->
    <nav class="navbar">
      <div class="nav-content">
        <div class="logo">
          <button class="back-btn" @click="goBack">
            <span class="back-icon">←</span>
          </button>

          <span class="logo-text">계좌 즐겨찾기</span>
        </div>
        <div class="nav-actions">
          <button class="help-btn" @click="showAddModal = true">
            <span class="help-icon">+</span>
            <span class="help-text">추가</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- 메인 콘텐츠 -->
    <div class="main-content">
      <!-- 즐겨찾기 계좌 목록 -->
      <div class="favorites-section">
        <div class="section-header">
          <h2>즐겨찾기 계좌</h2>
          <span class="count">{{ favoriteAccounts.length }}개</span>
        </div>

        <div v-if="favoriteAccounts.length === 0" class="empty-state">
          <div class="empty-icon">⭐</div>
          <p>즐겨찾기로 등록된 계좌가 없습니다</p>
          <button @click="showAddModal = true" class="add-first-btn">첫 번째 계좌 추가하기</button>
        </div>

        <div v-else class="favorites-list">
          <div 
            v-for="account in favoriteAccounts" 
            :key="account.id"
            class="favorite-card"
          >
            <div class="account-info">
              <div class="account-name">{{ account.name }}</div>
              <div class="account-number">{{ account.accountNumber }}</div>
              <div class="account-balance">{{ formatCurrency(account.balance) }}</div>
            </div>
            <div class="account-actions">
              <button @click="quickTransfer(account)" class="action-btn transfer">이체</button>
              <button @click="viewDetails(account)" class="action-btn details">조회</button>
              <button @click="removeFavorite(account.id)" class="action-btn remove">삭제</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 내 계좌 목록 -->
      <div class="my-accounts-section">
        <div class="section-header">
          <h2>내 계좌</h2>
          <span class="count">{{ myAccounts.length }}개</span>
        </div>

        <div class="accounts-list">
          <div 
            v-for="account in myAccounts" 
            :key="account.id"
            class="account-card"
          >
            <div class="account-info">
              <div class="account-name">{{ account.name }}</div>
              <div class="account-number">{{ account.accountNumber }}</div>
              <div class="account-balance">{{ formatCurrency(account.balance) }}</div>
            </div>
            <div class="account-actions">
              <button 
                v-if="!isFavorite(account.id)"
                @click="addToFavorites(account)"
                class="favorite-btn"
              >
                ⭐ 즐겨찾기 추가
              </button>
              <button 
                v-else
                @click="removeFavorite(account.id)"
                class="favorite-btn added"
              >
                ⭐ 즐겨찾기 해제
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 계좌 추가 모달 -->
    <div v-if="showAddModal" class="modal-overlay" @click="showAddModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <div class="modal-title-section">
            <h3>계좌 즐겨찾기 추가</h3>
            <p>새로운 계좌를 즐겨찾기에 추가하세요</p>
          </div>
          <button @click="showAddModal = false" class="close-btn">
            <span class="close-icon">×</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-container">
            <div class="form-group">
              <label class="form-label">계좌명</label>
              <div class="input-wrapper">
                <input 
                  v-model="newAccount.name" 
                  type="text" 
                  placeholder="예: KB국민주거래통장"
                  class="form-input"
                >
                <div class="input-focus-border"></div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">계좌번호</label>
              <div class="input-wrapper">
                <input 
                  v-model="newAccount.accountNumber" 
                  type="text" 
                  placeholder="예: 123-456-789012"
                  class="form-input"
                >
                <div class="input-focus-border"></div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">잔액</label>
              <div class="input-wrapper">
                <input 
                  v-model="newAccount.balance" 
                  type="number" 
                  placeholder="예: 1000000"
                  class="form-input"
                >
                <div class="input-focus-border"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showAddModal = false" class="cancel-btn">취소</button>
          <button @click="addNewAccount" class="confirm-btn">추가하기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 반응형 데이터
const favoriteAccounts = ref([])
const myAccounts = ref([])
const showAddModal = ref(false)
const newAccount = ref({
  name: '',
  accountNumber: '',
  balance: 0
})

// 샘플 데이터
const sampleAccounts = [
  { id: 1, name: 'KB국민주거래통장', accountNumber: '123-456-789012', balance: 2500000 },
  { id: 2, name: 'KB국민적금통장', accountNumber: '234-567-890123', balance: 1500000 },
  { id: 3, name: 'KB국민자유적금', accountNumber: '345-678-901234', balance: 800000 },
  { id: 4, name: 'KB국민정기예금', accountNumber: '456-789-012345', balance: 5000000 },
  { id: 5, name: 'KB국민입출금통장', accountNumber: '567-890-123456', balance: 1200000 }
]

// 컴포넌트 마운트 시 데이터 초기화
onMounted(() => {
  myAccounts.value = [...sampleAccounts]
  // 로컬 스토리지에서 즐겨찾기 계좌 불러오기
  const savedFavorites = localStorage.getItem('favoriteAccounts')
  if (savedFavorites) {
    favoriteAccounts.value = JSON.parse(savedFavorites)
  }
})

// 메서드들
const goBack = () => {
  router.push('/')
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(amount)
}

const isFavorite = (accountId) => {
  return favoriteAccounts.value.some(account => account.id === accountId)
}

const addToFavorites = (account) => {
  if (!isFavorite(account.id)) {
    favoriteAccounts.value.push({ ...account })
    saveFavorites()
  }
}

const removeFavorite = (accountId) => {
  favoriteAccounts.value = favoriteAccounts.value.filter(account => account.id !== accountId)
  saveFavorites()
}

const addNewAccount = () => {
  if (newAccount.value.name && newAccount.value.accountNumber) {
    const account = {
      id: Date.now(),
      name: newAccount.value.name,
      accountNumber: newAccount.value.accountNumber,
      balance: parseInt(newAccount.value.balance) || 0
    }
    myAccounts.value.push(account)
    newAccount.value = { name: '', accountNumber: '', balance: 0 }
    showAddModal.value = false
  }
}

const quickTransfer = (account) => {
  router.push(`/transfer?from=${account.id}`)
}

const viewDetails = (account) => {
  router.push(`/inquiry?account=${account.id}`)
}

const saveFavorites = () => {
  localStorage.setItem('favoriteAccounts', JSON.stringify(favoriteAccounts.value))
}
</script>

<style scoped>
/* CSS 변수 정의 - MainPage와 동일한 KB 브랜드 색상 */
.account-favorites-page {
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

.account-favorites-page {
  min-height: 100vh;
  background: var(--gray-50);
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--gray-800);
  line-height: 1.6;
}

/* 네비게이션 - MainPage 스타일 */
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

.nav-actions {
  display: flex;
  gap: 12px;
  align-items: center;
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

.help-icon {
  font-size: 18px;
  color: var(--gray-600);
}

.help-text {
  font-size: 16px;
  font-weight: 500;
  color: var(--gray-600);
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

/* 섹션 헤더 - MainPage 스타일 */
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

.count {
  background: var(--primary-light);
  color: var(--kb-yellow-positive);
  padding: 8px 16px;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.1px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
}

/* 즐겨찾기 섹션 */
.favorites-section,
.my-accounts-section {
  margin-bottom: 16px;
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 20px;
  color: var(--gray-600);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-state p {
  font-size: 16px;
  margin-bottom: 16px;
  color: var(--gray-600);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
}

.add-first-btn {
  background: var(--kb-yellow-positive);
  color: var(--white);
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: -0.2px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  box-shadow: var(--shadow);
}

.add-first-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* 계좌 목록 */
.favorites-list,
.accounts-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.favorite-card,
.account-card {
  background: var(--white);
  border-radius: var(--radius-2xl);
  padding: 16px;
  box-shadow: var(--shadow-lg);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.favorite-card:hover,
.account-card:hover {
  box-shadow: var(--shadow-xl);
  transform: translateY(-4px);
}

.account-info {
  margin-bottom: 12px;
}

.account-name {
  font-size: 22px;
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 6px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.2px;
}

.account-number {
  font-size: 18px;
  color: var(--gray-600);
  margin-bottom: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.1px;
  font-weight: 500;
}

.account-balance {
  font-size: 24px;
  font-weight: 700;
  color: var(--gray-800);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.3px;
}

.account-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: -0.1px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.transfer {
  background: var(--kb-yellow-positive);
  color: var(--white);
}

.action-btn.details {
  background: #605850;
  color: var(--white);
}

.action-btn.remove {
  background: var(--danger);
  color: var(--white);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.action-btn.transfer:hover {
  background: var(--primary-dark);
}

.action-btn.details:hover {
  background: #4a433c;
}

.action-btn.remove:hover {
  background: #c82333;
}

.favorite-btn {
  background: var(--kb-yellow-positive);
  color: var(--white);
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: -0.1px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.favorite-btn.added {
  background: var(--gray-400);
  color: var(--white);
}

.favorite-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.favorite-btn.added:hover {
  background: #218838;
}


/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background: var(--white);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--gray-200);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: var(--kb-yellow-positive);
}

.empty-state p {
  margin: 0 0 16px 0;
  color: var(--gray-600);
  font-size: 16px;
  font-weight: 600;
}

.add-first-btn {
  background: var(--kb-yellow-positive);
  color: var(--white);
  border: none;
  padding: 12px 20px;
  border-radius: var(--radius-xl);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow);
}

.add-first-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}


/* 현대적인 모달 디자인 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  background: var(--white);
  border-radius: 24px;
  width: 90%;
  max-width: 480px;
  color: var(--gray-800);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--kb-yellow-positive) 0%, var(--primary-dark) 100%);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px 24px 0 24px;
  background: var(--white);
}

.modal-title-section {
  flex: 1;
}

.modal-title-section h3 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--gray-800);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.modal-title-section p {
  margin: 0;
  font-size: 14px;
  color: var(--gray-600);
  font-weight: 500;
  line-height: 1.4;
}

.close-btn {
  background: var(--gray-100);
  border: none;
  cursor: pointer;
  color: var(--gray-600);
  padding: 12px;
  border-radius: 12px;
  transition: all 0.2s ease;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.close-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--gray-200);
  opacity: 0;
  transition: opacity 0.2s ease;
  border-radius: 12px;
}

.close-btn:hover::before {
  opacity: 1;
}

.close-icon {
  font-size: 18px;
  font-weight: 600;
  position: relative;
  z-index: 1;
}

.modal-body {
  padding: 24px;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: var(--gray-700);
  font-size: 16px;
  margin: 0;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid var(--gray-200);
  border-radius: 12px;
  font-size: 16px;
  box-sizing: border-box;
  transition: all 0.3s ease;
  background: var(--white);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
}

.form-input:focus {
  outline: none;
  border-color: var(--kb-yellow-positive);
  box-shadow: 0 0 0 4px rgba(255, 188, 0, 0.1);
  transform: translateY(-1px);
}

.form-input::placeholder {
  color: var(--gray-400);
  font-weight: 400;
}

.input-focus-border {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--kb-yellow-positive) 0%, var(--primary-dark) 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
  border-radius: 1px;
}

.form-input:focus + .input-focus-border {
  transform: scaleX(1);
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 0 24px 24px 24px;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: -0.2px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.cancel-btn {
  background: var(--gray-100);
  color: var(--gray-700);
  border: 2px solid var(--gray-200);
}

.cancel-btn:hover {
  background: var(--gray-200);
  border-color: var(--gray-300);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.confirm-btn {
  background: linear-gradient(135deg, var(--kb-yellow-positive) 0%, var(--primary-dark) 100%);
  color: var(--white);
  box-shadow: 0 4px 12px rgba(255, 188, 0, 0.3);
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 188, 0, 0.4);
}

.confirm-btn:active {
  transform: translateY(0);
}


/* 반응형 디자인 */
@media (max-width: 768px) {
  .main-content {
    padding: 12px;
  }
  
  .page-header {
    padding: 12px 16px;
  }
  
  .favorites-section,
  .my-accounts-section {
    margin-bottom: 16px;
  }
  
  .section-header {
    padding: 8px 12px;
  }
  
  .section-header h2 {
    font-size: 20px;
  }
  
  .account-actions {
    flex-direction: column;
  }
  
  .action-btn,
  .favorite-btn {
    width: 100%;
  }
  
  .account-balance {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 8px;
  }
  
  .page-header {
    padding: 8px 12px;
  }
  
  .modal {
    width: 95%;
    max-width: 400px;
    border-radius: 20px;
  }
  
  .modal-header {
    padding: 20px 20px 0 20px;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .modal-footer {
    padding: 0 20px 20px 20px;
  }
  
  .modal-title-section h3 {
    font-size: 20px;
  }
  
  .form-container {
    gap: 16px;
  }
  
  .form-input {
    padding: 14px 16px;
    font-size: 16px;
  }
  
  .cancel-btn,
  .confirm-btn {
    padding: 14px 20px;
    font-size: 15px;
    min-height: 48px;
  }
}
</style>
