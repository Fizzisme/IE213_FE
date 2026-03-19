import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8017/v1',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      alert("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default api;