import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', //link to backend Spring
});

export default api;