import api from "./api";

const MATCH_API_URL = "/matches";

// http://localhost:8080/api/matches/{id}
const getMatchById = (id) => api.get(`${MATCH_API_URL}/${id}`);

const getAllMatches = () => api.get(MATCH_API_URL);

// export as an object
export default {
    getMatchById,
    getAllMatches
};