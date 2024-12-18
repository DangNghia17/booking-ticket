package com.nghia.bookingevent.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CustomerListRes {
    @Id
    private String id;
    private String idEvent;
    private String email;
    private BigDecimal USDRevenue;
    private BigDecimal VNDRevenue;
    private int totalTicket;
    private String currency;
}
