<template>
  <div class="account-favorites-page">
    <!-- 헤더 -->
    <header class="page-header">
      <button @click="goBack" class="back-btn">←</button>
      <h1>계좌 즐겨찾기</h1>
      <button @click="showAddModal = true" class="add-btn">+</button>
    </header>

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
          <h3>계좌 즐겨찾기 추가</h3>
          <button @click="showAddModal = false" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>계좌명</label>
            <input v-model="newAccount.name" type="text" placeholder="계좌명을 입력하세요">
          </div>
          <div class="form-group">
            <label>계좌번호</label>
            <input v-model="newAccount.accountNumber" type="text" placeholder="계좌번호를 입력하세요">
          </div>
          <div class="form-group">
            <label>잔액</label>
            <input v-model="newAccount.balance" type="number" placeholder="잔액을 입력하세요">
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showAddModal = false" class="cancel-btn">취소</button>
          <button @click="addNewAccount" class="confirm-btn">추가</button>
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
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.account-favorites-page {
  min-height: 100vh;
  background: var(--kb-gray);
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--kb-text-primary);
}

/* 헤더 - MainPage 네비게이션 스타일 적용 */
.page-header {
  background: var(--kb-gray-light);
  border-bottom: 3px solid var(--kb-orange);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
}

.back-btn {
  background: var(--kb-orange);
  border: none;
  color: var(--kb-gray-light);
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn:hover {
  background: var(--kb-orange-dark);
}

.page-header h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--kb-orange);
}

.add-btn {
  background: var(--kb-orange);
  border: none;
  color: var(--kb-gray-light);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-btn:hover {
  background: var(--kb-orange-dark);
}

/* 메인 콘텐츠 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

.favorites-section,
.my-accounts-section {
  margin-bottom: 24px;
}

/* 섹션 헤더 - MainPage 스타일 적용 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: var(--kb-gray-light);
  border-radius: 12px;
  border-left: 4px solid var(--kb-orange);
  box-shadow: 0 2px 8px var(--kb-shadow);
}

.section-header h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  color: var(--kb-text-primary);
}

.count {
  background: var(--kb-orange);
  color: var(--kb-gray-light);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background: var(--kb-gray-light);
  border-radius: 16px;
  box-shadow: 0 4px 16px var(--kb-shadow);
  border: 1px solid var(--kb-border);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: var(--kb-orange);
}

.empty-state p {
  margin: 0 0 16px 0;
  color: var(--kb-text-secondary);
  font-size: 16px;
  font-weight: 600;
}

.add-first-btn {
  background: var(--kb-orange);
  color: var(--kb-gray-light);
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-first-btn:hover {
  background: var(--kb-orange-dark);
}

/* 계좌 목록 */
.favorites-list,
.accounts-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.favorite-card,
.account-card {
  background: var(--kb-gray-light);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px var(--kb-shadow);
  border: 1px solid var(--kb-border);
  transition: all 0.2s ease;
}

.favorite-card:hover,
.account-card:hover {
  box-shadow: 0 6px 20px var(--kb-shadow-hover);
}

.favorite-card {
  border-left: 4px solid var(--kb-orange);
}

.account-card {
  border-left: 4px solid var(--kb-blue);
}

.account-info {
  margin-bottom: 16px;
}

.account-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--kb-text-primary);
  margin-bottom: 8px;
}

.account-number {
  font-size: 16px;
  color: var(--kb-text-secondary);
  font-family: 'Courier New', monospace;
  font-weight: 600;
  margin-bottom: 8px;
}

.account-balance {
  font-size: 24px;
  font-weight: 800;
  color: var(--kb-orange);
}

.account-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  background: var(--kb-orange);
  color: var(--kb-gray-light);
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.transfer {
  background: var(--kb-blue);
}

.action-btn.details {
  background: var(--kb-orange);
}

.action-btn.remove {
  background: #DC3545;
}

.action-btn:hover {
  background: var(--kb-orange-dark);
}

.action-btn.transfer:hover {
  background: var(--kb-blue-dark);
}

.action-btn.remove:hover {
  background: #c82333;
}

.favorite-btn {
  background: var(--kb-yellow);
  border: none;
  color: var(--kb-text-primary);
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.favorite-btn.added {
  background: #28a745;
  color: var(--kb-gray-light);
}

.favorite-btn:hover {
  background: var(--kb-orange);
  color: var(--kb-gray-light);
}

.favorite-btn.added:hover {
  background: #218838;
}

/* 모달 */
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
}

.modal {
  background: var(--kb-gray-light);
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  color: var(--kb-text-primary);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--kb-border);
  background: var(--kb-orange);
  color: var(--kb-gray-light);
  border-radius: 16px 16px 0 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--kb-gray-light);
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--kb-text-primary);
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--kb-border);
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--kb-orange);
  box-shadow: 0 0 0 2px rgba(255, 140, 0, 0.2);
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid var(--kb-border);
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: var(--kb-gray);
  color: var(--kb-text-secondary);
  border: 1px solid var(--kb-border);
}

.confirm-btn {
  background: var(--kb-orange);
  color: var(--kb-gray-light);
}

.cancel-btn:hover {
  background: var(--kb-border);
}

.confirm-btn:hover {
  background: var(--kb-orange-dark);
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
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }
}
</style>
