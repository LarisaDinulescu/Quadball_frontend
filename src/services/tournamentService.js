import api from './api';

const tournamentService = {
  /**
   * Retrieves the list of all tournaments
   */
  getAllTournaments: async () => {
    try {
      const response = await api.get('/tournaments');
      return response.data;
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      throw error;
    }
  },

  /**
   * Retrieves the tournament bracket (list of lists of matches)
   */
  getTournamentBracket: async (id) => {
    try {
      const response = await api.get(`/tournaments/${id}/bracket`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching bracket for tournament ${id}:`, error);
      throw error;
    }
  },

  createTournament: async (tournamentData) => {
    try {
      // Axios automatically transforms tournamentData into JSON
      const response = await api.post('/tournaments', tournamentData);
      return response.data;
    } catch (error) {
      // Intercept the error to provide clearer feedback
      console.error("Error during tournament creation:", error.response?.data || error.message);
      throw error;
    }
  }
};

export default tournamentService;