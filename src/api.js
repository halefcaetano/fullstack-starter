// src/api.js
import axios from 'axios';

const baseURL = import.meta?.env?.VITE_API_BASE || '/api';
const API = axios.create({ baseURL });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;

// Helpers
export function getSessionId() {
  let id = localStorage.getItem('sessionId');
  if (!id) {
    id =
      (typeof crypto !== 'undefined' && crypto?.randomUUID?.()) ||
      String(Math.random()).slice(2);
    localStorage.setItem('sessionId', id);
  }
  return id;
}

export async function logPostView(postId) {
  const sessionId = getSessionId();
  // fire-and-forget; ignore errors so UI never breaks on analytics
  return API.post('/events/view', { postId, sessionId }).catch(() => {});
}

export async function fetchDailyViews(postId, days = 14) {
  const { data } = await API.get(`/analytics/posts/${postId}/views/daily`, {
    params: { days },
  });
  return data.data; // array of { date, count }
}
