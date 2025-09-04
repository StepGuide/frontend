<template>
  <div class="af-add-page">
    <!-- 헤더 -->
    <header class="page-header">
      <button @click="goBack" class="back-btn">←</button>
      <h1>계좌 즐겨찾기 추가</h1>
    </header>

    <div class="main-content">
      <!-- 은행 선택 -->
      <div class="form-group">
        <label>은행 선택</label>
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
            <img :src="bank.logo" :alt="bank.name" class="bank-logo" />
            <span class="bank-name">{{ bank.name }}</span>
          </button>
        </div>
      </div>

      <!-- 계좌 입력 -->
      <div class="form-group">
        <label>계좌명</label>
        <input
          v-model="favoriteAccount.name"
          type="text"
          placeholder="계좌명을 입력하세요"
        />
      </div>

      <div class="form-group">
        <label>계좌번호</label>
        <input
          v-model="favoriteAccount.accountNumber"
          type="text"
          placeholder="계좌번호를 입력하세요"
        />
      </div>

      <!-- 버튼 그룹 -->
      <div class="button-group">
        <button @click="goBack" class="cancel-btn">취소</button>
        <button @click="addFavoriteAccount" class="confirm-btn">추가</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
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

// 은행 선택
const selectBank = (bank) => {
  selectedBankCode.value = bank.code;
  favoriteAccount.value.bankCode = bank.code; // 선택 시 자동으로 bankCode 설정
};

// 연결 상태 변경
const handleConnect = (bank) => {
  bankStore.markAsConnected(bank.code);
};

// 뒤로가기
const goBack = () => {
  router.back();
};

// 즐겨찾기 추가
const addFavoriteAccount = async () => {
  if (
    favoriteAccount.value.name &&
    favoriteAccount.value.accountNumber &&
    favoriteAccount.value.bankCode
  ) {
    await addFavorite({
      sendBankNickname: favoriteAccount.value.name,
      sendAccountNumber: favoriteAccount.value.accountNumber,
      sendBankCode: favoriteAccount.value.bankCode,
    });
    alert('즐겨찾기 계좌가 추가되었습니다!');
    router.push('/account-favorites'); // 즐겨찾기 목록 페이지로 이동
  } else {
    alert('계좌명, 계좌번호, 은행을 선택해주세요.');
  }
};
</script>

<style scoped>
.af-add-page {
  min-height: 100vh;
  background: #f8f9fa;
  font-family: 'Pretendard', sans-serif;
  color: #1a1a1a;
}

/* 헤더 */
.page-header {
  background: #ffffff;
  border-bottom: 3px solid #ff8c00;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.back-btn {
  background: #ff8c00;
  color: #ffffff;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
}

.page-header h1 {
  font-size: 20px;
  font-weight: 700;
  color: #ff8c00;
}

/* 메인 */
.main-content {
  max-width: 600px;
  margin: 32px auto;
  padding: 16px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
}

/* 은행 카드 3열 */
.bank-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.bank-card {
  position: relative;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e1e5e9;
  background: #ffffff;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.bank-card.selected {
  border-color: #ff8c00;
  box-shadow: 0 0 8px rgba(255, 140, 0, 0.3);
}

.bank-logo {
  width: 50px;
  height: 50px;
  margin-bottom: 8px;
}

.bank-name {
  display: block;
  font-weight: 600;
}

.badge {
  position: absolute;
  top: 8px;
  right: 8px;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-checked {
  background: #28a745;
  color: #ffffff;
}

.badge-plus {
  background: #ff8c00;
  color: #ffffff;
}

/* 버튼 그룹 */
.button-group {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 12px 20px;
  border-radius: 25px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  font-size: 16px;
}

.cancel-btn {
  background: #f8f9fa;
  border: 1px solid #e1e5e9;
  color: #666666;
}

.confirm-btn {
  background: #ff8c00;
  color: #ffffff;
}

.confirm-btn:hover {
  background: #e67300;
}

.cancel-btn:hover {
  background: #e1e5e9;
}
</style>
