import api from './api';

const reservationService = {
  /**
   * Retrieves all reservations from the database
   * Used only by ROLE_ORGANIZATION_MANAGER
   */
  getAllReservations: async () => {
    try {
      const response = await api.get('/reservations');
      return response.data;
    } catch (error) {
      console.error("Error fetching all reservations:", error);
      throw error;
    }
  },

  /**
   * Retrieves reservations for a specific user by id
   * Used for the Spectator's profile page
   */
    getReservationByUserId: async (userId) => {
        try {
            const response = await api.get(`/reservations/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching reservations for user ID ${userId}:`, error);
            throw error;
        }
    },

  getReservationById: async (Id) => { // <--- Cambia parametro in userId
      try {
          const response = await api.get(`/reservations/${Id}`);
          return response.data;
      } catch (error) {
          console.error(`Error fetching reservation ID ${Id}:`, error);
          throw error;
      }
  },



  /**
   * Creates a new reservation
   */
  createReservation: async (reservationData) => {
    try {
      const response = await api.post('/reservations', reservationData);
      return response.data;
    } catch (error) {
      console.error("Error creating reservation:", error);
      throw error;
    }
  },

  /**
   * Updates an existing reservation
   * Useful for managers to change seat counts or match details
   */
  updateReservation: async (id, reservationData) => {
    try {
      const response = await api.put(`/reservations/${id}`, reservationData);
      return response.data;
    } catch (error) {
      console.error(`Error updating reservation ${id}:`, error);
      throw error;
    }
  },

  /**
   * Deletes a reservation
   */
  deleteReservation: async (id) => {
    try {
      await api.delete(`/reservations/${id}`);
    } catch (error) {
      console.error(`Error deleting reservation ${id}:`, error);
      throw error;
    }
  }
};

export default reservationService;