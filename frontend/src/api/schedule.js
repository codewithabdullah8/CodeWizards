import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/schedule",
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
        console.warn('ScheduleAPI: token expired — clearing local session and redirecting to login');
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

const ScheduleAPI = {
  // ➤ Get all schedule items for logged-in user
  getItems: () => API.get("/all"),

  // ➤ Get single item
  getItemById: (id) => API.get(`/item/${id}`),

  // ➤ Create item
  createItem: (payload) => API.post("/new", payload),

  // ➤ Update item
  updateItem: (id, payload) => API.put(`/update/${id}`, payload),

  // ➤ Delete item
  deleteItem: (id) => API.delete(`/delete/${id}`),

  // ➤ Get items by date
  getByDate: (date) => API.get(`/date/${date}`),

  // ➤ Toggle completed
  toggleComplete: (id) => API.patch(`/complete/${id}`),
};

export default ScheduleAPI;