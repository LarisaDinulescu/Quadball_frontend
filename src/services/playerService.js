import api from "./api"; 

const PLAYER_API_URL = "/players";

const getAllPlayers = () => api.get(PLAYER_API_URL);
const createPlayer = (playerData) => api.post(PLAYER_API_URL, playerData);
const getPlayerById = (id) => api.get(`${PLAYER_API_URL}/${id}`);
const updatePlayer = (id, playerData) => api.put(`${PLAYER_API_URL}/${id}`, playerData);
const deletePlayer = (id) => api.delete(`${PLAYER_API_URL}/${id}`);

export default {
    getAllPlayers,
    createPlayer,
    getPlayerById,
    updatePlayer,
    deletePlayer 
};