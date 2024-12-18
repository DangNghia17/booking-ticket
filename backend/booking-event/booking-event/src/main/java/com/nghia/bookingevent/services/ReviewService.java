package com.nghia.bookingevent.services;

import com.nghia.bookingevent.Implement.IReviewService;
import com.nghia.bookingevent.models.Review;
import com.nghia.bookingevent.payload.response.ResponseObject;
import com.nghia.bookingevent.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService implements IReviewService {

    private final ReviewRepository reviewRepository;

    @Override
    public ResponseEntity<?> submitReview(Review review, String email) {
        if (review.getEmail().equals(email)) {
            review.setCreatedAt(new Date());
            reviewRepository.save(review);
            return ResponseEntity.status(HttpStatus.OK).body(
                    new ResponseObject(true, "submitReview successfully", "", 200));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new ResponseObject(true, "can not submit with other email", "", 400));

    }

    //kiểm tra xem người dùng đã comment lần đầu hay chưa
    @Override
    public ResponseEntity<?> isReviewAvailable(String email, String eventId) {
        if (reviewRepository.count() == 0) {
            return ResponseEntity.status(HttpStatus.OK).body(
                new ResponseObject(true, "No reviews in database", null, 200));
        }
        
        if (reviewRepository.existsByEmailAndIdEvent(email, eventId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new ResponseObject(false, "user can not post feedback and change it", "", 400));
        }

        return ResponseEntity.status(HttpStatus.OK).body(
            new ResponseObject(true, "user can post feedback", "", 200));
    }

    @Override
    public ResponseEntity<?> findAllByEventId(String eventId, int pageNumber, int pageSize) {
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        Page<Review> reviewPage = reviewRepository.findAllByIdEvent(eventId, pageable);
        if (!reviewPage.isEmpty()) {
            return ResponseEntity.status(HttpStatus.OK).body(
                    new ResponseObject(true, "Review List by EventId", reviewPage.getContent(), 200));
        }
        else if(reviewPage.isEmpty()){
            return ResponseEntity.status(HttpStatus.OK).body(
                    new ResponseObject(true, "Review List is Empty", new ArrayList<>(), 200));

        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new ResponseObject(false, "List is empty", new ArrayList<>(), 404));
    }

    @Override
    public ResponseEntity<?> findAllReviews(String eventId) {
        try {
            // Validate eventId
            if (eventId == null || eventId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                    new ResponseObject(false, "EventId is required", null, 400));
            }

            // Get reviews
            List<Review> reviewList = reviewRepository.findAllByIdEvent(eventId);
            
            // Return empty list if no reviews found
            if (reviewList == null || reviewList.isEmpty()) {
                return ResponseEntity.ok().body(
                    new ResponseObject(true, "No reviews found for this event", 
                        new ArrayList<>(), 200));
            }

            // Return reviews
            return ResponseEntity.ok().body(
                new ResponseObject(true, "Reviews found", reviewList, 200));
                
        } catch (Exception e) {
            // Log error
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ResponseObject(false, "Internal server error", null, 500));
        }
    }

    @Override
    public ResponseEntity<?> deleteReview(String email, String eventId) {
        try {
            reviewRepository.deleteByEmailAndIdEvent(email, eventId);
            return ResponseEntity.status(HttpStatus.OK).body(
                    new ResponseObject(true, " delete Review successfully", "", 200));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ResponseObject(false, "delete Review fail", "", 400));
        }

    }
    @Override
    public ResponseEntity<?> updateReview(Review review,String email )
    {
        if (review.getEmail().equals(email)) {
            Optional<Review> newReview=  reviewRepository.findByEmailAndIdEvent(review.getEmail(), review.getIdEvent());
            newReview.get().setMessage(review.getMessage());
            newReview.get().setRate(review.getRate());
            newReview.get().setCreatedAt(new Date());
            reviewRepository.save(newReview.get());
            return ResponseEntity.status(HttpStatus.OK).body(
                    new ResponseObject(true, "edit review successfully", "", 200));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new ResponseObject(true, "can not edit review", "", 400));

    }

}
