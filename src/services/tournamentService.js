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

    getTournamentById: async (id) => {
        try {
            const response = await api.get(`/tournaments/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching tournament ${id}:`, error);
            throw error;
        }
    },

  /**
   * Retrieves the tournament bracket (list of lists of matches)
   */
  /*getTournamentBracket: async (id) => {
    try {
      const response = await api.get(`/tournaments/${id}/bracket`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching bracket for tournament ${id}:`, error);
      throw error;
    }
  },*/

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

    updateTournament: async (id, tournamentData) => {
        try {
            const response = await api.put(`/tournaments/${id}`, tournamentData);
            return response.data;
        } catch (error) {
            console.error(`Error updating tournament: ${id}`, error);
            throw error;
        }
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
  },

// GET /tournaments/{id}/teams (Ritorna la lista degli ID dei team)
    getTeamsTorunamentId: async (tournamentId) => {
        try {
            const response = await api.get(`/tournaments/${tournamentId}/teams`);
            return response.data;
        } catch (error) {
            console.error(`Error getting teams of tournament`, error);
            throw error;
        }
    },

    // POST /tournaments/{tournamentId}/teams/{teamId}
    addTeam: async (tournamentId, teamId) => {
        try {
            const response = await api.post(`/tournaments/${tournamentId}/teams/${teamId}`);
            return response.data;
        }catch (error) {
            console.error(`Error adding team to tournament`, error);
            throw error;
        }
    },

    // DELETE /tournaments/{tournamentId}/teams/{teamId}
    deleteTeamFromTournament: async (tournamentId, teamId) => {
        try{
            await api.delete(`/tournaments/${tournamentId}/teams/${teamId}`);
        }catch (error) {
            console.error(`Error removing team from tournament`, error);
            throw error;
        }
    },

    /**
     * Triggers the bracket generation for a tournament
     */
    generateBracket: async (id) => {
        try {
            const response = await api.post(`/tournaments/${id}/generate-bracket`);
            return response.data;
        } catch (error) {
            console.error(`Error generating bracket for tournament ${id}:`, error);
            throw error;
        }
    },

    // --- GESTIONE MATCH NEL TORNEO ---

    // GET /tournaments/{id}/matches
    getMatchesTournamentId: async (tournamentId) => {
        try {
            const response = await api.get(`/tournaments/${tournamentId}/matches`);
            return response.data; 
        } catch (error) {
            console.error(`Error getting matches for tournament ${tournamentId}`, error);
            throw error;
        }
    },

    generateBracket: async (id) => {
        const response = await api.post(`/tournaments/${id}/generate-bracket`);
        return response.data;
    },

    // Recupera i dettagli tecnici di un match (punteggi, squadre, ecc)
    getMatchById: async (matchId) => {
        const response = await api.get(`/matches/${matchId}`);
        return response.data;
    },

    // UPDATE del Match (per il tuo MatchEditor)
    updateMatch: async (id, data) => {
        const response = await api.put(`/matches/${id}`, data);
        return response.data;
    },

    /**
     * Updates match results and triggers winner promotion in the tournament bracket
     */
    updateMatchResults: async (matchId, matchData) => {
        try {
            const response = await api.put(`/tournaments/matches/${matchId}/results`, matchData);
            return response.data;
        } catch (error) {
            console.error(`Error updating results for match ${matchId}:`, error);
            throw error;
        }
    },

    // DELETE /tournaments/{tournamentId}/matches/{matchId}
    deleteMatchFromTournament: async (tournamentId, matchId) => {
        try{
            await api.delete(`/tournaments/${tournamentId}/matches/${matchId}`);
        }catch (error) {
            console.error(`Error deleting match from tournament`, error);
            throw error;
        }
    }
};

export default tournamentService;