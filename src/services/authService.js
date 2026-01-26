import api from './api';

const AUTH_URL = '/auth';

/**
 * Register a new user
 * @param {Object} userData - {name, surname, email, password}
 */
export const signup = async (userData) => {
  return await api.post(`${AUTH_URL}/signup`, userData);
};

/**
 * User login
 * Saves user data and token to localStorage
 */
export const login = async (email, password) => {
  const response = await api.post(`${AUTH_URL}/signin`, { email, password });
  // Backend response: { accessToken, expiresIn, user: { id, email, name, surname, ruolo: [] } }
  if (response.data.accessToken) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

/**
 * Account activation via email token
 */
export const activateAccount = async (token) => {
  return await api.get(`${AUTH_URL}/activate-account`, { params: { token } });
};

/**
 * Password recovery request
 */
export const forgetPassword = async (email) => {
  return await api.get(`${AUTH_URL}/forget-password`, { params: { email } });
};

/**
 * Password reset with token
 * @param {Object} data - {token, newPassword, newPasswordConfirmation}
 */
export const resetPassword = async (data) => {
  return await api.post(`${AUTH_URL}/reset-password`, data);
};

/**
 * Logout
 */
export const logout = () => {
  localStorage.removeItem('user');
  window.location.href = '/login'; 
};

// --- FRONTEND UTILS ---

/**
 * Retrieve current user data from storage
 */
export const getCurrentUser = () => {
  const data = localStorage.getItem('user');
  return data ? JSON.parse(data) : null;
};

/**
 * Check if the user has one of the specified roles
 * Available roles: ROLE_ORGANIZATION_MANAGER, ROLE_TEAM_MANAGER, ROLE_SPECTATOR
 * @param {String|Array} requiredRoles - Required role or list of roles
 */
export const hasRole = (requiredRoles) => {
  const data = getCurrentUser();
  // Matching your backend structure: data.user.ruolo
  if (!data || !data.user || !data.user.ruolo) return false;
  
  const rolesToCheck = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  return data.user.ruolo.some(role => rolesToCheck.includes(role));
};