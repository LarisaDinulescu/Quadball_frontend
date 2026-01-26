import api from "./api";

const officialService = {
  getAllOfficials: async () => {
    try {
      const response = await api.get("/api/officials");
      return response.data;
    } catch (error) {
      console.error("Error fetching officials:", error);
      throw error;
    }
  },

  getOfficialById: async (id) => {
    try {
      const response = await api.get(`/api/officials/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching official ${id}:`, error);
      throw error;
    }
  },

  createOfficial: async (officialData) => {
    try {
      const response = await api.post("/api/officials", officialData);
      return response.data;
    } catch (error) {
      console.error("Error creating official:", error.response?.data || error.message);
      throw error;
    }
  },

  updateOfficial: async (id, officialData) => {
    try {
      const response = await api.post(`/api/officials/${id}`, officialData);
      return response.data;
    } catch (error) {
      console.error(`Error updating official ${id}:`, error);
      throw error;
    }
  },

  deleteOfficialById: async (id) => {
    try {
      await api.delete(`/api/officials/${id}`);
    } catch (error) {
      console.error(`Error deleting official ${id}:`, error);
      throw error;
    }
  }
};

export default officialService;