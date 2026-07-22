import axios from 'axios';
import { API_BASE } from '../lib/apiConfig';

const portalApi = axios.create({ baseURL: `${API_BASE}/portal` });

portalApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('portalToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default portalApi;
