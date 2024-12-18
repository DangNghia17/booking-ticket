package com.nghia.bookingevent.repository;

import com.nghia.bookingevent.models.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {
    Boolean existsByEmail(String email);
    Boolean existsByEmailAndIdEvent(String email,String idEvent);

    @Query("{ 'idEvent' : ?0 }")
    List<Review> findAllByIdEvent(String eventId);
    Page<Review> findAllByIdEvent(String idEvent, Pageable pageable);
    Optional<Review> findByEmailAndIdEvent(String email,String idEvent);
    void deleteByEmailAndIdEvent(String email, String idEvent);
}
