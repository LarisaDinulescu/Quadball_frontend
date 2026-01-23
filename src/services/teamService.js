import api from "./api"; // Usiamo l'istanza con l'interceptor che abbiamo creato

const teamService = {
  // Recupera tutti i team
  getAllTeams: async () => {
    const response = await api.get("/teams");
    return response.data;
  },

  // Crea un nuovo team con i suoi componenti
  createTeam: async (teamData) => {
    const response = await api.post("/teams", teamData);
    return response.data;
  },

  // Elimina un team
  deleteTeam: async (id) => {
    await api.delete(`/teams/${id}`);
  }
};

export default teamService;