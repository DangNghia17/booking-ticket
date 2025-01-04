import httpRequest from "../../services/httpRequest";
import { PaymentAPI } from "../configs/payment";

const payOrder = async (data) => {
  try {
    // Log request details
    console.log('Payment request:', {
      url: PaymentAPI.payOrder(data).url,
      method: PaymentAPI.payOrder(data).method,
      data: data
    });

    const response = await httpRequest(PaymentAPI.payOrder(data));
    
    if (!response) {
      throw new Error('No response received from server');
    }

    return response;
  } catch (error) {
    console.error('Payment error details:', {
      message: error.message,
      status: error?.response?.status,
      data: error?.response?.data,
      headers: error?.response?.headers
    });

    // Return a structured error response
    return {
      success: false,
      message: error?.response?.data?.message || error.message || 'Payment failed',
      data: null,
      status: error?.response?.status || 500
    };
  }
};

const payOrderVNPay = async (data) => {
  try {
    // Log request details
    console.log('VNPay request:', {
      url: PaymentAPI.payOrderVNPay(data).url,
      method: PaymentAPI.payOrderVNPay(data).method,
      data: data
    });

    const response = await httpRequest(PaymentAPI.payOrderVNPay(data));
    
    if (!response) {
      throw new Error('No response received from server');
    }

    return response;
  } catch (error) {
    console.error('VNPay error details:', {
      message: error.message,
      status: error?.response?.status,
      data: error?.response?.data,
      headers: error?.response?.headers
    });

    return {
      success: false,
      message: error?.response?.data?.message || 'VNPay payment failed',
      data: null,
      status: error?.response?.status || 500
    };
  }
};

const checkOrderAvailability = async (userId, body) => {
  try {
    const response = await httpRequest(
      PaymentAPI.checkOrderAvailability(userId, body)
    );
    return response;
  } catch (error) {
    console.error('Order availability check error:', error);
    return {
      success: false,
      message: error?.response?.data?.message || 'Check availability failed',
      data: null,
      status: error?.response?.status || 500
    };
  }
};

const paymentServices = { payOrder, checkOrderAvailability, payOrderVNPay };
export default paymentServices;
