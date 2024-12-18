package com.nghia.bookingevent.Implement;

import com.nghia.bookingevent.payload.request.PriceRes;
import org.springframework.http.ResponseEntity;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public interface IPaymentService {
   // ResponseEntity<?> createPayment(HttpServletRequest request, Order order);
   ResponseEntity<?> createPayment(PriceRes priceRes, HttpServletRequest request) ;
   ResponseEntity<?> executePayPalPayment(String paymentId, String payerId, HttpServletRequest request, HttpServletResponse response);
   ResponseEntity<?> cancelPayPalPayment(HttpServletRequest request, HttpServletResponse response);

}
