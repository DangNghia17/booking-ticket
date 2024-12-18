package com.nghia.bookingevent.payload.response;

import com.nghia.bookingevent.models.EventCategory;
import com.nghia.bookingevent.models.ticket.Ticket;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class EventOrderViewResponse {
    private String id;
    private String name;
    private String startingDate;
    private String endingDate;
    private String background;
    private String status;
    private int ticketTotal;
    private int ticketRemaining;
    private Date createdDate;
    private Date updatedDate;
    private List<EventCategory> eventCategoryList ;
    private List<Ticket> organizationTickets;
}
