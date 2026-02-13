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
    
    // Se non troviamo il token singolo, proviamo a estrarlo dall'oggetto user
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

    // 401: Token scaduto o non valido
    // 403: Accesso negato (ma spesso Spring Security lo usa se il token è mancante/invalido)
    if (status === 401 || status === 403) {
      // Puliamo il localStorage solo se eravamo effettivamente loggati
      if (localStorage.getItem('token') || localStorage.getItem('user')) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        
        // Evitiamo il redirect se siamo già nella pagina di login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;