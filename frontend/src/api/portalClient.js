import axios from 'axios';

const portalApi = axios.create({ baseURL: '/api/portal' });

portalApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('portalToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default portalApi;
