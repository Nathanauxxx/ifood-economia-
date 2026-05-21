import axios from 'axios';

const api = axios.create({
  // Atualizado para a porta correta que o dotnet rodou
  baseURL: 'http://localhost:5279/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@ifood-economia:token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export default api;
