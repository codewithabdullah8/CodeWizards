import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/professional-diary",
});

// attach token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("mydiary_token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

const ProAPI = {
  // get all entries
  getEntries: () => API.get("/all"),

  // ✅ get single entry (MAIN)
  getOne: (id) => API.get(`/entry/${id}`),

  // (optional alias, safe to keep)
  getEntryById: (id) => API.get(`/entry/${id}`),

  // create
  createEntry: (payload) => API.post("/new", payload),

  // update
  updateEntry: (id, payload) => API.put(`/update/${id}`, payload),

  // delete
  deleteEntry: (id) => API.delete(`/delete/${id}`),

  // filter by date
  getByDate: (date) => API.get(`/date/${date}`),
};

export default ProAPI;
