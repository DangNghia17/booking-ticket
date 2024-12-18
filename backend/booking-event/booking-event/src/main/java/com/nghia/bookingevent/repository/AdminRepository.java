package com.nghia.bookingevent.repository;

import com.nghia.bookingevent.models.admin.Admin;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface AdminRepository extends MongoRepository<Admin,String> {
    Optional<Admin> findByEmail(String email);

}
