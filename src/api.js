// src/api.js
import axios from 'axios';

const API = axios.create({ baseURL: '/api' }); // Vite proxy sends to http://localhost:4000

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) localStorage.removeItem('token');
    return Promise.reject(err);
  }
);

export default API;

// === Recipes API ===
export async function fetchRecipes() {
  const { data } = await API.get('/recipes');
  return data;
}
export async function fetchMyRecipes() {
  const { data } = await API.get('/recipes/mine');
  return data;
}
export async function fetchRecipeById(id) {
  const { data } = await API.get(`/recipes/${id}`);
  return data;
}
export async function createRecipe(payload) {
  const { data } = await API.post('/recipes', payload);
  return data;
}
export async function updateRecipe(id, payload) {
  const { data } = await API.put(`/recipes/${id}`, payload);
  return data;
}
export async function deleteRecipe(id) {
  const { data } = await API.delete(`/recipes/${id}`);
  return data;
}
