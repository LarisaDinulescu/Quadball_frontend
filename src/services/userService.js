import api from './api'; // Assuming api.js exports your configured Axios instance

export const updateUserData = async (userId, userData) => {
    try {
        const payloadMap = new Map();
        payloadMap.set("name", userData.name);
        payloadMap.set("surname", userData.surname);

// Per inviarlo con axios (che richiede un oggetto piano)
const payload = Object.fromEntries(payloadMap);
        const response = await api.put(`/users/${userId}`, payload);
        return response.data;
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