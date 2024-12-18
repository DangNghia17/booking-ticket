package com.nghia.bookingevent.payload.request;

import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class PaymentRequest {
    @NotNull(message = "Price is required")
    private String price;
    
    private String currency = "USD"; // Default for PayPal
    private String description;
    private String orderId;
} 