package com.nghia.bookingevent.Implement;

import com.nghia.bookingevent.payload.request.OrganizationTicketReq;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface ITicketService {
//    ResponseEntity<?> findAll();
    ResponseEntity<?> createTicket(String email, OrganizationTicketReq organizationTicketReq, String eventId);
    ResponseEntity<?> createMultipleTickets(String email, List<OrganizationTicketReq> organizationTicketReq, String eventId);
    ResponseEntity<?> getLastFourWeeksTicketStatistics(String email);
    ResponseEntity<?> getDailyTicketStatistics(String email);
    ResponseEntity<?> getMonthlyTicketStatistics(String email);
    ResponseEntity<?> getTicketsLast5Years(String email);
}
