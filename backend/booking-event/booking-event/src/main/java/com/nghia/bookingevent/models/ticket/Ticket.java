package com.nghia.bookingevent.models.ticket;

import com.nghia.bookingevent.payload.request.CustomerTicketReq;
import com.nghia.bookingevent.payload.request.OrganizationTicketReq;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

import org.springframework.data.mongodb.core.mapping.Field;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Ticket {
    @Field("id")
    private String id;
    @NotBlank(message = "ticketName is required")
    private String ticketName;
    @Size(min=1,message="required")
    @NotBlank(message = "price is required")
    private String price;
    private String description;
    @Size(min=1,message="required")
    @NotBlank(message = "quantity is required")
    private int quantity;
    private int quantityRemaining;
    @NotBlank(message = "currency is required")
    private String currency;

    @NotBlank(message = "status is required")
    public String status;
    public Ticket(OrganizationTicketReq organizationTicketReq)
    {
        this.ticketName= organizationTicketReq.getTicketName();
        this.price= organizationTicketReq.getPrice();
        this.description= organizationTicketReq.getDescription();
        this.quantity= organizationTicketReq.getQuantity();
        //this.quantityRemaining = organizationTicketReq.getQuantityRemaining();
        this.currency= organizationTicketReq.getCurrency();
        this.status = TicketStatus.AVAILABLE;
    }
    public Ticket(CustomerTicketReq customerTicketReq)
    {
        this.id = customerTicketReq.getId();
        this.ticketName= customerTicketReq.getTicketName();
        this.price= customerTicketReq.getPrice();
        //this.description= customerTicketReq.getDescription();
        this.quantity= customerTicketReq.getQuantity();
        //this.quantityRemaining = customerTicketReq.getQuantityRemaining();
        this.currency= customerTicketReq.getCurrency();
        this.status = TicketStatus.AVAILABLE;
    }
}
