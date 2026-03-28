import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8017/v1',
  withCredentials: true,
});

let isAuthenticated = false; // hoặc lấy từ state

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && isAuthenticated) {
      alert("Phiên đăng nhập đã hết hạn");
    }
    return Promise.reject(err);
  }
);
export default api;