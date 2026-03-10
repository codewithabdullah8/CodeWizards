import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('mydiary_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const SettingsAPI = {
  // Get user settings
  getSettings: () => API.get('/settings'),
  
  // Update user settings
  updateSettings: (settings) => API.put('/settings', settings)
};

export default SettingsAPI;
