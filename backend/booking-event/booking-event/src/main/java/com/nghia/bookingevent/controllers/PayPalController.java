package com.nghia.bookingevent.controllers;

import com.nghia.bookingevent.Implement.IPaymentService;
import com.nghia.bookingevent.payload.request.PriceRes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;

//@AllArgsConstructor
@RestController
@RequestMapping(path = "/api/payment")
public class PayPalController {
    @Autowired
    @Qualifier("PayPalService")
    private IPaymentService iPaymentService;

    @PostMapping("/payOrder")
    public ResponseEntity<?> payment(@Valid @RequestBody PriceRes priceRes, HttpServletRequest request) {
        return iPaymentService.createPayment(priceRes,request);

    }
    @GetMapping(value = "/pay/cancel")
    public ResponseEntity<?> cancelPay(HttpServletRequest request, HttpServletResponse response) {
        return iPaymentService.cancelPayPalPayment(request,response);
    }

    @GetMapping(value = "/pay/success")
    public ResponseEntity<?> successPay(@RequestParam("paymentId") String paymentId,
                                        @RequestParam("PayerID") String payerId,
                                        HttpServletRequest request,
                             HttpServletResponse response) {
        return iPaymentService.executePayPalPayment(paymentId,payerId,request,response);

    }

}