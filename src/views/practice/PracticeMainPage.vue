<template>
  <div class="practice-page">
    <!-- 상단 네비게이션 -->
    <nav class="navbar">
      <div class="nav-content">
        <div class="logo">
          <button class="back-btn" @click="goBack">
            <span class="back-icon">←</span>
          </button>
          <span class="logo-text">연습 모드</span>
        </div>
        <div class="nav-actions">
          <div class="practice-indicator">
            <span class="indicator-icon">🎮</span>
            <span class="indicator-text">연습 중</span>
          </div>
          <button class="help-btn" @click="requestHelp">
            <span class="help-icon">❓</span>
            <span class="help-text">도움</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- 메인 콘텐츠 -->
    <div class="main-content">
      <!-- 연습 모드 안내 -->
      <div class="practice-notice">
        <div class="notice-card">
          <div class="notice-icon">🛡️</div>
          <div class="notice-content">
            <h3>안전한 연습 환경</h3>
            <p>
              실제 계좌에 영향을 주지 않는 가상 환경에서 금융 서비스를
              연습해보세요.
            </p>
          </div>
        </div>
      </div>

      <!-- 연습 계좌 정보 -->
      <div class="practice-accounts">
        <div class="section-header">
          <h2>연습 계좌</h2>
          <div class="practice-badge">가상 계좌</div>
        </div>

        <div class="account-list">
          <div
            v-for="account in practiceAccounts"
            :key="account.id"
            class="account-card"
            :class="{ selected: selectedAccount?.id === account.id }"
            @click="selectAccount(account)"
          >
            <div class="account-header">
              <div class="bank-info">
                <div class="bank-icon">{{ getBankIcon(account.bankCode) }}</div>
                <div class="bank-details">
                  <div class="bank-name">{{ account.bankName }}</div>
                  <div class="account-type">{{ account.accountType }}</div>
                </div>
              </div>
              <div class="practice-indicator">
                <span class="practice-icon">🎯</span>
              </div>
            </div>

            <div class="account-details">
              <div class="account-number">{{ account.accountNumber }}</div>
              <div class="account-name">{{ account.accountName }}</div>
            </div>

            <div class="balance-section">
              <div class="balance-info">
                <div class="balance-label">연습 잔액</div>
                <div class="balance-amount">
                  ₩ {{ formatNumber(account.balance) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 연습 선택 페이지 이동 버튼 -->
        <div class="practice-actions">
          <button class="btn-primary" @click="goToPracticeSelect">다음</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { usePracticeStore } from '@/stores/practice';

const router = useRouter();
const practiceStore = usePracticeStore(); // Pinia store

// 반응형 데이터
const selectedAccount = ref(null);

// 연습 계좌 샘플
const practiceAccounts = ref([
  {
    id: 1,
    bankCode: 'KB',
    bankName: 'KB국민은행',
    accountNumber: '999-999999-99-999',
    accountName: '연습용 계좌',
    accountType: '입출금통장',
    balance: 1000000,
  },
  {
    id: 2,
    bankCode: 'SHINHAN',
    bankName: '신한은행',
    accountNumber: '999-999-999999',
    accountName: '연습용 계좌',
    accountType: '입출금통장',
    balance: 500000,
  },
]);

// 계좌 선택
const selectAccount = (account) => {
  selectedAccount.value = account;
  practiceStore.setSelectedAccount(account); // store에 저장
};

// 뒤로가기
const goBack = () => router.push('/');

// 도움 요청
const requestHelp = () => router.push('/user');

// 은행 아이콘
const getBankIcon = (bankCode) => {
  const icons = { KB: '🏦', SHINHAN: '🏛️', WOORI: '🏢', HANA: '🏪', NH: '🌾' };
  return icons[bankCode] || '🏦';
};

// 숫자 포맷
const formatNumber = (num) => new Intl.NumberFormat('ko-KR').format(num);

// 연습 선택 페이지로 이동
const goToPracticeSelect = () => {
  if (!selectedAccount.value) {
    alert('계좌를 먼저 선택해주세요!');
    return;
  }
  router.push('/practice/PracticeSelectPage'); // 페이지 이동
};
</script>

<style scoped>
/* 기본 컬러 */
.practice-page {
  --kb-yellow-positive: #ffbc00;
  --kb-yellow-negative: #ffcc00;
  --kb-gray: #605850;
  --primary: var(--kb-yellow-positive);
  --primary-dark: #e6a600;
  --gray-50: #fafafa;
  --gray-200: #eeeeee;
  --gray-600: #757575;
  --gray-800: #424242;
  --white: #ffffff;
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 네비게이션 */
.navbar {
  background: var(--white);
  border-bottom: 1px solid var(--gray-200);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow);
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
  background: var(--white);
  border: 1px solid var(--gray-200);
  padding: 12px;
  border-radius: 16px;
  cursor: pointer;
}

.back-icon {
  font-size: 18px;
  color: var(--gray-600);
  font-weight: 600;
}

.logo-text {
  font-size: 22px;
  font-weight: 600;
  color: var(--kb-gray);
}

.nav-actions {
  display: flex;
  gap: 12px;
}

.practice-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--kb-yellow-negative);
  color: var(--gray-800);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.help-btn {
  background: var(--gray-200);
  color: var(--gray-600);
  border: none;
  padding: 10px 16px;
  border-radius: 20px;
  cursor: pointer;
}

.main-content {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Noto Sans KR', sans-serif;
  color: #333;
}

/* 연습 모드 안내 */
.practice-notice {
  margin: 0px 0 30px 0;
  background: #fff4d6;
  border-radius: 12px;
  padding: 12px;
  border-left: 4px solid var(--kb-yellow-positive);
}

.notice-card {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notice-icon {
  font-size: 32px;
}

.notice-content h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 4px;
}

.notice-content p {
  font-size: 14px;
  color: var(--gray-600);
}

/* 연습 계좌 */
.practice-accounts {
  background: var(--white);
  border-radius: 12px;
  padding: 12px;
  border: 1px solid var(--gray-200);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 0 24px 0;
  padding: 12px 16px;
  background: var(--white);
  border-radius: 12px;
  border-left: 4px solid var(--kb-yellow-positive);
}

.section-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--kb-gray);
}

.practice-badge {
  background: var(--kb-yellow-negative);
  color: var(--gray-800);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.account-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* account-card 내용 크게 조정 */
.account-card {
  background: var(--gray-50);
  border-radius: 12px;
  padding: 50px; /* padding 확대 */
  border: 1px solid var(--gray-200);
  cursor: pointer;
  box-shadow: var(--shadow);
  transition: all 0.2s ease;
}

.account-card.selected {
  border-color: var(--kb-yellow-positive);
  background: #fff4d6;
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px; /* margin 확대 */
}

.bank-info {
  display: flex;
  align-items: center;
  gap: 16px; /* gap 확대 */
}

.bank-icon {
  font-size: 48px; /* 아이콘 크기 확대 */
}

.bank-details {
  display: flex;
  flex-direction: column;
}

.bank-name {
  font-size: 18px; /* 폰트 확대 */
  font-weight: 700;
}

.account-type {
  font-size: 16px; /* 폰트 확대 */
  color: var(--gray-600);
}

.account-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px; /* margin 확대 */
}

.account-number {
  font-size: 16px; /* 폰트 확대 */
  font-weight: 600;
}

.account-name {
  font-size: 16px; /* 폰트 확대 */
  color: var(--gray-600);
}

.balance-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.balance-info {
  display: flex;
  flex-direction: column;
}

.balance-label {
  font-size: 14px; /* 폰트 확대 */
  color: var(--gray-600);
}

.balance-amount {
  font-size: 20px; /* 폰트 확대 */
  font-weight: 700;
  color: var(--kb-gray);
}

/* 연습 선택 버튼 */
.practice-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 10px;
}

.btn-primary {
  background: var(--kb-yellow-positive);
  color: var(--white);
  font-size: 20px;
  padding: 12px 50px;
  border-radius: 16px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--primary-dark);
}
</style>
