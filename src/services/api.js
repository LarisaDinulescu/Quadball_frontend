import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    let finalToken = localStorage.getItem('token');
    
    // If we don't find the single token, we try to extract it from the user object
    if (!finalToken) {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          finalToken = user?.token;
        }
      } catch (e) {
        console.error("Errore nel parsing dell'utente dal localStorage", e);
      }
    }
    
    if (finalToken) {
      config.headers.Authorization = `Bearer ${finalToken}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);



api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // 401: Token expired or invalid
    // 403: Access denied (but Spring Security often uses this if the token is missing/invalid)
    if (status === 401 || status === 403) {
      // We only clear localStorage if we were actually logged in
      if (localStorage.getItem('token') || localStorage.getItem('user')) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        
        // Let's avoid the redirect if we are already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;