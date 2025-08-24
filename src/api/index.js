import axios from "axios";

const api = axios.create({
  baseURL: "/api", // 프록시 경로 고정
  withCredentials: true, // 필요 여부에 따라
});

export default api;
