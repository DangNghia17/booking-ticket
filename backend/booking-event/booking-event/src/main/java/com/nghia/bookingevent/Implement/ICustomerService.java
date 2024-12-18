package com.nghia.bookingevent.Implement;

import com.nghia.bookingevent.models.Customer;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

public interface ICustomerService {
    ResponseEntity<?> findAll();
    ResponseEntity<?> createAccount(Customer newAccount);
    ResponseEntity<?> findAll(Pageable pageable);
   // ResponseEntity<?> deleteCustomer(String email);
    ResponseEntity<?> deleteAllWishList(String email);
    ResponseEntity<?> deleteItemWishList(String idItem,String email);
    ResponseEntity<?> addWishList(String idItem,String email);
    ResponseEntity<?> viewWishList(String email);
    ResponseEntity<?> followOrganizer(String idItem,String email);
    ResponseEntity<?> findFollowOrganizerList(String email);
    ResponseEntity<?> checkIsFollowedOrganizer(String userId, String organizerEmail);
    ResponseEntity<?> deleteFollowOrganizerItem(String idItem,String email);

}
