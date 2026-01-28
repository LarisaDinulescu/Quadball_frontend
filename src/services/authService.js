import api from './api';

const AUTH_URL = '/auth';

/**
 * Signs up a new user.
 * Java: Long signUp(SignUpRequest signUpRequest);
 * @param {Object} signUpRequest - {name, surname, email, password}
 * @returns {Promise<number>} The ID of the newly created user
 */
export const signup = async (signUpRequest) => {
  const response = await api.post(`${AUTH_URL}/signup`, signUpRequest);
  return response.data; // Returns Long ID
};

/**
 * Signs in a user and saves the session.
 * Java: SignInResponse signIn(SignInRequest signInRequest);
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} SignInResponse { accessToken, expiresIn, user }
 */
export const login = async (email, password) => {
  const response = await api.post(`${AUTH_URL}/signin`, { email, password });
  
  // As per your SignInResponse: { accessToken, expiresIn, user }
  if (response.data.accessToken) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('token', response.data.accessToken);

  }
  return response.data;
};

/**
 * Activates a user account using a token from an email.
 * Java: void activateUser(String token);
 * @param {string} token 
 */
export const activateAccount = async (token) => {
  return await api.get(`${AUTH_URL}/activate-account`, { params: { token } });
};

/**
 * Requests a password reset link.
 * Java: void requestPasswordReset(String email);
 * @param {string} email 
 */
export const forgetPassword = async (email) => {
  return await api.get(`${AUTH_URL}/forget-password`, { params: { email } });
};

/**
 * Completes the password reset process.
 * Java: void completePasswordReset(ResetPasswordRequest resetPasswordRequest);
 * @param {Object} resetPasswordRequest - {token, newPassword, newPasswordConfirmation}
 */
export const resetPassword = async (resetPasswordRequest) => {
  return await api.post(`${AUTH_URL}/reset-password`, resetPasswordRequest);
};

/**
 * Clears local session and redirects to login.
 */
export const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  window.location.href = '/login'; 
};

// --- FRONTEND UTILITIES ---

/**
 * Retrieves the complete stored session data.
 */
export const getSessionData = () => {
  const data = localStorage.getItem('user');
  return data ? JSON.parse(data) : null;
};

/**
 * Checks if the user has any of the required roles.
 * Supported: ROLE_ORGANIZATION_MANAGER, ROLE_TEAM_MANAGER, ROLE_SPECTATOR
 * @param {string|string[]} requiredRoles 
 */
export const hasRole = (requiredRoles) => {
  const user = getSessionData();
  
  // Based on your SignInResponse 'user' object and 'rules' list
  if (!user || !user.roles) return false;
  
  const rolesToCheck = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  return user.roles.some(role => rolesToCheck.includes(role));
};