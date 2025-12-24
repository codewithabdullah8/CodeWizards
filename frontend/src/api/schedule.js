import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/schedule",
});

// attach token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("mydiary_token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});   

const ScheduleAPI = {
  getItems: () => API.get("/all"),
  createItem: (payload) => API.post("/new", payload),
  deleteItem: (id) => API.delete(`/delete/${id}`),
  toggleComplete: (id) => API.patch(`/complete/${id}`),
};

export default ScheduleAPI;
