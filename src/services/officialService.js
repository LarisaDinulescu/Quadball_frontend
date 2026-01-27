import api from "./api";

const officialService = {
  getAllOfficials: async () => {
    try {
      const response = await api.get("/officials");
      return response.data;
    } catch (error) {
      console.error("Error fetching officials:", error);
      throw error;
    }
  },

  getOfficialById: async (id) => {
    try {
      const response = await api.get(`/officials/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching official ${id}:`, error);
      throw error;
    }
  },

    // POST /officials
  createOfficial: async (officialData) => {
    try {
      const response = await api.post("/officials", officialData);
      return response.data;
    } catch (error) {
      console.error("Error creating official:", error.response?.data || error.message);
      throw error;
    }
  },

    // POST /officials/{id} (Update)
  updateOfficial: async (id, officialData) => {
    try {
      const payload = { ...officialData, id: id };
      const response = await api.post(`/officials/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error(`Error updating official ${id}:`, error);
      throw error;
    }
  },

    // DELETE /officials/{id}
  deleteOfficialById: async (id) => {
    try {
      await api.delete(`/officials/${id}`);
    } catch (error) {
      console.error(`Error deleting official ${id}:`, error);
      throw error;
    }
  }
};

export default officialService;