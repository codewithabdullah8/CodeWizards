import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/quotes",
});

// attach token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("mydiary_token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

const QuoteAPI = {
  getToday: (refresh = false) => API.get("/today", {
    params: refresh ? { refresh: true, t: Date.now() } : {},
  }),
};

export default QuoteAPI;
