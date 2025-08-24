import axios from "axios";

export const testConnection = async () => {
  try {
    const response = await axios.get("/api/test");
    console.log("✅ 백엔드 응답:", response.data);
  } catch (error) {
    console.error("❌ 연결 실패:", error);
  }
};
