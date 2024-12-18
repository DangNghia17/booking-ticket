package com.nghia.bookingevent.repository;

import com.nghia.bookingevent.models.EventCategory;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface EventCategoryRepository extends MongoRepository<EventCategory,String> {
    Optional<EventCategory> findById(String id);
    Optional<EventCategory> findByName(String name);

}
