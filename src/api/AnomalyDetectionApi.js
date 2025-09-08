import axios from 'axios';

export const calculateAnomalyScore = async (requestBody) => {
  try {
    const response = await axios.post(
      '/api/anomaly-detection/calculate',
      requestBody
    );
    return response;
  } catch (error) {
    console.error('이상탐지 점수계산 실패:', error);
    throw error;
  }
};
