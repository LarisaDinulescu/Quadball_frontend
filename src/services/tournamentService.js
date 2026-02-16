import api from './api';

const tournamentService = {
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

    deleteTournament: async (id) => {
        try {
            const response = await api.delete(`/tournaments/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting tournament ${id}:`, error);
            throw error;
        }
    },

    getTeamsTorunamentId: async (tournamentId) => {
        try {
            const response = await api.get(`/tournaments/${tournamentId}/teams`);
            return response.data;
        } catch (error) {
            console.error(`Error getting teams of tournament`, error);
            throw error;
        }
    },

    addTeam: async (tournamentId, teamId) => {
        try {
            const response = await api.post(`/tournaments/${tournamentId}/teams/${teamId}`);
            return response.data;
        } catch (error) {
            console.error(`Error adding team to tournament`, error);
            throw error;
        }
    },

    deleteTeamFromTournament: async (tournamentId, teamId) => {
        try{
            await api.delete(`/tournaments/${tournamentId}/teams/${teamId}`);
        } catch (error) {
            console.error(`Error removing team from tournament`, error);
            throw error;
        }
    },

    generateBracket: async (id) => {
        try {
            const response = await api.post(`/tournaments/${id}/generate-bracket`);
            return response.data;
        } catch (error) {
            console.error(`Error generating bracket for tournament ${id}:`, error);
            throw error;
        }
    },

    // --- TOURNAMENT MATCH MANAGEMENT ---

    getMatchesTournamentId: async (tournamentId) => {
        try {
            const response = await api.get(`/tournament-management/${tournamentId}`);
            return response.data;
        } catch (error) {
            console.error(`Error getting matches for tournament ${tournamentId}`, error);
            throw error;
        }
    },

    // NEW METHOD: Handles the list of lists from /tournament-management/{id}
    getEnrichedTournamentMatches: async (tournamentId) => {
        try {
            // 1. Get the list of lists (Rounds)
            const bracketRes = await api.get(`/tournament-management/${tournamentId}`);
            const rounds = bracketRes.data || [];

            // 2. Get all teams to map IDs to Names
            const teamsRes = await api.get('/teams');
            const allTeams = teamsRes.data || [];
            const teamsMap = {};
            allTeams.forEach(t => teamsMap[t.id] = t.name);

            // 3. Flatten the rounds and enrich each match
            // We use the outer array index to set the "round" property for the frontend
            const enrichedMatches = rounds.flatMap((roundMatches, index) => {
                return roundMatches.map(match => ({
                    ...match,
                    round: index + 1, // Convert index 0 to Round 1, index 1 to Round 2, etc.
                    homeTeamName: teamsMap[match.homeTeamId] || (match.homeTeamId ? `Team ${match.homeTeamId}` : "TBA"),
                    awayTeamName: teamsMap[match.awayTeamId] || (match.awayTeamId ? `Team ${match.awayTeamId}` : "TBA"),
                    homeScore: match.homeScore,
                    awayScore: match.awayScore
                }));
            });

            return enrichedMatches;
        } catch (error) {
            console.error(`Error getting enriched matches for tournament ${tournamentId}`, error);
            throw error;
        }
    },

    getMatchById: async (matchId) => {
        const response = await api.get(`/matches/${matchId}`);
        return response.data;
    },

    updateMatch: async (id, data) => {
        const response = await api.put(`/matches/${id}`, data);
        return response.data;
    },

    updateMatchResults: async (matchId, matchData) => {
        try {
            const response = await api.put(`/tournaments/matches/${matchId}/results`, matchData);
            return response.data;
        } catch (error) {
            console.error(`Error updating results for match ${matchId}:`, error);
            throw error;
        }
    },

    deleteMatchFromTournament: async (tournamentId, matchId) => {
        try{
            await api.delete(`/tournaments/${tournamentId}/matches/${matchId}`);
        } catch (error) {
            console.error(`Error deleting match from tournament`, error);
            throw error;
        }
    }
};

export default tournamentService;