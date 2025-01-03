package com.nghia.bookingevent.controllers;

import com.nghia.bookingevent.exception.AppException;
import com.nghia.bookingevent.models.account.Account;
import com.nghia.bookingevent.payload.request.OrganizationTicketReq;
import com.nghia.bookingevent.security.jwt.JwtTokenProvider;
import com.nghia.bookingevent.services.TicketService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping(path = "/api")
public class TicketController {
    private final TicketService ticketService;
    private final JwtTokenProvider jwtUtils;

    @PostMapping("/organization/ticket/{userId}/{eventId}")
    public ResponseEntity<?> createSingleTicket(@PathVariable String userId, @PathVariable String eventId, @RequestBody OrganizationTicketReq organizationTicketReq, HttpServletRequest request)
    {

        Account account = jwtUtils.getGmailFromJWT(jwtUtils.getJwtFromHeader(request));
        if(account.getId().equals(userId)) {
            return ticketService.createTicket(account.getEmail(), organizationTicketReq,eventId);
        }
        throw new AppException(HttpStatus.FORBIDDEN.value(), "You don't have permission! Token is invalid");

    }
    @PostMapping("/organization/ticket/list/{userId}")
    public ResponseEntity<?> createMultipleTicket(@PathVariable String userId, @PathVariable String eventId, @RequestBody List<OrganizationTicketReq> organizationTicketReq, HttpServletRequest request)
    {

        Account account = jwtUtils.getGmailFromJWT(jwtUtils.getJwtFromHeader(request));
        if(account.getId().equals(userId)) {
            return ticketService.createMultipleTickets(account.getEmail(), organizationTicketReq,eventId );
        }
        throw new AppException(HttpStatus.FORBIDDEN.value(), "You don't have permission! Token is invalid");

    }
    @GetMapping("/organization/{email}/ticket-statistics/last-four-weeks")
    public ResponseEntity<?> getLastFourWeeksTicketStatistics(@PathVariable String email) {
        return ticketService.getLastFourWeeksTicketStatistics(email);
    }
    @GetMapping("/organization/{email}/ticket-statistics/last-seven-days")
    public ResponseEntity<?> getDailyTicketStatistics(@PathVariable String email) {
        return ticketService.getDailyTicketStatistics(email);
    }
    @GetMapping("/organization/{email}/ticket-statistics/monthly")
    public ResponseEntity<?> getMonthlyTicketStatistics(@PathVariable String email) {
        return ticketService.getMonthlyTicketStatistics(email);
    }
    @GetMapping("/organization/{email}/ticket-statistics/last-five-years")
    public ResponseEntity<?> getTicketsLast5Years(@PathVariable String email) {
        return ticketService.getTicketsLast5Years(email);
    }

}
