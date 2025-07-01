import axios from 'axios';
import BASE_URL from '../../config';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, 
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(config => {
  return config;
}, error => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    //console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default apiClient;
