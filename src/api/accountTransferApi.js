import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Vite proxy 사용
  withCredentials: true, // 필요에 따라 설정
});


// 내 전체 계좌 조회
export const getUserAccounts = async (userId) => {
  try {
    const response = await api.get(`/transfer/accounts/${userId}`);
    return response.data; // 계좌 배열 반환
  } catch (error) {
    console.error('계좌 조회 실패:', error);
    throw error;
  }
};

// 최근 거래 내역 조회
export const getAccountTransactions = async (accountId) => {
  try {
    const res = await api.get(`/transfer/transactions/${accountId}`);
    return res.data; // List<AccountTransferDTO>
  } catch (err) {
    console.error('거래내역 조회 실패:', err);
    throw err;
  }
};

// 제일 위(기본) 계좌 조회
export const getFirstAccountTransfer = async (userId) => {
  try {
    const res = await api.get(`/transfer/oneaccounts/${userId}`);
    return res.data; // AccountTransferDTO
  } catch (err) {
    console.error('기본 계좌 조회 실패:', err);
    throw err;
  }
};


// 검증
export const validateTransfer = async (transferDTO) => {
  try {
    const response = await api.post('/transfer/validate', transferDTO);
    return response.data; // 서버에서 검증 후 반환한 DTO
  } catch (error) {
    console.error('이체 검증 실패:', error);
    throw error;
  }
};


// 이체
export const executeTransfer = async (transferDTO) => {
  try {
    const response = await api.post('/transfer/execute', transferDTO);
    return response.data; // 성공 메시지 반환
  } catch (error) {
    console.error('이체 실행 실패:', error);
    throw error;
  }
};

export default api;
