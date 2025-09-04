import axios from "axios";

const api = axios.create({
  baseURL: "/api", // 프록시 경로 고정
  withCredentials: true, // 필요 여부에 따라
});

// 도움 요청 코드 생성 API
export const createHelpRequest = async (userId) => {
  try {
    const response = await api.post('/help-code/generate', null, {
      params: {
        userId: userId
      }
    });
    return response.data; // 6자리 코드 문자열이 직접 반환됨
  } catch (error) {
    console.error('도움 요청 생성 실패:', error);
    throw error;
  }
};

// 도움 요청 상태 조회 API
export const getHelpRequestStatus = async (code) => {
  try {
    const response = await api.get(`/help-request/${code}`);
    return response.data;
  } catch (error) {
    console.error('도움 요청 상태 조회 실패:', error);
    throw error;
  }
};

export default api;
