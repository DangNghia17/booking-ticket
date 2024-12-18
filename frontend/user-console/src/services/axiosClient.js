import axios from "axios";
import { store } from "../redux/store";

const axiosClient = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
});

// Add a request interceptor
axiosClient.interceptors.request.use(
  function (config) {
    const token = store.getState().account.token;
    
    config.headers = {
      ...config.headers,
      "Content-Type": config.headers["Content-Type"] || "application/json",
      Authorization: token ? `Bearer ${token}` : undefined
    };

    // console.log('Request details:', {
    //   url: config.url,
    //   method: config.method,
    //   params: config.params,
    //   baseURL: config.baseURL,
    //   fullUrl: `${config.baseURL}${config.url}`,
    //   headers: config.headers
    // });

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosClient.interceptors.response.use(
  function (response) {
    return response.data;
  },
  function (error) {
    console.error('API Error:', {
      url: error.config?.url, 
      baseURL: error.config?.baseURL,
      fullUrl: `${error.config?.baseURL}${error.config?.url}`,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default axiosClient;
