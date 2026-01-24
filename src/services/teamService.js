import api from "./api";

const teamService = {
  /**
   * Retrieves all teams from the database
   */
  getAllTeams: async () => {
    try {
      const response = await api.get("/teams");
      return response.data;
    } catch (error) {
      console.error("Error fetching teams:", error);
      throw error;
    }
  },

  /**
   * Retrieves a single team by ID (necessary for Editing or Details view)
   */
  getTeamById: async (id) => {
    try {
      const response = await api.get(`/teams/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching team ${id}:`, error);
      throw error;
    }
  },

  /**
   * Creates a new team
   */
  createTeam: async (teamData) => {
    try {
      const response = await api.post("/teams", teamData);
      return response.data;
    } catch (error) {
      console.error("Error creating team:", error);
      throw error;
    }
  },

  /**
   * Updates an existing team (required for Manager role)
   */
  updateTeam: async (id, teamData) => {
    try {
      const response = await api.put(`/teams/${id}`, teamData);
      return response.data;
    } catch (error) {
      console.error(`Error updating team ${id}:`, error);
      throw error;
    }
  },

  /**
   * Deletes a team
   */
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