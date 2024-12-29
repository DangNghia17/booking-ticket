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
    // Đảm bảo luôn trả về một đối tượng lỗi có cấu trúc
    const errorResponse = {
      status: 'error',
      message: 'Có lỗi xảy ra',
      data: null
    };

    if (error.response) {
      // Nếu server trả về response
      errorResponse.status = error.response.status;
      errorResponse.message = error.response.data?.message || 'Lỗi từ server';
      errorResponse.data = error.response.data;
    } else if (error.request) {
      // Nếu request được gửi nhưng không nhận được response
      errorResponse.message = 'Không thể kết nối đến server';
    } else {
      // Lỗi khi thiết lập request
      errorResponse.message = error.message;
    }

    return Promise.reject(errorResponse);
  }
);

export default axiosClient;
