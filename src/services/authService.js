import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth/';

export const login = async (email, password) => {
  // Il backend aspetta 'email' come usernameParameter
  const response = await axios.post(API_URL + 'signin', { email, password });
  if (response.data.accessToken) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};