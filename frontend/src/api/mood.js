import API from "../api";

export const saveMood = (data) => API.post("/mood", data);
export const getMonthlyMoods = (month, year) =>
  API.get(`/mood/month?month=${month}&year=${year}`);
export const getHistoricalAnalysis = (limit = 12) =>
  API.get(`/mood/analysis/history?limit=${limit}`);