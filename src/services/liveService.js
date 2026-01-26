import api from "./api";

const MATCH_API_URL = "/matches";

// http://localhost:8080/api/matches/{id}
const liveService = {
    // Fetches live matches
    getLiveMatches: async () => {
        try {
            const response = await api.get('/matches/live');
            return response.data;
        } catch (error) {
            console.error("Error fetching live matches:", error);
            throw error;
        }
    },

    // Fetches a specific match details
    getMatchById: async (id) => {
        try {
            const response = await api.get(`/matches/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching match ${id}:`, error);
            throw error;
        }
    }
};

export default liveService;