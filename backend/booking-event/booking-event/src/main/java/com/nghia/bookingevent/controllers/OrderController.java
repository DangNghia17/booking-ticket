package com.nghia.bookingevent.controllers;

import com.nghia.bookingevent.Implement.IOrderService;
import com.nghia.bookingevent.exception.AppException;
import com.nghia.bookingevent.models.Order;
import com.nghia.bookingevent.models.account.Account;
import com.nghia.bookingevent.payload.response.ResponseObject;
import com.nghia.bookingevent.security.jwt.JwtTokenProvider;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;

@AllArgsConstructor
@RestController
@RequestMapping(path = "/api")
public class OrderController {
    private final IOrderService iOrderService;
    private final JwtTokenProvider jwtUtils;


    @PostMapping(path = "/customer/order/{userId}")
    public ResponseEntity<?> createCustomerOrder(@PathVariable String userId, @Valid @RequestBody Order order, HttpServletRequest request) throws Exception {
        Account account = jwtUtils.getGmailFromJWT(jwtUtils.getJwtFromHeader(request));
        try
        {
            if (account.getId().equals(userId)) {
                System.out.println("Order process");
                return iOrderService.createCustomerOrder(account.getEmail(), order);
            }
            throw new AppException(HttpStatus.FORBIDDEN.value(), "You don't have permission! Token is invalid");
        }
        catch (Exception e)
        {
            System.out.println(e.getMessage());
            e.printStackTrace();
        }
        throw new Exception(" You don't have permission! Token is invalid or fall by order");
    }
    @GetMapping(path = "/order/all")
    public ResponseEntity<?> findAll() {
        return  iOrderService.findAll();
    }
    @GetMapping(path = "/customer/order")
    public ResponseEntity<?> findCustomerOrderByUserId(@RequestParam(value="userId", required = false) String userId, HttpServletRequest request) {
        Account account = jwtUtils.getGmailFromJWT(jwtUtils.getJwtFromHeader(request));
        if (account.getId().equals(userId)) {
            return iOrderService.findCustomerOrderByEmail(account.getEmail());
        }
        throw new AppException(HttpStatus.FORBIDDEN.value(), "You don't have permission! Token is invalid");

    }
    @GetMapping(path = "/organization/manage/customerOrder")
    public ResponseEntity<?> findOrderByEventId(@RequestParam(value="userId", required = false) String userId,@RequestParam(value="eventId", required = false) String eventId, HttpServletRequest request) {
        Account account = jwtUtils.getGmailFromJWT(jwtUtils.getJwtFromHeader(request));
        if (account.getId().equals(userId)) {
            return iOrderService.findOrderByEventId(eventId, account.getEmail());
        }
        throw new AppException(HttpStatus.FORBIDDEN.value(), "You don't have permission! Token is invalid");

    }
    @PostMapping(path = "/customer/availability/order/{userId}")
    public ResponseEntity<?> checkOrderAvailability(@PathVariable String userId, 
                                                  @Valid @RequestBody Order order, 
                                                  HttpServletRequest request) {
        try {
            System.out.println("Received order data: " + order);
            
            if (order.getIdEvent() == null || order.getIdEvent().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseObject(false, "Event ID is required", null, 400));
            }

            String token = jwtUtils.getJwtFromHeader(request);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResponseObject(false, "No token provided", null, 401));
            }

            Account account = jwtUtils.getGmailFromJWT(token);
            if (account == null || account.getId() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResponseObject(false, "Invalid token", null, 401));
            }

            
            if (!account.getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ResponseObject(false, "You don't have permission", null, 403));
            }

            return iOrderService.checkOrderAvailability(order);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject(false, "Error: " + e.getMessage(), null, 500));
        }
    }
    @GetMapping(path = "/organization/order/ticketType/{userId}")
    public ResponseEntity<?> findOrderByTicketType(@PathVariable String userId,@RequestParam(value="ticketTypeId", required = false) String ticketTypeId, HttpServletRequest request) {
        Account account = jwtUtils.getGmailFromJWT(jwtUtils.getJwtFromHeader(request));
        if (account.getId().equals(userId)) {
            return iOrderService.findOrderByTicketType(ticketTypeId);
        }
        throw new AppException(HttpStatus.FORBIDDEN.value(), "You don't have permission! Token is invalid");

    }

    @GetMapping("/organization/{email}/order-statistics/last-seven-days")
    public ResponseEntity<?> getDailyOrderStatistics(@PathVariable String email) {
        return iOrderService.getDailyOrderStatistics(email);
    }
    @GetMapping("/organization/{email}/order-statistics/last-four-weeks")
    public ResponseEntity<?> getLastFourWeeksOrderStatistics(@PathVariable String email) {
        return iOrderService.getLastFourWeeksOrderStatistics(email);
    }
    @GetMapping("/organization/{email}/order-statistics/monthly")
    public ResponseEntity<?> getMonthlyOrderStatistics(@PathVariable String email) {
        return iOrderService.getMonthlyOrderStatistics(email);
    }
    @GetMapping("/organization/{email}/order-statistics/last-five-years")
    public ResponseEntity<?> getTOrderLast5Years(@PathVariable String email) {
        return iOrderService.getOrdersLast5Years(email);
    }


}
