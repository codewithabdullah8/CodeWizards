// src/api/auth.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/auth",
});

// login
export const login = (payload) => API.post("/login", payload);

// signup
export const signup = (payload) => API.post("/signup", payload);

export default {
  login,
  signup,
};
