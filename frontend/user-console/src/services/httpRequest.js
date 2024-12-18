import axiosClient from "./axiosClient";

const httpRequest = async ({ url, method, data, params, ...rest }) => {
  try {
    const response = await axiosClient.request({
      url,
      method, 
      data,
      params,
      ...rest
    });
    return response;
  } catch (error) {
    console.error(`Request failed for ${url}:`, error);
    throw error;
  }
};

export default httpRequest;
