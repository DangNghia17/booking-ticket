package com.nghia.bookingevent.payload.response;

import com.nghia.bookingevent.models.EPaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentPendingResponse {
    private String name;
    private String USDBalanceLock;
    private String VNDBalanceLock;
    private EPaymentStatus status;
}
