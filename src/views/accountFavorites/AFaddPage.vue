<template>
  <div class="af-add-page">
    <!-- 상단 네비게이션 -->
    <nav class="navbar">
      <div class="nav-content">
        <div class="logo">
          <button class="back-btn" @click="goBack">
            <span class="back-icon">←</span>
          </button>
          <span class="logo-text">계좌 즐겨찾기 추가</span>
        </div>
        <div class="nav-actions">
          <!-- 빈 공간 -->
        </div>
      </div>
    </nav>

    <div class="main-content">
      <!-- 은행 선택 -->
      <div class="form-section">
        <div class="section-header">
          <h2>은행 선택</h2>
          <p class="section-description">계좌를 등록할 은행을 선택해주세요</p>
        </div>
        <div class="bank-grid">
          <button
            v-for="bank in bankStore.banks"
            :key="bank.code"
            class="bank-card"
            :class="{
              selected: selectedBankCode === bank.code,
              connected: bank.connected,
            }"
            @click="selectBank(bank)"
          >
            <div class="bank-logo-container">
            <img :src="bank.logo" :alt="bank.name" class="bank-logo" />
              <div v-if="selectedBankCode === bank.code" class="selected-indicator">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            <span class="bank-name">{{ bank.name }}</span>
          </button>
        </div>
      </div>

      <!-- 계좌 정보 입력 -->
      <div class="form-section">
        <div class="section-header">
          <h2>계좌 정보</h2>
          <p class="section-description">계좌 정보를 입력해주세요</p>
        </div>
        
        <div class="input-group">
          <label class="input-label">계좌명</label>
          <div class="input-container">
        <input
          v-model="favoriteAccount.name"
          type="text"
              class="form-input"
          placeholder="계좌명을 입력하세요"
        />
            <div class="input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
      </div>

        <div class="input-group">
          <label class="input-label">계좌번호</label>
          <div class="input-container">
        <input
          v-model="favoriteAccount.accountNumber"
          type="text"
              class="form-input"
          placeholder="계좌번호를 입력하세요"
        />
            <div class="input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 버튼 그룹 -->
      <div class="button-group">
        <button @click="goBack" class="cancel-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          취소
        </button>
        <button 
          @click="addFavoriteAccount" 
          class="confirm-btn"
          :disabled="!isFormValid"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          추가
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useBankStore } from '@/stores/bank';
import { addFavorite } from '@/api/favoritesApi';

const router = useRouter();
const bankStore = useBankStore();

const favoriteAccount = ref({
  name: '',
  accountNumber: '',
  bankCode: '',
});

const selectedBankCode = ref('');
const isSubmitting = ref(false);

// 폼 유효성 검사
const isFormValid = computed(() => {
  return favoriteAccount.value.name.trim() && 
         favoriteAccount.value.accountNumber.trim() && 
         selectedBankCode.value;
});

// 은행 선택
const selectBank = (bank) => {
  selectedBankCode.value = bank.code;
  favoriteAccount.value.bankCode = bank.code;
};

// 뒤로가기
const goBack = () => {
  router.back();
};

// 즐겨찾기 추가
const addFavoriteAccount = async () => {
  if (!isFormValid.value) {
    alert('모든 필드를 입력해주세요.');
    return;
  }

  try {
    isSubmitting.value = true;
    
    await addFavorite({
      sendBankNickname: favoriteAccount.value.name.trim(),
      sendAccountNumber: favoriteAccount.value.accountNumber.trim(),
      sendBankCode: favoriteAccount.value.bankCode,
    });
    
    alert('즐겨찾기 계좌가 추가되었습니다!');
    router.push('/account-favorites');
  } catch (error) {
    console.error('즐겨찾기 추가 실패:', error);
    alert('계좌 추가에 실패했습니다. 다시 시도해주세요.');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.af-add-page {
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

  /* Base Colors */
  --white: #ffffff;
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

  min-height: 100vh;
  background: var(--gray-50);
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--gray-800);
  line-height: 1.6;
}

/* 네비게이션 - TransferPage 스타일 */
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
  transition: all 0.3s ease;
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
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 16px;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: var(--primary);
}

.back-btn:hover::before {
  opacity: 0.1;
}

.back-icon {
  font-size: 18px;
  color: var(--accent);
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.back-btn:hover .back-icon {
  color: var(--primary);
  transform: translateX(-2px);
}

.logo-text {
  font-size: 22px;
  font-weight: 600;
  color: var(--accent);
  letter-spacing: -0.3px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
}

/* 메인 콘텐츠 */
.main-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

/* 폼 섹션 */
.form-section {
  background: var(--white);
  border-radius: var(--radius-xl);
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--gray-200);
}

.section-header {
  margin-bottom: 32px;
  text-align: center;
}

.section-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--accent);
  margin: 0 0 8px;
}

.section-description {
  font-size: 16px;
  color: var(--gray-600);
  margin: 0;
  line-height: 1.5;
}

/* 은행 그리드 */
.bank-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.bank-card {
  position: relative;
  padding: 20px 16px;
  border-radius: var(--radius-lg);
  border: 2px solid var(--gray-200);
  background: var(--white);
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.bank-card:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow);
  transform: translateY(-2px);
}

.bank-card.selected {
  border-color: var(--primary);
  background: var(--primary-light);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.bank-logo-container {
  position: relative;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bank-logo {
  width: 64px;
  height: 64px;
  object-fit: contain;
  border-radius: var(--radius-md);
  background: var(--gray-50);
  padding: 8px;
  border: 1px solid var(--gray-200);
}

.selected-indicator {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 24px;
  height: 24px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  box-shadow: var(--shadow);
}

.bank-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--accent);
  line-height: 1.2;
}

/* 입력 그룹 */
.input-group {
  margin-bottom: 24px;
}

.input-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 8px;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  padding: 16px 20px 16px 50px;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: 500;
  color: var(--accent);
  background: var(--white);
  transition: all 0.2s ease;
  outline: none;
}

.form-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(255, 188, 0, 0.1);
}

.form-input::placeholder {
  color: var(--gray-500);
  font-weight: 400;
}

.input-icon {
  position: absolute;
  left: 16px;
  color: var(--gray-600);
  pointer-events: none;
}

/* 버튼 그룹 */
.button-group {
  display: flex;
  gap: 16px;
  margin-top: 32px;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 16px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.cancel-btn {
  background: var(--gray-50);
  color: var(--gray-600);
  border: 2px solid var(--gray-200);
}

.cancel-btn:hover {
  background: var(--gray-100);
  color: var(--gray-700);
  border-color: var(--gray-300);
  transform: translateY(-1px);
}

.confirm-btn {
  background: var(--primary);
  color: var(--white);
  box-shadow: var(--shadow);
}

.confirm-btn:hover:not(:disabled) {
  background: var(--primary-dark);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.confirm-btn:disabled {
  background: var(--gray-300);
  color: var(--gray-500);
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.confirm-btn svg,
.cancel-btn svg {
  width: 16px;
  height: 16px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }
  
  .nav-content {
    padding: 12px 16px;
  }
  
  .logo-text {
    font-size: 18px;
  }
  
  .back-btn {
    padding: 10px;
  }
  
  .form-section {
    padding: 24px;
  }
  
  .section-header h2 {
    font-size: 20px;
  }
  
  .section-description {
    font-size: 14px;
  }
  
  .bank-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 12px;
  }
  
  .bank-card {
    padding: 16px 12px;
  }
  
  .bank-logo-container {
    width: 56px;
    height: 56px;
  }
  
  .bank-logo {
    width: 56px;
    height: 56px;
  }
  
  .bank-name {
    font-size: 13px;
  }
  
  .button-group {
    flex-direction: column;
    gap: 12px;
  }
  
  .cancel-btn,
  .confirm-btn {
    padding: 14px 20px;
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 12px;
  }
  
  .page-header {
    padding: 12px 16px;
  }
  
  .form-section {
    padding: 20px;
  }
  
  .bank-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  
  .bank-card {
    padding: 12px 8px;
  }
  
  .bank-logo-container {
    width: 48px;
    height: 48px;
  }
  
  .bank-logo {
    width: 48px;
    height: 48px;
  }
  
  .bank-name {
    font-size: 12px;
  }
  
  .form-input {
    padding: 14px 18px 14px 46px;
    font-size: 15px;
  }
  
  .input-icon {
    left: 14px;
  }
  
  .input-icon svg {
    width: 18px;
    height: 18px;
  }
}
</style>
