<template>
  <div class="account-favorites-page">
    <!-- 헤더 -->
    <header class="page-header">
      <button @click="goBack" class="back-btn">←</button>
      <h1>계좌 즐겨찾기</h1>
      <button @click="goToAddPage" class="add-btn">+</button>
    </header>

    <!-- 메인 콘텐츠 -->
    <div class="main-content">
      <!-- 빈 상태 -->
      <div class="empty-state">
        <div class="empty-icon">⭐</div>
        <p>자주 사용하는 계좌를 추가해보세요!</p>
        <button @click="goToAddPage" class="add-first-btn">
          즐겨찾기 계좌 추가하기
        </button>
      </div>

      <!-- 즐겨찾기 계좌 목록 -->
      <div class="favorites-section">
        <div class="section-header">
          <h2>즐겨찾기 계좌</h2>
          <span class="count">{{ favorites.length }}개</span>
        </div>

        <div class="favorites-list">
          <div
            v-for="account in favorites"
            :key="account.favoriteId"
            class="favorite-card"
          >
            <div class="account-info">
              <img
                v-if="getBankLogo(account.sendBankCode)"
                :src="getBankLogo(account.sendBankCode)"
                :alt="account.sendBankCode"
                class="bank-logo"
              />
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
  --kb-yellow: #ffd700;
  --kb-orange: #ff8c00;
  --kb-orange-dark: #e67300;
  --kb-gray-light: #ffffff;
  --kb-gray: #f8f9fa;
  --kb-text-primary: #1a1a1a;
  --kb-text-secondary: #666666;
  --kb-border: #e1e5e9;
  --kb-shadow: rgba(0, 0, 0, 0.08);
  --kb-shadow-hover: rgba(0, 0, 0, 0.12);
  min-height: 100vh;
  background: var(--kb-gray);
  font-family: 'Pretendard', sans-serif;
}

/* 헤더 */
.page-header {
  background: var(--kb-gray-light);
  border-bottom: 3px solid var(--kb-orange);
  position: sticky;
  top: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.back-btn,
.add-btn {
  background: var(--kb-orange);
  border: none;
  color: var(--kb-gray-light);
  font-size: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.back-btn:hover,
.add-btn:hover {
  background: var(--kb-orange-dark);
}
.page-header h1 {
  color: var(--kb-orange);
  font-weight: 700;
}

/* 메인 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

/* 빈 상태 */
.empty-state {
  margin: 40px auto;
  text-align: center;
  background: var(--kb-gray-light);
  padding: 3rem 1rem;
  border-radius: 16px;
  box-shadow: 0 4px 16px var(--kb-shadow);
  border: 1px solid var(--kb-border);
}
.empty-icon {
  font-size: 48px;
  color: var(--kb-orange);
  margin-bottom: 16px;
}
.add-first-btn {
  background: var(--kb-orange);
  color: var(--kb-gray-light);
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 700;
  cursor: pointer;
}
.add-first-btn:hover {
  background: var(--kb-orange-dark);
}

/* 카드 */
.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.favorite-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: var(--kb-gray-light);
  border-radius: 16px;
  border-left: 4px solid var(--kb-orange);
  box-shadow: 0 4px 16px var(--kb-shadow);
  transition: all 0.3s ease;
}
.favorite-card:hover {
  box-shadow: 0 6px 20px var(--kb-shadow-hover);
}

/* 카드 내부 요소 */
.account-info {
  display: flex;
  align-items: center;
  gap: 16px;
}
.bank-logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
  border-radius: 8px;
  background: var(--kb-gray);
  padding: 4px;
}
.account-texts {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.account-name {
  font-weight: 700;
  font-size: 18px;
  color: var(--kb-text-primary);
}
.account-number {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: var(--kb-text-secondary);
}

/* 삭제 버튼 */
.account-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.action-btn.remove {
  background: #dc3545;
  color: var(--kb-gray-light);
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 700;
  cursor: pointer;
}
.action-btn.remove:hover {
  background: #c82333;
}

/* 섹션 헤더 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--kb-gray-light);
  padding: 12px 16px;
  border-radius: 12px;
  border-left: 4px solid var(--kb-orange);
  box-shadow: 0 2px 8px var(--kb-shadow);
  margin-bottom: 16px;
}
.section-header h2 {
  font-size: 28px;
  font-weight: 800;
}
.count {
  background: var(--kb-orange);
  color: var(--kb-gray-light);
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 700;
}
</style>
