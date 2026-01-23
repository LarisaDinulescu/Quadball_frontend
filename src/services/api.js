import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor per gestire il token
api.interceptors.request.use(
  (config) => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const token = user?.token || user?.accessToken;
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error("Error parsing user from localStorage", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;