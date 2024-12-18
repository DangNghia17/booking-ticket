package com.nghia.bookingevent.models.organization;

import com.nghia.bookingevent.models.EPaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentPending {
    private String idEvent;
    private String USDBalanceLock;
    private String VNDBalanceLock;
    private EPaymentStatus status;
}
