import axios from 'axios';
import { ref } from 'vue';

export const favorites = ref([]);
export const userId = ref(1);

//API URL

const API_URL = 'http://localhost:8080/api/favorite-account';

// 즐겨찾기 조회
export const getFavorites = async () => {
  try {
    const res = await axios.get(API_URL, {
      params: { userId: userId.value },
    });
    favorites.value = res.data;
  } catch (err) {
    console.error('즐겨찾기 조회 실패:', err);
  }
};

// 즐겨찾기 추가
export const addFavorite = async (account) => {
  try {
    await axios.post(API_URL, {
      userId: userId.value,
      sendBankCode: account.sendBankCode,
      sendAccountNumber: account.sendAccountNumber,
      sendBankNickname: account.sendBankNickname,
    });
    await getFavorites(); // 추가 후 목록 갱신
  } catch (err) {
    console.error('즐겨찾기 추가 실패:', err);
  }
};

// 즐겨찾기 삭제
export const deleteFavorite = async (favoriteId) => {
  try {
    await axios.delete(`${API_URL}/${favoriteId}`);
    await getFavorites(); // 삭제 후 목록 갱신
  } catch (err) {
    console.error('즐겨찾기 삭제 실패:', err);
  }
};
