import axios from 'axios';

const API_URL = 'http://localhost:8080/api/matches'; 
const matchService = {

/**
* Retrieves the list of all matches
*/
getAllMatches: async () => {
    try {
        const response = await axios.get(API_URL);
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
        const response = await axios.get(`${API_URL}/${id}`);
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
        const response = await axios.post(API_URL, matchData);
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
        const response = await axios.put(`${API_URL}/${id}`, matchData);
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
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
      console.error(`Error deleting match ${id}:`, error);
      throw error;
    }
},

/**
*  Submit the roster (starting and bench) for a specific team
*/
submitRoster: async (matchId, rosterData) => {
    // rosterData deve corrispondere a SubmitRosterRequest: { teamId, startingPlayerIds, benchPlayerIds }
    const response = await axios.post(`${API_URL}/${matchId}/submit-roster`, rosterData);
    return response.data;
},

/**
* Start the match via LiveEventLauncher
*/
    startMatch: async (id) => {
    const response = await axios.post(`${API_URL}/${id}/start-match`);
    return response.data;
}


};

export default matchService;