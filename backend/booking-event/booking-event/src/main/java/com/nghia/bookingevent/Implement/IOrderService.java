package com.nghia.bookingevent.Implement;

import com.nghia.bookingevent.models.Order;
import org.springframework.http.ResponseEntity;

public interface IOrderService {
    ResponseEntity<?> createCustomerOrder(String email, Order order);
    ResponseEntity<?> findCustomerOrderByEmail(String email);
    ResponseEntity<?> findOrderByEventId(String eventId,String email);
    ResponseEntity<?> findOrderByTicketType(String ticketTypeId);
    ResponseEntity<?> findAll();
    ResponseEntity<?> checkOrderAvailability( Order order);

    ResponseEntity<?> getLastFourWeeksOrderStatistics(String email);
    ResponseEntity<?> getDailyOrderStatistics(String email);
    ResponseEntity<?> getMonthlyOrderStatistics(String email);
    ResponseEntity<?> getOrdersLast5Years(String email);

}
