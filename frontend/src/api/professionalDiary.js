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
  // ➤ Get all entries
  getEntries: () => API.get("/entries"),

  // ➤ Get single entry
  getEntryById: (id) => API.get(`/entries/${id}`),

  // ➤ Create entry
  createEntry: (payload) => API.post("/entries", payload),

  // ➤ Update entry
  updateEntry: (id, payload) => API.put(`/entries/${id}`, payload),

  // ➤ Delete entry
  deleteEntry: (id) => API.delete(`/entries/${id}`),

  // ➤ Mood Logs
  getMoodLogs: () => API.get("/moods"),
  createMoodLog: (payload) => API.post("/moods", payload),

  // ➤ Calendar view
  getCalendarEntries: () => API.get("/calendar"),
};

export default ProAPI;
