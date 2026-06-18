import axios from 'axios';

/**
 * Configured axios instance.
 * - Dev:  VITE_API_URL is empty → falls back to '' → Vite proxy handles /api/*
 * - Prod: VITE_API_URL=https://tsop-software.onrender.com → direct requests to Render
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

export default api;
