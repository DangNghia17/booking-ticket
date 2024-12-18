package com.nghia.bookingevent.repository;

import com.nghia.bookingevent.models.Customer;
import com.nghia.bookingevent.models.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends MongoRepository<Customer,String> {
    Boolean existsByEmail(String email);
    Optional<Customer> findByEmail(String email);
    //List<Order> findByOrderList_IdEvent(String email);
    @Query("{ 'orderList.idEvent' : ?0 }")
    List<Order> findAllByOrderList_IdEvent(String idEvent);

    List<Customer> findCustomerByEmail(String email);
    //List<Order> find
    List<Customer> findByFollowList(Iterable<String>  id);
}
