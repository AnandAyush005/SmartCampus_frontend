// Axios configuration for cookie handling
import axios from 'axios';

// Configure axios defaults to always send credentials (cookies)
axios.defaults.withCredentials = true;

// Create axios instance with default config
const apiClient = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
