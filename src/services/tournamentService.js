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

  /**
   * Creates a new tournament
   * Only accessible by ROLE_ORGANIZATION_MANAGER
   */
  createTournament: async (tournamentData) => {
    try {
      const response = await api.post('/tournaments', tournamentData);
      return response.data;
    } catch (error) {
      console.error("Error during tournament creation:", error.response?.data || error.message);
      throw error;
    }
  },

    updateMatch: async (id, data) => {
    const response = await api.put(`/matches/${id}`, data);
    return response.data;
    },


  /**
   * Deletes a tournament
   */
  deleteTournament: async (id) => {
    try {
      const response = await api.delete(`/tournaments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting tournament ${id}:`, error);
      throw error;
    }
  }
};

export default tournamentService;