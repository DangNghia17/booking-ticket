package com.nghia.bookingevent.mapper;

import com.nghia.bookingevent.models.Order;
import com.nghia.bookingevent.models.account.Account;
import com.nghia.bookingevent.repository.AccountRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;
@AllArgsConstructor
@Service
public class OrderMapper {
    private final AccountRepository accountRepository;

    public Account toAccount(Order order)
    {
        Optional<Account>account =  accountRepository.findByEmail(order.getEmail());
        return account.get();

    }
}
