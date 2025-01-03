package com.nghia.bookingevent.services;

import com.nghia.bookingevent.Implement.IOrderService;
import com.nghia.bookingevent.exception.AppException;
import com.nghia.bookingevent.mapper.EventMapper;
import com.nghia.bookingevent.models.Customer;
import com.nghia.bookingevent.models.Order;
//import com.nghia.bookingevent.models.OrderStats;
import com.nghia.bookingevent.models.account.Account;
import com.nghia.bookingevent.models.event.Event;
import com.nghia.bookingevent.models.organization.Organization;
import com.nghia.bookingevent.models.ticket.Ticket;
import com.nghia.bookingevent.payload.response.ResponseObject;
import com.nghia.bookingevent.repository.*;
import com.nghia.bookingevent.services.mail.EMailType;
import com.nghia.bookingevent.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.*;
import java.time.format.TextStyle;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static com.nghia.bookingevent.services.TicketService.setStatusForTicketType;

@Service
@RequiredArgsConstructor
//@Transactional
public class OrderService implements IOrderService {
    private final OrderRepository orderRepository;
    private final AccountRepository accountRepository;
    private final EventMapper eventMapper;
    private final CustomerRepository customerRepository;
    private final OrganizationRepository organizationRepository;

    private final MongoTemplate mongoTemplate;
    private final EventRepository eventRepository;
    private final PaymentService paymentService;
    private final MailService mailService;


    //handle order after meeting all secure criteria
    @Override
    public ResponseEntity<?> createCustomerOrder(String email, Order order) {
        try {
            System.out.println("date:" + new Date());
            order.setCreatedDate(new Date());
            Optional<Customer> customer = customerRepository.findByEmail(email);
            Optional<Event> event = eventRepository.findEventById(order.getIdEvent());
            if (customer.isPresent() && event.isPresent()) {
                int resultTicketRemaining = event.get().getTicketRemaining() - order.getTotalQuantity();
                event.get().setTicketRemaining(resultTicketRemaining);
                for (Ticket ticketOfCustomer : order.getCustomerTicketList()) {
                    for (Ticket ticket : event.get().getOrganizationTickets()) {
                        if (ticket.getId().equals(ticketOfCustomer.getId())) {
                            if(ticket.getQuantityRemaining() - ticketOfCustomer.getQuantity() <0)
                            {
                                return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(
                                        new ResponseObject(false, "No more ticket", "", 501));
                            }
                            int resultQuantityRemaining = ticket.getQuantityRemaining() - ticketOfCustomer.getQuantity();
                            ticket.setQuantityRemaining(resultQuantityRemaining );
                            setStatusForTicketType(ticket);
                        }
                    }
                }
                Optional<Organization> organization = organizationRepository.findOrganizationByEventId(order.getIdEvent());
                orderRepository.save(order);
                Optional<Order> updatedOrder = orderRepository.findByCreatedDate(order.getCreatedDate());

                //sendmail
                Optional<Account> account = accountRepository.findByEmail(organization.get().getEmail());
                if (account.isPresent()) {
                    Map<String, String> map = new HashMap<>();
                    map.put("id", event.get().getId());
                    map.put("eventName", event.get().getName());
                    mailService.sendMailCheckOut(updatedOrder.get(), map, account.get().getName(), EMailType.CHECK_OUT);
                }

                //cap nhat o organization  (cong tien)
                if (organization.isPresent()) {
                    BigDecimal orderPrice = new BigDecimal(order.getTotalPrice());
                    if (order.getCurrency().equals("USD")) {
                        paymentService.setPaymentToCountedUSD(organization.get(),order.getIdEvent(),orderPrice );
                    } else if (order.getCurrency().equals("VND")) {
                        paymentService.setPaymentToCountedVND(organization.get(),order.getIdEvent(),orderPrice );
                    } else {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                                new ResponseObject(false, "Problem with currency ", "", 400));

                    }
                    organizationRepository.save(organization.get());
                }

                eventRepository.save(event.get());

                return ResponseEntity.status(HttpStatus.OK).body(
                        new ResponseObject(true, "Create Order for Customer successfully ", orderRepository.findById(order.getId()), 200));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                        new ResponseObject(false, "Create Order fail with email:" + email, "", 404));
            }
            //throw new Exception("test");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ResponseObject(false, "Create Order fail with email:" + email, e.getMessage(), 404));
        }
    }

    @Override
    public ResponseEntity<?> checkOrderAvailability(Order order) {
        try {
            // Validate order object
            if (order == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    new ResponseObject(false, "Order cannot be null", null, 400));
            }

            // Validate event ID
            if (order.getIdEvent() == null || order.getIdEvent().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    new ResponseObject(false, "Event ID is required", null, 400));
            }

            // Validate customer ticket list
            List<Ticket> customerTickets = order.getCustomerTicketList();
            if (customerTickets == null || customerTickets.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    new ResponseObject(false, "Customer ticket list cannot be empty", null, 400));
            }

            Optional<Event> event = eventRepository.findEventById(order.getIdEvent());
            if (!event.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ResponseObject(false, "Event not found with ID: " + order.getIdEvent(), null, 404));
            }

            Event foundEvent = event.get();

            
            if (foundEvent.getOrganizationTickets() != null) {
                foundEvent.getOrganizationTickets().forEach(ticket -> {
                });
            }

            for (Ticket customerTicket : customerTickets) {
                String customerTicketId = customerTicket.getId();

                boolean ticketFound = foundEvent.getOrganizationTickets().stream()
                    .anyMatch(eventTicket -> {
                        String eventTicketId = eventTicket.getId();
                        return eventTicketId != null && eventTicketId.equals(customerTicketId);
                    });

                if (!ticketFound) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                        new ResponseObject(false, "Ticket not found with id: " + customerTicketId, null, 404));
                }

                // Kiểm tra số lượng
                Ticket eventTicket = foundEvent.getOrganizationTickets().stream()
                    .filter(t -> t.getId().equals(customerTicketId))
                    .findFirst()
                    .get();

                if (eventTicket.getQuantityRemaining() < customerTicket.getQuantity()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                        new ResponseObject(false, "Not enough tickets available", null, 400));
                }
            }

            return ResponseEntity.status(HttpStatus.OK).body(
                new ResponseObject(true, "Order availability check passed", null, 200));

        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Error in checkOrderAvailability: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject(false, "Error: " + e.getMessage(), null, 500));
        }
    }

    @Override
    public ResponseEntity<?> getLastFourWeeksOrderStatistics(String email) {
        Organization organization = organizationRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));

        List<Event> events = new ArrayList<>();
        for (String eventName : organization.getEventList()) {
            Optional<Event> event = eventRepository.findEventById(eventName);
            event.ifPresent(events::add);
        }

        LocalDate currentDate = LocalDate.now().minusWeeks(3);
        Map<String, Double> orderTotalUSDPriceByDate = new HashMap<>();
        Map<String, Double> orderTotalVNDPriceByDate = new HashMap<>();
        while (!currentDate.isAfter(LocalDate.now())) {
            String weekName = "Week " + currentDate.get(WeekFields.of(Locale.getDefault()).weekOfWeekBasedYear());
            orderTotalUSDPriceByDate.put(weekName, 0.0);
            orderTotalVNDPriceByDate.put(weekName, 0.0);
            currentDate = currentDate.plusWeeks(1);
        }

        for (String eventName: organization.getEventList()) {
            Optional<Event> event = eventRepository.findEventById(eventName);
            for (Order order : orderRepository.findAllByIdEvent(event.get().getId())) {
                LocalDate orderDate = order.getCreatedDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                if (orderDate.isAfter(LocalDate.now().minusWeeks(4))) {
                    String weekName = "Week " + orderDate.get(WeekFields.of(Locale.getDefault()).weekOfWeekBasedYear());;
                    if(order.getCurrency().equals("VND")){
                        orderTotalVNDPriceByDate.put(weekName, orderTotalVNDPriceByDate.getOrDefault(weekName, 0.0) + Double.parseDouble(order.getTotalPrice()));
                    } else {
                        orderTotalUSDPriceByDate.put(weekName, orderTotalUSDPriceByDate.getOrDefault(weekName, 0.0) + Double.parseDouble(order.getTotalPrice()));
                    }
              }
            }
        }

        List<Map<String, Object>> weekStatistics = new ArrayList<>();
        for (Map.Entry<String, Double> entry : orderTotalVNDPriceByDate.entrySet()) {
            Map<String, Object> weekStat = new HashMap<>();
            BigDecimal USDValue = new BigDecimal(String.valueOf(orderTotalUSDPriceByDate.getOrDefault(entry.getKey(), 0.0)));
            BigDecimal VNDValue = new BigDecimal(String.valueOf(orderTotalVNDPriceByDate.getOrDefault(entry.getKey(), 0.0)));
            weekStat.put("date", entry.getKey());
            weekStat.put("orderTotalPriceByUSD", USDValue.toPlainString());
            weekStat.put("orderTotalPriceByVND", VNDValue.toPlainString());
            weekStatistics.add(weekStat);
        }
        return ResponseEntity.status(HttpStatus.OK).body(
                new ResponseObject(true, "Ticket statistics for last 4 weeks", weekStatistics, 200));

    }

    @Override
    public ResponseEntity<?> getDailyOrderStatistics(String email) {
        Organization organization = organizationRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));

        List<Event> events = new ArrayList<>();
        for (String eventName : organization.getEventList()) {
            Optional<Event> event = eventRepository.findEventById(eventName);
            event.ifPresent(events::add);
        }

        Map<LocalDate, Double> orderTotalUSDPriceByDate = new HashMap<>();
        Map<LocalDate, Double> orderTotalVNDPriceByDate = new HashMap<>();
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(6);

        for (String eventName: organization.getEventList()) {
            Optional<Event> event = eventRepository.findEventById(eventName);
            for (Order order : orderRepository.findAllByIdEvent(event.get().getId())) {
                LocalDate orderDate = order.getCreatedDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                if (orderDate.isAfter(startDate.minusDays(1)) && orderDate.isBefore(endDate.plusDays(1))) {
                    if(order.getCurrency().equals("VND")){
                        orderTotalVNDPriceByDate.put(orderDate, orderTotalVNDPriceByDate.getOrDefault(orderDate, 0.0) + Double.parseDouble(order.getTotalPrice()));
                    } else {
                        orderTotalUSDPriceByDate.put(orderDate, orderTotalUSDPriceByDate.getOrDefault(orderDate, 0.0) + Double.parseDouble(order.getTotalPrice()));
                    }

                }
            }
        }

        List<Map<String, Object>> orderStatistics = new ArrayList<>();
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            BigDecimal USDValue = new BigDecimal(String.valueOf(orderTotalUSDPriceByDate.getOrDefault(currentDate, 0.0)));
            BigDecimal VNDValue = new BigDecimal(String.valueOf(orderTotalVNDPriceByDate.getOrDefault(currentDate, 0.0)));
            Map<String, Object> orderStat = new HashMap<>();
            orderStat.put("date", currentDate.getDayOfWeek().toString());
            orderStat.put("orderTotalPriceByUSD", USDValue.toPlainString());
            orderStat.put("orderTotalPriceByVND", VNDValue.toPlainString());
            orderStatistics.add(orderStat);
            currentDate = currentDate.plusDays(1);
        }

        return ResponseEntity.status(HttpStatus.OK).body(
                new ResponseObject(true, "Order statistics for the last 7 days", orderStatistics, 200));

    }

    @Override
    public ResponseEntity<?> getMonthlyOrderStatistics(String email) {
        Organization organization = organizationRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));

        Map<String, Double> orderTotalUSDPriceByDate = new HashMap<>();
        Map<String, Double> orderTotalVNDPriceByDate = new HashMap<>();
        LocalDate currentDate = LocalDate.now();
        LocalDate startDate = currentDate.minusMonths(11);
        for (String eventName : organization.getEventList()) {
            Optional<Event> event = eventRepository.findEventById(eventName);
            for (Order order : orderRepository.findAllByIdEvent(event.get().getId())) {
                LocalDate orderDate = order.getCreatedDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                if (orderDate.isAfter(startDate.minusDays(1)) && orderDate.isBefore(currentDate.plusDays(1))) {
                    String monthName = orderDate.getMonth().getDisplayName(TextStyle.FULL, Locale.getDefault());
                     if(order.getCurrency().equals("VND")){
                        orderTotalVNDPriceByDate.put(monthName, orderTotalVNDPriceByDate.getOrDefault(monthName, 0.0) + Double.parseDouble(order.getTotalPrice()));
                    } else {
                        orderTotalUSDPriceByDate.put(monthName, orderTotalUSDPriceByDate.getOrDefault(monthName, 0.0) + Double.parseDouble(order.getTotalPrice()));
                    }
                }
            }
        }

        List<Map<String, Object>> orderStatistics = new ArrayList<>();
        for (int i = 0; i < 12; i++) {
            String monthName = startDate.plusMonths(i).getMonth().getDisplayName(TextStyle.FULL, Locale.getDefault()) ;
            int year = startDate.plusMonths(i).getYear() ;
            BigDecimal USDValue = new BigDecimal(String.valueOf(orderTotalUSDPriceByDate.getOrDefault(monthName, 0.0)));
            BigDecimal VNDValue = new BigDecimal(String.valueOf(orderTotalVNDPriceByDate.getOrDefault(monthName, 0.0)));
            Map<String, Object> orderStat = new HashMap<>();
            orderStat.put("date", monthName + " " + year);
            orderStat.put("orderTotalPriceByUSD", USDValue.toPlainString());
            orderStat.put("orderTotalPriceByVND", VNDValue.toPlainString());
            orderStatistics.add(orderStat);
        }

        return ResponseEntity.status(HttpStatus.OK).body(
                new ResponseObject(true, "Order statistics for the past 12 months", orderStatistics, 200));

    }

    @Override
    public ResponseEntity<?> getOrdersLast5Years(String email) {
        Organization organization = organizationRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));

        int currentYear = LocalDate.now().getYear();

        Map<Integer, Double> orderTotalPriceByUSDCountsByYear = IntStream.rangeClosed(currentYear - 4, currentYear)
                .boxed()
                .collect(Collectors.toMap(year -> year, year -> (double) 0));
        Map<Integer, Double> orderTotalPriceByVNDCountsByYear = IntStream.rangeClosed(currentYear - 4, currentYear)
                .boxed()
                .collect(Collectors.toMap(year -> year, year -> (double) 0));

        for (String eventName : organization.getEventList()) {
            Event event = eventRepository.findEventById(eventName)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Event not found"));

            List<Order> orders = orderRepository.findAllByIdEvent(event.getId());
            for (Order order : orders) {
                int orderYear = order.getCreatedDate().getYear();
                if (orderYear >= currentYear - 4 && orderYear <= currentYear) {
                    if(order.getCurrency().equals("VND")){
                        orderTotalPriceByVNDCountsByYear.merge(orderYear, Double.parseDouble(order.getTotalPrice()), Double::sum);
                    } else {
                        orderTotalPriceByUSDCountsByYear.merge(orderYear, Double.parseDouble(order.getTotalPrice()), Double::sum);
                    }
                }
            }
        }

        List<Map<String, Object>> orderStatistics = IntStream.rangeClosed(currentYear - 4, currentYear)
                .boxed()
                .map(year -> {
                    Map<String, Object> orderStats = new HashMap<>();
                    orderStats.put("date", year);
                    orderStats.put("orderTotalPriceByUSD", orderTotalPriceByUSDCountsByYear.get(year));
                    orderStats.put("orderTotalPriceByVND",  orderTotalPriceByVNDCountsByYear.get(year));
                    return orderStats;
                })
                .collect(Collectors.toList());
        return ResponseEntity.status(HttpStatus.OK).body(
                new ResponseObject(true, "Ticket statistics for last 5 years", orderStatistics, 200));

    }


    @Override
    public ResponseEntity<?> findCustomerOrderByEmail(String email) {
        Optional<Customer> customer = customerRepository.findByEmail(email);
        if (customer.isPresent()) {

            return ResponseEntity.status(HttpStatus.OK).body(
                    new ResponseObject(true, "findCustomerOrderByEmail successfully ", orderRepository.findAllByEmail(email), 200));

        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ResponseObject(false, "findCustomerOrderByEmail fail with email:" + email, "", 400));

        }
    }

    @Override
    public ResponseEntity<?> findAll() {

        List<Order> orderList = orderRepository.findAll();
        if (orderList.size() > 0) {
            return ResponseEntity.status(HttpStatus.OK).body(
                    new ResponseObject(true, "find All order", orderList, 200));

        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ResponseObject(false, "find All order fail", "", 400));

        }

    }

    @Override
    public ResponseEntity<?> findOrderByEventId(String eventId,String email) {
        List <Order> orderList = orderRepository.findAllByIdEvent(eventId);
        Optional<Organization> organization = organizationRepository.findByEmail(email);

        if(organization.isPresent() && !organization.get().getEventList().contains(eventId))
        {
            throw new AppException(HttpStatus.FORBIDDEN.value(), "You don't have permission! Token is invalid");
        }
        if(orderList.size()>0)
        {
            return ResponseEntity.status(HttpStatus.OK).body(
                    new ResponseObject(true, "finding List of Order successfully ", orderList, 200));

        }
        else
        {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ResponseObject(false, "finding List of Order   fail ", new ArrayList<>(), 400));

        }
    }


    @Override
    public ResponseEntity<?> findOrderByTicketType(String ticketTypeId) {
        try {
            return ResponseEntity.status(HttpStatus.OK).body(
                    new ResponseObject(true, "findOrderByTicketType successfully ", orderRepository.findAllByCustomerTicketList_Id(ticketTypeId), 200));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ResponseObject(false, "findOrderByTicketType fail ", e.getMessage(), 400));

        }

    }
    public int getPreviousDayOrderCount(String email) {
        Optional<Organization> organization = organizationRepository.findByEmail(email);
        List<Order> orders = new ArrayList<>();
        List<Event> events = new ArrayList<>();
        for(String eventId : organization.get().getEventList()){
            events.add(eventRepository.findEventById(eventId).get());
            orders.addAll(orderRepository.findAllByIdEvent(eventId));
        }

        LocalDate yesterday = LocalDate.now().minusDays(1);
        LocalDateTime startOfYesterday = yesterday.atStartOfDay();
        LocalDateTime startOfPast = LocalDateTime.of(2000, 1, 1, 0, 0, 0);

        Date startOfYesterdayDate = Date.from(startOfYesterday.atZone(ZoneId.systemDefault()).toInstant());
        Date startOfPastDate = Date.from(startOfPast.atZone(ZoneId.systemDefault()).toInstant());

        long orderCount = orders.stream()
                .filter(order -> order.getCreatedDate().after(startOfPastDate) &&
                        order.getCreatedDate().before(startOfYesterdayDate))
                .count();

        return (int) orderCount;
    }

}
