package com.nghia.bookingevent.Implement;

import com.nghia.bookingevent.models.Review;
import org.springframework.http.ResponseEntity;

public interface IReviewService {
    ResponseEntity<?> submitReview(Review review,String email);
    ResponseEntity<?> isReviewAvailable(String email,String eventId);
    ResponseEntity<?> findAllReviews(String eventId);
    ResponseEntity<?> findAllByEventId(String eventId, int pageNumber, int pageSize);
    ResponseEntity<?> deleteReview(String email,String eventId);
    ResponseEntity<?> updateReview(Review review,String email );
}
