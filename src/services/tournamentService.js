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
    getTournamentTeams: async (tournamentId) => {
        try {
            const response = await api.get(`/tournaments/${tournamentId}/teams`);
            return response.data;
        } catch (error) {
            console.error(`Error getting teams of tournament`, error);
            throw error;
        }
    },

    // POST /tournaments/{tournamentId}/teams/{teamId}
    addTeamToTournament: async (tournamentId, teamId) => {
        try {
            const response = await api.post(`/tournaments/${tournamentId}/teams/${teamId}`);
            return response.data;
        }catch (error) {
            console.error(`Error adding team to tournament`, error);
            throw error;
        }
    },

    // DELETE /tournaments/{tournamentId}/teams/{teamId}
    removeTeamFromTournament: async (tournamentId, teamId) => {
        try{
            await api.delete(`/tournaments/${tournamentId}/teams/${teamId}`);
        }catch (error) {
            console.error(`Error removing team from tournament`, error);
            throw error;
        }
    },

    // --- GESTIONE MATCH NEL TORNEO ---

    // GET /tournaments/{id}/matches
    getTournamentMatches: async (tournamentId) => {
        try{
            const response = await api.get(`/tournaments/${tournamentId}/matches`);
            return response.data;
        }catch (error) {
            console.error(`Error getting tournament matches`, error);
            throw error;
        }
    },

    // Recupera i dettagli tecnici di un match (punteggi, squadre, ecc)
    getMatchDetails: async (matchId) => {
        const response = await api.get(`/matches/${matchId}`);
        return response.data;
    },

    // UPDATE del Match (per il tuo MatchEditor)
    updateMatch: async (id, data) => {
        const response = await api.put(`/matches/${id}`, data);
        return response.data;
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