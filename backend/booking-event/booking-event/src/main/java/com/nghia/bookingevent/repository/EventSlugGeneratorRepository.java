package com.nghia.bookingevent.repository;


import com.nghia.bookingevent.models.event.EventSlug;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface EventSlugGeneratorRepository extends MongoRepository<EventSlug, String> {

    Optional<EventSlug> findById(String id);
}
