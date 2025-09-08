import axios from 'axios';

//axios->api로 수정!
export const checkFraudAccount = async (requestBody) => {
  try {
    const response = await axios.post('/api/fraud-account/check', requestBody);
    return response;
  } catch (error) {
    console.error('사기계좌 탐지 실패: ', error);
  }
};
