import { useQuery } from "@tanstack/react-query";
import httpRequest from "../../services/httpRequest";
import { OrderAPI } from "../configs/order";

const createOrder = async (userId, body) => {
  try {
    
    const response = await httpRequest(OrderAPI.createOrder(userId, body));
    return response;
  } catch (error) {
    console.error('Create order error:', error);
    return error.response.data;
  }
};
const getOrderListByUserId = async (userId) => {
  try {
    const response = await httpRequest(OrderAPI.getOrderListByUserId(userId));
    return response?.data || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};
export const createOrderByFetchAPI = async (userId, data) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/customer/order/${userId}`,
      {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify(data),
      }
    );
    return response.json();
    return response;
  } catch (error) {
    return error.response.data;
  }
};
export const useGetOrderListByUserId = (id) => {
  return useQuery(
    ["getOrderListByUserId", id],
    () => getOrderListByUserId(id),
    {
      staleTime: 0,
      retry: 3,
      retryDelay: 1000,
      onError: (error) => {
        console.error('Error fetching orders:', error);
      },
      select: (data) => data || []
    }
  );
};
const orderServices = { createOrder, getOrderListByUserId };
export default orderServices;
