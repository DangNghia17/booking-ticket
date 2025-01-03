package com.nghia.bookingevent.models.admin;

import com.nghia.bookingevent.models.account.Account;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("admin")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Admin extends Account {
    private String USDBalance;
    private String VNDBalance;


    private String USDBalanceLock;
    private String VNDBalanceLock;


}
