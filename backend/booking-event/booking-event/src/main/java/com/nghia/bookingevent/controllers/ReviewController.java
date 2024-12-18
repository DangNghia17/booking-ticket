package com.nghia.bookingevent.controllers;

import com.nghia.bookingevent.Implement.IReviewService;
import com.nghia.bookingevent.exception.AppException;
import com.nghia.bookingevent.models.Review;
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
public class ReviewController {
    private final JwtTokenProvider jwtUtils;
    IReviewService iReviewService;

    @PostMapping(path = "/customer/review/{id}")
    public ResponseEntity<?> submitReview(@PathVariable String id,@Valid @RequestBody Review review,
                                    HttpServletRequest request) {

        Account account = jwtUtils.getGmailFromJWT(jwtUtils.getJwtFromHeader(request));
        if (account.getId().equals(id)) {
            return iReviewService.submitReview(review,account.getEmail());
        }
        throw new AppException(HttpStatus.FORBIDDEN.value(), "You don't have permission! Token is invalid");
    }
    @PutMapping(path = "/customer/review/{id}")
    public ResponseEntity<?> updateReview(@PathVariable String id,@Valid @RequestBody Review review,
                                          HttpServletRequest request) {

        Account account = jwtUtils.getGmailFromJWT(jwtUtils.getJwtFromHeader(request));
        if (account.getId().equals(id)) {
            return iReviewService.updateReview(review,account.getEmail());
        }
        throw new AppException(HttpStatus.FORBIDDEN.value(), "You don't have permission! Token is invalid");
    }
    @GetMapping(path = "/review/all")
    public ResponseEntity<?> getAllReviewByEventId(
        @RequestParam(name = "eventId", required = false) String eventId) {
        
        if (eventId == null || eventId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                new ResponseObject(false, "EventId is required", null, 400));
        }
        
        try {
            return iReviewService.findAllReviews(eventId);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ResponseObject(false, "Internal server error", null, 500));
        }
    }
    @GetMapping(path = "/review")
    public ResponseEntity<?> getAllReviewPagingByEventId(String eventId, int pageNumber, int pageSize) {
        return iReviewService.findAllByEventId(eventId, pageNumber, pageSize);
    }
    @GetMapping(path = "/customer/review/checkReview/{id}")
    public ResponseEntity<?> checkReview(@PathVariable String id, @RequestParam(value="eventId", required = false) String  eventId,HttpServletRequest request) {
        Account account = jwtUtils.getGmailFromJWT(jwtUtils.getJwtFromHeader(request));
        if (account.getId().equals(id)) {
            return iReviewService.isReviewAvailable(account.getEmail(), eventId);
        }
        throw new AppException(HttpStatus.FORBIDDEN.value(), "You don't have permission! Token is invalid");
    }
    @DeleteMapping(path = "/customer/review/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable String id, @RequestParam(value="eventId", required = false) String  eventId,HttpServletRequest request) {
        Account account = jwtUtils.getGmailFromJWT(jwtUtils.getJwtFromHeader(request));
        if (account.getId().equals(id)) {
            return iReviewService.deleteReview(account.getEmail(), eventId);
        }
        throw new AppException(HttpStatus.FORBIDDEN.value(), "You don't have permission! Token is invalid");
    }
}
