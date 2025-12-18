import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/personal",
});

// Add token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("mydiary_token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Response interceptor: handle expired tokens globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      const resp = error.response;
      if (resp && resp.status === 401 && resp.data && resp.data.tokenExpired) {
        console.warn('PersonalAPI: token expired — clearing local session and redirecting to login');
        localStorage.removeItem('mydiary_token');
        localStorage.removeItem('mydiary_user');
        try { alert('Session expired — please log in again.'); } catch (e) {}
        window.location.href = '/login';
      }
    } catch (e) {
      // ignore interceptor errors
    }
    return Promise.reject(error);
  }
);

const PersonalAPI = {
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

export default PersonalAPI;