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

/**
* Retrieves the list of all matches
*/
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

/**
* Retrieves a specific match by ID
*/
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

/**
* Creates a new match
* Only accessible by ROLE_ORGANIZATION_MANAGER
*/
createMatch: async (matchData) => {
    try {
        const response = await axios.post(API_URL, matchData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error("Error creating match:", error.response?.data || error.message);
        throw error;
    }
},

/**
* Updates an existing match's data
*/
updateMatch: async (id, matchData) => {
    try {    
        const response = await axios.put(`${API_URL}/${id}`, matchData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error updating match ${id}:`, error);
        throw error;
    }
},

/**
* Deletes a match from the system
*/
deleteMatch: async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
      console.error(`Error deleting match ${id}:`, error);
      throw error;
    }
},

/**
* Submit the roster (starting and bench) for a specific team
*/
submitRoster: async (matchId, rosterData) => {
    const response = await axios.post(`${API_URL}/${matchId}/submit-roster`, rosterData, { headers: getAuthHeaders() });
    return response.data;
},

/**
* Start the match via LiveEventLauncher
*/
startMatch: async (id) => {
    const response = await axios.post(`${API_URL}/${id}/start-match`, {}, { headers: getAuthHeaders() });
    return response.data;
}

};

export default matchService;