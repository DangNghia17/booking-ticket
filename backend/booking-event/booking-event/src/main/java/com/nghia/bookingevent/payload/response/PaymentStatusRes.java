package com.nghia.bookingevent.payload.response;

import com.nghia.bookingevent.models.organization.PaymentPending;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentStatusRes {
    private String email;

    private List<PaymentPending> paymentPendings= new ArrayList<>();

}
