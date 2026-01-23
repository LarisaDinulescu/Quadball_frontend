import api from './api';

const teamService = {
  getAllTeams: async () => {
    try {
      const response = await api.get('/teams');
      return response.data;
    } catch (error) {
      console.error("Error fetching teams:", error);
      throw error;
    }
  },

  createTeam: async (teamData) => {
    try {
      const response = await api.post('/teams', teamData);
      return response.data;
    } catch (error) {
      console.error("Error creating team:", error.response?.data || error.message);
      throw error;
    }
  },

  deleteTeam: async (id) => {
    try {
      await api.delete(`/teams/${id}`);
    } catch (error) {
      console.error(`Error deleting team ${id}:`, error);
      throw error;
    }
  }
};

export default teamService;