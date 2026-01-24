import api from './api';

const reservationService = {
  // Crea una nuova prenotazione
  createReservation: async (reservationData) => {
    const response = await api.post('/reservations', reservationData);
    return response.data;
  },
  // Recupera prenotazioni di un utente (opzionale per il futuro)
  getUserReservations: async (email) => {
    const response = await api.get(`/reservations/user/${email}`);
    return response.data;
  }
};

export default reservationService;