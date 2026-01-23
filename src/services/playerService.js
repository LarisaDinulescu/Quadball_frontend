import api from "./api";

const playerService = {
  /**
   * Retrieves the list of all players
   */
  getAllPlayers: async () => {
    try {
      const response = await api.get("/players");
      return response.data;
    } catch (error) {
      console.error("Error fetching players:", error);
      throw error;
    }
  },

  /**
   * Retrieves a specific player by ID
   */
  getPlayerById: async (id) => {
    try {
      const response = await api.get(`/players/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching player ${id}:`, error);
      throw error;
    }
  },

  /**
   * Creates a new player
   * Only accessible by ROLE_ORGANIZATION_MANAGER
   */
  createPlayer: async (playerData) => {
    try {
      const response = await api.post("/players", playerData);
      return response.data;
    } catch (error) {
      console.error("Error creating player:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Updates an existing player's data
   */
  updatePlayer: async (id, playerData) => {
    try {
      const response = await api.put(`/players/${id}`, playerData);
      return response.data;
    } catch (error) {
      console.error(`Error updating player ${id}:`, error);
      throw error;
    }
  },

  /**
   * Deletes a player from the system
   */
  deletePlayer: async (id) => {
    try {
      await api.delete(`/players/${id}`);
    } catch (error) {
      console.error(`Error deleting player ${id}:`, error);
      throw error;
    }
  }
};

export default playerService;