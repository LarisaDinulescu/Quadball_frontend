import api from "./api";

const API_URL = '/matches'; 


const matchService = {

getAllMatches: async () => {
    try {
        // Added getAuthHeaders() to allow display after change in WebSecurityConfig
        const response = await api.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching matches:", error);
        throw error;
    }
  },

getMatchById: async (id) => {
    try {
        // added getAuthHeaders()
        const response = await api.get(`${API_URL}/${id}`);
        return response.data;
    } catch(error) {
        console.error(`Error fetching match ${id}:`, error);
        throw error;
    }
},

createMatch: async (matchData) => {
    try {
        const response = await api.post(API_URL, matchData);
        return response.data;
    } catch (error) {
        console.error("Error creating match:", error.response?.data || error.message);
        throw error;
    }
},

updateMatch: async (id, matchData) => {
    try {    
        const response = await api.put(`${API_URL}/${id}`, matchData);
        return response.data;
    } catch (error) {
        console.error(`Error updating match ${id}:`, error);
        throw error;
    }
},


deleteMatch: async (id) => {
    try {
        const response = await api.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
      console.error(`Error deleting match ${id}:`, error);
      throw error;
    }
},


submitRoster: async (matchId, rosterData) => {
    const response = await api.post(`${API_URL}/${matchId}/submit-roster`, rosterData);
    return response.data;
},

startMatch: async (id) => {
    const response = await api.post(`${API_URL}/${id}/start-match`, {});
    return response.data;
}

};

export default matchService;