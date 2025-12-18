import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("mydiary_token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auth
export const login = (data) => API.post("/auth/login", data);
export const signup = (data) => API.post("/auth/signup", data);

// Personal diary
export const getDiaryEntries = () => API.get("/diary");
export const getDiaryEntry = (id) => API.get(`/diary/${id}`);

// Reminders
export const getTodayReminder = () => API.get("/reminders/today");

export default API;
