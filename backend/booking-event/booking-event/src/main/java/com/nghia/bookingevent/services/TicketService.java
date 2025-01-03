package com.nghia.bookingevent.services;

import com.nghia.bookingevent.Implement.ITicketService;
import com.nghia.bookingevent.mapper.EventMapper;
import com.nghia.bookingevent.mapper.TicketMapper;
import com.nghia.bookingevent.models.Order;
import com.nghia.bookingevent.models.event.Event;
import com.nghia.bookingevent.models.organization.Organization;
import com.nghia.bookingevent.models.ticket.TicketStatus;
import com.nghia.bookingevent.payload.request.OrganizationTicketReq;
import com.nghia.bookingevent.models.ticket.Ticket;
import com.nghia.bookingevent.payload.response.ResponseObject;
import com.nghia.bookingevent.repository.EventRepository;
import com.nghia.bookingevent.repository.OrderRepository;
import com.nghia.bookingevent.repository.OrganizationRepository;

import java.time.*;
import java.time.format.TextStyle;
import java.time.temporal.WeekFields;

//import com.nghia.bookingevent.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class TicketService implements ITicketService {

    private final OrganizationRepository organizationRepository;
    private final OrderRepository orderRepository;
    private final EventRepository eventRepository;
    private final EventMapper eventMapper;
    private final TicketMapper ticketMapper;
    //private final TicketRepository ticketRepository;
    @Override
    public ResponseEntity<?> createTicket(String email, OrganizationTicketReq organizationTicketReq, String eventId)
    {
        Optional<Organization> organization = organizationRepository.findByEmail(email);
        Optional<Event> event= eventRepository.findEventById(eventId);
        try
        {
            if(organization.isPresent() && event.isPresent())
            {
                Ticket ticket = new Ticket(organizationTicketReq);
                event.get().getOrganizationTickets().add(ticket);
                eventRepository.save(event.get());
                return ResponseEntity.status(HttpStatus.OK).body(
                        new ResponseObject(true, "Create one ticket successfully", "",200));
            }
            else
            {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                        new ResponseObject(true, "Failure ", "",400));
            }
        }
        catch (Exception e)
        {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(
                    new ResponseObject(true, e.getMessage(), "",400));
        }
    }
    @Override
    public ResponseEntity<?> createMultipleTickets(String email, List<OrganizationTicketReq> organizationTicketReq, String eventId )
    {
        Optional<Organization> organization = organizationRepository.findByEmail(email);
        Optional<Event> event= eventRepository.findEventById(eventId);

        try
        {
            if(organization.isPresent() &&  event.isPresent())
            {
                List<Ticket> ticketList = organizationTicketReq.stream().map(ticketMapper::toTicket ).collect(Collectors.toList());

                event.get().setOrganizationTickets(ticketList);
                eventRepository.save(event.get());
                return ResponseEntity.status(HttpStatus.OK).body(
                        new ResponseObject(true, "Create multiple tickets successfully", "",200));
            }
            else
            {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                        new ResponseObject(true, "Failure ", "",400));
            }
        }
        catch (Exception e)
        {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(
                    new ResponseObject(true, e.getMessage(), "",400));
        }
    }
    static void setStatusForTicketType(Ticket ticket) {
        int quantityRemaining = ticket.getQuantityRemaining();
        if(quantityRemaining == 0){
            ticket.setStatus(TicketStatus.SOLD_OUT);
        }
        else {
            if((float)((ticket.getQuantity() - ticket.getQuantityRemaining() )/ ticket.getQuantity()) > 0.7)
            {
                ticket.setStatus(TicketStatus.BEST_SELLER);
            }


        }
    }
    @Override
    public ResponseEntity<?> getLastFourWeeksTicketStatistics(String email) {
        Organization organization = organizationRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));

        List<Event> events = new ArrayList<>();
        for (String eventName : organization.getEventList()) {
            Optional<Event> event = eventRepository.findEventById(eventName);
            event.ifPresent(events::add);
        }

        LocalDate currentDate = LocalDate.now().minusWeeks(3);
        Map<String, Integer> weekCounts = new LinkedHashMap<>();
        while (!currentDate.isAfter(LocalDate.now())) {
            String weekName = "Week " + currentDate.get(WeekFields.of(Locale.getDefault()).weekOfWeekBasedYear());
            weekCounts.put(weekName, 0);
            currentDate = currentDate.plusWeeks(1);
        }

        for (String eventName: organization.getEventList()) {
            Optional<Event> event = eventRepository.findEventById(eventName);
            for (Order order : orderRepository.findAllByIdEvent(event.get().getId())) {
                LocalDate orderDate = order.getCreatedDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                if (orderDate.isAfter(LocalDate.now().minusWeeks(4))) {
                    String weekName = "Week " + orderDate.get(WeekFields.of(Locale.getDefault()).weekOfWeekBasedYear());;
                    weekCounts.put(weekName, weekCounts.getOrDefault(weekName, 0) + order.getTotalQuantity());
                }
            }
        }

        List<Map<String, Object>> weekStatistics = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : weekCounts.entrySet()) {
            Map<String, Object> weekStat = new HashMap<>();
            weekStat.put("date", entry.getKey());
            weekStat.put("numberTickets", entry.getValue());
            weekStatistics.add(weekStat);
        }
        return ResponseEntity.status(HttpStatus.OK).body(
                new ResponseObject(true, "Ticket statistics for last 4 weeks", weekStatistics, 200));
    }
    @Override
    public ResponseEntity<?> getDailyTicketStatistics(String email) {
        try {
            Organization organization = organizationRepository.findByEmail(email)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));

            Map<LocalDate, Integer> orderCountsByDate = new HashMap<>();
            LocalDate endDate = LocalDate.now();
            LocalDate startDate = endDate.minusDays(6);

            List<String> invalidEventIds = new ArrayList<>();

            for (String eventId : organization.getEventList()) {
                try {
                    Optional<Event> eventOpt = eventRepository.findEventById(eventId);
                    if (!eventOpt.isPresent()) {
                        // Lưu lại các ID không hợp lệ
                        invalidEventIds.add(eventId);
                        continue; // Bỏ qua event không tồn tại
                    }

                    Event event = eventOpt.get();
                    List<Order> orders = orderRepository.findAllByIdEvent(event.getId());
                    if (orders != null) {
                        for (Order order : orders) {
                            LocalDate orderDate = order.getCreatedDate()
                                    .toInstant()
                                    .atZone(ZoneId.systemDefault())
                                    .toLocalDate();
                                    
                            if (orderDate.isAfter(startDate.minusDays(1)) && 
                                orderDate.isBefore(endDate.plusDays(1))) {
                                orderCountsByDate.merge(
                                    orderDate, 
                                    order.getTotalQuantity(), 
                                    Integer::sum
                                );
                            }
                        }
                    }
                } catch (Exception e) {
                    // Log lỗi nhưng không dừng xử lý
                    System.err.println("Error processing event " + eventId + ": " + e.getMessage());
                }
            }

            // Nếu có event ID không hợp lệ, cập nhật lại eventList của organization
            if (!invalidEventIds.isEmpty()) {
                try {
                    List<String> validEventIds = new ArrayList<>(organization.getEventList());
                    validEventIds.removeAll(invalidEventIds);
                    organization.setEventList(validEventIds);
                    organizationRepository.save(organization);
                    
                    System.out.println("Removed invalid event IDs from organization: " + invalidEventIds);
                } catch (Exception e) {
                    System.err.println("Error updating organization's event list: " + e.getMessage());
                }
            }

            // Tạo statistics response
            List<Map<String, Object>> orderStatistics = new ArrayList<>();
            LocalDate currentDate = startDate;
            while (!currentDate.isAfter(endDate)) {
                Map<String, Object> orderStat = new HashMap<>();
                orderStat.put("date", currentDate.getDayOfWeek().toString());
                orderStat.put("numberTickets", orderCountsByDate.getOrDefault(currentDate, 0));
                orderStatistics.add(orderStat);
                currentDate = currentDate.plusDays(1);
            }

            return ResponseEntity.status(HttpStatus.OK).body(
                    new ResponseObject(true, "Ticket statistics for the last 7 days", orderStatistics, 200));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject(false, "Error getting statistics: " + e.getMessage(), null, 500));
        }
    }
    @Override
    public ResponseEntity<?> getMonthlyTicketStatistics(String email) {
        Organization organization = organizationRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));

        Map<String, Integer> orderCountsByMonth = new HashMap<>();
        LocalDate currentDate = LocalDate.now();
        LocalDate startDate = currentDate.minusMonths(11);
        for (String eventName : organization.getEventList()) {
            Optional<Event> event = eventRepository.findEventById(eventName);
            for (Order order : orderRepository.findAllByIdEvent(event.get().getId())) {
                LocalDate orderDate = order.getCreatedDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                if (orderDate.isAfter(startDate.minusDays(1)) && orderDate.isBefore(currentDate.plusDays(1))) {
                    String monthName = orderDate.getMonth().getDisplayName(TextStyle.FULL, Locale.getDefault());
                    orderCountsByMonth.put(monthName, orderCountsByMonth.getOrDefault(monthName, 0) + order.getTotalQuantity());
                }
            }
        }

        List<Map<String, Object>> orderStatistics = new ArrayList<>();
        for (int i = 0; i < 12; i++) {
            String monthName = startDate.plusMonths(i).getMonth().getDisplayName(TextStyle.FULL, Locale.getDefault()) ;
            int year = startDate.plusMonths(i).getYear() ;
            Map<String, Object> orderStat = new HashMap<>();
            orderStat.put("date", monthName + " " + year);
            orderStat.put("numberTickets", orderCountsByMonth.getOrDefault(monthName, 0));
            orderStatistics.add(orderStat);
        }

        return ResponseEntity.status(HttpStatus.OK).body(
                new ResponseObject(true, "Ticket statistics for the past 12 months", orderStatistics, 200));
    }
    public ResponseEntity<?> getTicketsLast5Years(String email) {
        Organization organization = organizationRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));

        int currentYear = LocalDate.now().getYear();

        Map<Integer, Integer> ticketCountsByYear = IntStream.rangeClosed(currentYear - 4, currentYear)
                .boxed()
                .collect(Collectors.toMap(year -> year, year -> 0));

        for (String eventName : organization.getEventList()) {
            Event event = eventRepository.findEventById(eventName)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Event not found"));

            List<Order> orders = orderRepository.findAllByIdEvent(event.getId());
            for (Order order : orders) {
                int orderYear = order.getCreatedDate().getYear();
                if (orderYear >= currentYear - 4 && orderYear <= currentYear) {
                    ticketCountsByYear.merge(orderYear, order.getTotalQuantity(), Integer::sum);
                }
            }
        }

        List<Map<String, Object>> ticketStatistics = IntStream.rangeClosed(currentYear - 4, currentYear)
                .boxed()
                .map(year -> {
                    Map<String, Object> ticketStat = new HashMap<>();
                    ticketStat.put("date", year);
                    ticketStat.put("numberTickets", ticketCountsByYear.get(year));
                    return ticketStat;
                })
                .collect(Collectors.toList());
        return ResponseEntity.status(HttpStatus.OK).body(
                new ResponseObject(true, "Ticket statistics for last 5 years", ticketStatistics, 200));
    }

    public ResponseEntity<?> getTemplateTicket(String eventId) {
        try {
            Optional<Event> event = eventRepository.findEventById(eventId);
            if (!event.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ResponseObject(false, "Event not found", null, 404)
                );
            }
            
            List<Ticket> tickets = event.get().getOrganizationTickets();
            if (tickets == null || tickets.isEmpty()) {
                return ResponseEntity.status(HttpStatus.OK).body(
                    new ResponseObject(true, "No tickets found", Collections.emptyList(), 200)
                );
            }

            return ResponseEntity.status(HttpStatus.OK).body(
                new ResponseObject(true, "Get template tickets successfully", tickets, 200)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ResponseObject(false, "Error getting template tickets: " + e.getMessage(), null, 500)
            );
        }
    }

}
