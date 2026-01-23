import api from './api';

const stadiumService = {
  /**
   * Retrieves the list of all available stadiums
   */
  getAllStadiums: async () => {
    try {
      const response = await api.get('/stadiums');
      return response.data;
    } catch (error) {
      console.error("Error fetching stadiums list:", error);
      throw error;
    }
  },

  /**
   * Retrieves details for a specific stadium (including past and future matches)
   */
  getStadiumDetails: async (id) => {
    try {
      const response = await api.get(`/stadiums/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching details for stadium ${id}:`, error);
      throw error;
    }
  },

  /**
   * Creates a new stadium
   * Only accessible by ROLE_ORGANIZATION_MANAGER
   * @param {Object} stadiumData - { name, address, capacity, etc. }
   */
  createStadium: async (stadiumData) => {
    try {
      const response = await api.post('/stadiums', stadiumData);
      return response.data;
    } catch (error) {
      console.error("Error creating new stadium:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Deletes a stadium
   */
  deleteStadium: async (id) => {
    try {
      await api.delete(`/stadiums/${id}`);
    } catch (error) {
      console.error(`Error deleting stadium ${id}:`, error);
      throw error;
    }
  }
};

export default stadiumService;