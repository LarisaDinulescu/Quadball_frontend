import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// This is the Interceptor
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user?.token; // or user?.accessToken depending on your backend
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;