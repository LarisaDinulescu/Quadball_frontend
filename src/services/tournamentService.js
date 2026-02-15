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

    // --- GESTIONE MATCH NEL TORNEO ---

    getMatchesTournamentId: async (tournamentId) => {
        try {
            const response = await api.get(`/tournaments/${tournamentId}/matches`);
            return response.data;
        } catch (error) {
            console.error(`Error getting matches for tournament ${tournamentId}`, error);
            throw error;
        }
    },

    // 🌟 NUOVO METODO: Scarica il tabellone E incrocia i dati con Squadre e Punteggi!
    getEnrichedTournamentMatches: async (tournamentId) => {
        try {
            // 1. Prende la struttura del tabellone
            const bracketRes = await api.get(`/tournaments/${tournamentId}/matches`);
            const rawMatches = bracketRes.data || [];

            // 2. Prende tutti i match (per avere punteggi e ID squadre)
            const matchesRes = await api.get('/matches');
            const allMatches = matchesRes.data || [];

            // 3. Prende tutti i team (per avere i nomi veri)
            const teamsRes = await api.get('/teams');
            const allTeams = teamsRes.data || [];

            // Mappa veloce per i nomi delle squadre
            const teamsMap = {};
            allTeams.forEach(t => teamsMap[t.id] = t.name);

            // 4. Unisce tutto insieme
            return rawMatches.map(tournamentMatch => {
                const actualMatch = allMatches.find(m => m.id === tournamentMatch.matchId);
                if (actualMatch) {
                    return {
                        ...tournamentMatch, // Tiene round, bracketIndex, ecc.
                        homeTeamId: actualMatch.homeTeamId,
                        awayTeamId: actualMatch.awayTeamId,
                        homeTeamName: teamsMap[actualMatch.homeTeamId] || "TBA",
                        awayTeamName: teamsMap[actualMatch.awayTeamId] || "TBA",
                        homeScore: actualMatch.homeScore,
                        awayScore: actualMatch.awayScore,
                        date: actualMatch.date
                    };
                }
                return tournamentMatch; // Fallback se il match non viene trovato
            });
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