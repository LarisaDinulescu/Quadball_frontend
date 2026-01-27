import api from './api';

// Adjusted to match your backend's path: /api/tournament-management
const TOURNAMENT_MGMT_URL = '/tournament-management';
const TOURNAMENTS_URL = '/tournaments';

const tournamentService = {
  /**
   * Retrieves the list of all tournaments
   */
  getAllTournaments: async () => {
    try {
      const response = await api.get(TOURNAMENTS_URL);
      return response.data;
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      throw error;
    }
  },

  /**
   * Assigns teams and dates to a tournament (Setup)
   * Backend returns the list of lists of matches (the bracket)
   * @param {Long} tournamentId
   * @param {Object} data - { teamIds: [Long], startDate: Date, endDate: Date }
   */
  setupTournament: async (tournamentId, data) => {
    try {
      const response = await api.post(`${TOURNAMENT_MGMT_URL}/${tournamentId}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error setting up tournament ${tournamentId}:`, error);
      throw error;
    }
  },

  /**
   * Retrieves the tournament bracket (list of lists of matches)
   * Matches include: {id, tournamentId, homeTeamId, awayTeamId, homeScore, awayScore, snitchCaughtByTeamId, etc.}
   */
  getTournamentBracket: async (id) => {
    try {
      const response = await api.get(`${TOURNAMENT_MGMT_URL}/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching bracket for tournament ${id}:`, error);
      throw error;
    }
  },

  /**
   * Creates a new tournament base record
   * Only accessible by ROLE_ORGANIZATION_MANAGER
   */
  createTournament: async (tournamentData) => {
    try {
      const response = await api.post(TOURNAMENTS_URL, tournamentData);
      return response.data;
    } catch (error) {
      console.error("Error during tournament creation:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Updates match details (scores, snitch capture, status)
   */
  updateMatch: async (matchId, data) => {
    try {
      const response = await api.put(`/matches/${matchId}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating match ${matchId}:`, error);
      throw error;
    }
  },

  /**
   * Deletes a tournament record
   */
  deleteTournament: async (id) => {
    try {
      const response = await api.delete(`${TOURNAMENTS_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting tournament ${id}:`, error);
      throw error;
    }
  }
};

export default tournamentService;