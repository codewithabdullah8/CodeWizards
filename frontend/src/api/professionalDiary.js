import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/professional", // backend route prefix
});

// Add token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("mydiary_token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

const ProAPI = {
  // ➤ Get all entries for logged-in user
  getEntries: () => API.get("/all"),

  // ➤ Get single entry
  getEntryById: (id) => API.get(`/entry/${id}`),

  // ➤ Create entry
  createEntry: (payload) => API.post("/new", payload),

  // ➤ Update entry
  updateEntry: (id, payload) => API.put(`/update/${id}`, payload),

  // ➤ Delete entry
  deleteEntry: (id) => API.delete(`/delete/${id}`),

  // ➤ Get entries by date
  getByDate: (date) => API.get(`/date/${date}`),
};

export default ProAPI;
