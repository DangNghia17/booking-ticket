package com.nghia.bookingevent.repository;

import com.nghia.bookingevent.models.organization.Organization;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.Optional;

public interface OrganizationRepository extends MongoRepository<Organization,String> {
    void deleteByEmail(String email);
    Boolean existsByEmail(String email);
    Optional<Organization> findByEmail(String email);
    Optional<Organization> findOrganizationById(String id);
    @Query("{ 'eventList' : ?0 }")
    Optional<Organization> findOrganizationByEventId(String idEvent);
    Optional<Organization> findByEventList(String id);
    //Optional<Organization> findByCha(String id);

}
