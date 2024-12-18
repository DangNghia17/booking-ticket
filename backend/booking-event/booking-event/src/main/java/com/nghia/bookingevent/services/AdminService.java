package com.nghia.bookingevent.services;

import com.nghia.bookingevent.models.admin.Admin;
import com.nghia.bookingevent.payload.response.ResponseObject;
import com.nghia.bookingevent.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminService  {
    private final AdminRepository adminRepository;

    public ResponseEntity<?> findAccountByEmail(String email) {

        Optional<Admin> account = adminRepository.findByEmail(email);
        if (account.isPresent()) {
            return ResponseEntity.status(HttpStatus.OK).body(
                    new ResponseObject(true, "show data successfully ", account,200));

        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ResponseObject(false, "Cannot find data with gmail:" + email, "",404));
        }
    }
    public ResponseEntity<?> findAccountById(String id) {
        Optional<Admin> account = adminRepository.findById(id);
        if(account.isPresent()){
            return ResponseEntity.status(HttpStatus.OK).body(
                    new ResponseObject(true, "show data successfully", account, 200));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ResponseObject(false, "Cannot find data with id:" + id , new Object(),404));
        }
    }



}
