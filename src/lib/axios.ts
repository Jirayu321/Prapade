import axios from 'axios';
import appConfig from '../assets/app.json';

const axiosInstance = axios.create({
  baseURL: `${appConfig.apiUrl}`,
});

axiosInstance.interceptors.request.use(
  async config => {
    try {
      config.headers['Content-Type'] = 'application/json';
    } catch (error) {
      console.error('Error retrieving access token from AsyncStorage:', error);
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

export default axiosInstance;
