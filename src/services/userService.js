import api from './api'; // Assuming api.js exports your configured Axios instance

// Update User Data
// Payload should match the DTO expected by backend (e.g., firstName, lastName, email)
export const updateUserData = async (userId, userData) => {
    try {
        const response = await api.put(`/users/${userId}`, userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete User Account
export const deleteUserAccount = async (userId) => {
    try {
        await api.delete(`/users/${userId}`);
    } catch (error) {
        throw error;
    }
};

export const changePassword = async (userId, oldPassword, newPassword) => {
    // These keys ("oldPassword", "newPassword") match the payload.get(...) keys in Java
    const response = await api.put(`/users/${userId}/password`, {
        oldPassword,
        newPassword
    });
    return response.data;
};