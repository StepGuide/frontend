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
          <button class="add-btn" @click="goToAddPage">
            <span class="add-icon">+</span>
            <span class="add-text">추가</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- 메인 콘텐츠 -->
    <div class="main-content">
      <!-- 빈 상태 -->
      <div v-if="favorites.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3 class="empty-title">즐겨찾기 계좌가 없습니다</h3>
        <p class="empty-description">자주 사용하는 계좌를 추가해보세요!</p>
        <button @click="goToAddPage" class="add-first-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          즐겨찾기 계좌 추가하기
        </button>
      </div>

      <!-- 즐겨찾기 계좌 목록 -->
      <div v-else class="favorites-section">
        <div class="section-header">
          <div class="section-title">
          <h2>즐겨찾기 계좌</h2>
          <span class="count">{{ favorites.length }}개</span>
          </div>
        </div>

        <div class="favorites-list">
          <div
            v-for="account in favorites"
            :key="account.favoriteId"
            class="favorite-card"
          >
            <div class="account-info">
              <div class="bank-logo-container">
              <img
                v-if="getBankLogo(account.sendBankCode)"
                :src="getBankLogo(account.sendBankCode)"
                :alt="account.sendBankCode"
                class="bank-logo"
              />
                <div v-else class="bank-logo-placeholder">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 21H21L12 2L3 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
              <div class="account-texts">
                <div class="account-name">{{ account.sendBankNickname }}</div>
                <div class="account-number">
                  {{ account.sendAccountNumber }}
                </div>
              </div>
            </div>
            <div class="account-actions">
              <button
                @click="removeFavorite(account.favoriteId)"
                class="action-btn remove"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                삭제
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { favorites, getFavorites, deleteFavorite } from '@/api/favoritesApi';
import { useBankStore } from '@/stores/bank';

const router = useRouter();
const bankStore = useBankStore();

// 컴포넌트 마운트 시 즐겨찾기 초기화
onMounted(async () => {
  await getFavorites();
});

// 뒤로가기
const goBack = () => {
  router.push('/');
};

// 즐겨찾기 추가 페이지 이동
const goToAddPage = () => {
  router.push('/account-favorites/add');
};

// 즐겨찾기 삭제
const removeFavorite = async (favoriteId) => {
  if (!favoriteId) return;
  await deleteFavorite(favoriteId);
};

// 은행 코드에 따른 로고 반환
const getBankLogo = (bankCode) => {
  const bank = bankStore.banks.find((b) => b.code === bankCode);
  return bank ? bank.logo : '';
};
</script>

<style scoped>
.account-favorites-page {
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

.add-btn {
  background: var(--primary);
  color: var(--white);
  border: none;
  padding: 10px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: var(--shadow);
}

.add-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.add-icon {
  font-size: 16px;
  font-weight: bold;
}

.add-text {
  font-size: 14px;
}

/* 메인 콘텐츠 */
.main-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  background: var(--white);
  padding: 64px 32px;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--gray-200);
  margin: 40px 0;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-light);
  border-radius: var(--radius-xl);
}

.empty-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--accent);
  margin: 0 0 12px;
}

.empty-description {
  font-size: 16px;
  color: var(--gray-600);
  margin: 0 0 32px;
  line-height: 1.5;
}

.add-first-btn {
  background: var(--primary);
  color: var(--white);
  border: none;
  padding: 16px 32px;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  box-shadow: var(--shadow);
}

.add-first-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 즐겨찾기 섹션 */
.favorites-section {
  margin-top: 24px;
}

.section-header {
  background: var(--white);
  padding: 20px 24px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  border: 1px solid var(--gray-200);
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.section-title h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--accent);
  margin: 0;
}

.count {
  background: var(--primary);
  color: var(--white);
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
}

/* 즐겨찾기 목록 */
.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.favorite-card {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow);
  border: 1px solid var(--gray-200);
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.favorite-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
  border-color: var(--primary);
}

/* 계좌 정보 */
.account-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.bank-logo-container {
  position: relative;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bank-logo {
  width: 56px;
  height: 56px;
  object-fit: contain;
  border-radius: var(--radius-md);
  background: var(--gray-50);
  padding: 8px;
  border: 1px solid var(--gray-200);
}

.bank-logo-placeholder {
  width: 56px;
  height: 56px;
  background: var(--accent-light);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-600);
  border: 1px solid var(--gray-200);
}

.account-texts {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.account-name {
  font-weight: 600;
  font-size: 18px;
  color: var(--accent);
  line-height: 1.2;
}

.account-number {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  font-size: 14px;
  color: var(--gray-600);
  letter-spacing: 0.5px;
}

/* 액션 버튼 */
.account-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.action-btn.remove {
  background: #fef2f2;
  color: var(--danger);
  border: 1px solid #fecaca;
}

.action-btn.remove:hover {
  background: #fee2e2;
  color: #b91c1c;
  transform: translateY(-1px);
}

.action-btn svg {
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
  
  .add-btn {
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .add-text {
    display: none;
  }
  
  .empty-state {
    padding: 48px 24px;
  }
  
  .empty-title {
    font-size: 20px;
  }
  
  .empty-description {
    font-size: 14px;
  }
  
  .favorite-card {
    padding: 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .account-info {
    width: 100%;
  }
  
  .account-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .section-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .section-title h2 {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 12px;
  }
  
  .page-header {
    padding: 12px 16px;
  }
  
  .empty-state {
    padding: 32px 16px;
  }
  
  .favorite-card {
    padding: 16px;
  }
  
  .bank-logo-container {
    width: 48px;
    height: 48px;
  }
  
  .bank-logo,
  .bank-logo-placeholder {
    width: 48px;
    height: 48px;
  }
  
  .account-name {
    font-size: 16px;
  }
  
  .account-number {
    font-size: 13px;
  }
}
</style>
