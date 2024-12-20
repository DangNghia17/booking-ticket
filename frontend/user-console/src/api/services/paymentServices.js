import httpRequest from "../../services/httpRequest";
import { PaymentAPI } from "../configs/payment";
import { useQuery } from "@tanstack/react-query";
const payOrder = async (data) => {
  try {
    console.log('Sending payment request:', data);
    const response = await httpRequest(PaymentAPI.payOrder(data));
    console.log('Payment response:', response);
    return response;
  } catch (error) {
    console.error('Payment error:', error);
    return error.response.data;
  }
};
const payOrderVNPay = async (data) => {
  try {
    const response = await httpRequest(PaymentAPI.payOrderVNPay(data));
    return response;
  } catch (error) {
    return error.response.data;
  }
};
const checkOrderAvailability = async (userId, body) => {
  try {
    const response = await httpRequest(
      PaymentAPI.checkOrderAvailability(userId, body)
    );
    return response;
  } catch (error) {
    return error.response.data;
  }
};
const paymentServices = { payOrder, checkOrderAvailability, payOrderVNPay };
export default paymentServices;
