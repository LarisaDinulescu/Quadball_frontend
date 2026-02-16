import axios from 'axios';

const API_URL = 'http://localhost:8080/api/matches'; 

// Internal function to get headers with token
const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
        return { Authorization: `Bearer ${user.accessToken}` };
    }
    return {};
};

const matchService = {

getAllMatches: async () => {
    try {
        // Added getAuthHeaders() to allow display after change in WebSecurityConfig
        const response = await axios.get(API_URL, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error("Error fetching matches:", error);
        throw error;
    }
  },

getMatchById: async (id) => {
    try {
        // added getAuthHeaders()
        const response = await axios.get(`${API_URL}/${id}`, { headers: getAuthHeaders() });
        return response.data;
    } catch(error) {
        console.error(`Error fetching match ${id}:`, error);
        throw error;
    }
},

createMatch: async (matchData) => {
    try {
        const response = await axios.post(API_URL, matchData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error("Error creating match:", error.response?.data || error.message);
        throw error;
    }
},

updateMatch: async (id, matchData) => {
    try {    
        const response = await axios.put(`${API_URL}/${id}`, matchData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error updating match ${id}:`, error);
        throw error;
    }
},


deleteMatch: async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
      console.error(`Error deleting match ${id}:`, error);
      throw error;
    }
},


submitRoster: async (matchId, rosterData) => {
    const response = await axios.post(`${API_URL}/${matchId}/submit-roster`, rosterData, { headers: getAuthHeaders() });
    return response.data;
},

startMatch: async (id) => {
    const response = await axios.post(`${API_URL}/${id}/start-match`, {}, { headers: getAuthHeaders() });
    return response.data;
}

};

export default matchService;