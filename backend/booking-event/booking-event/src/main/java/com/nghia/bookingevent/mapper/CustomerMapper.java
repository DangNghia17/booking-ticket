package com.nghia.bookingevent.mapper;

import com.nghia.bookingevent.models.Customer;
import com.nghia.bookingevent.models.account.Account;
import com.nghia.bookingevent.payload.response.FollowedListRes;
import com.nghia.bookingevent.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor

public class CustomerMapper {
    private final AccountRepository accountRepository;

    public FollowedListRes toFollowedListRes(Customer customer) {
        Optional <Account> account = accountRepository.findByEmail(customer.getEmail());
        return new FollowedListRes(account.get().getName(),customer.getEmail());
    }
}
