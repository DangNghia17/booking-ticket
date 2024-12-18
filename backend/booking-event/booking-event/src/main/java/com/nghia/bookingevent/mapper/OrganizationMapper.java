package com.nghia.bookingevent.mapper;

import com.nghia.bookingevent.models.EPaymentStatus;
import com.nghia.bookingevent.models.account.Account;
import com.nghia.bookingevent.models.event.Event;
import com.nghia.bookingevent.models.organization.Organization;
import com.nghia.bookingevent.models.organization.PaymentPending;
import com.nghia.bookingevent.payload.response.*;
import com.nghia.bookingevent.repository.AccountRepository;
import com.nghia.bookingevent.repository.EventRepository;
import com.nghia.bookingevent.payload.response.AllOrganizationRes;
import com.nghia.bookingevent.payload.response.FollowedListRes;
import com.nghia.bookingevent.payload.response.PaymentPendingResponse;
import com.nghia.bookingevent.payload.response.PaymentStatusRes;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrganizationMapper {
    private final AccountRepository accountRepository;
    private final EventRepository eventRepository;

    public AllOrganizationRes toOrganizationRes(Organization organization) {
        Optional<Account> account= accountRepository.findByEmail(organization.getEmail());
        if(account.isPresent())
        {
            return new AllOrganizationRes(account.get().getName(),organization);
        }
        return new AllOrganizationRes();
    }
    public PaymentStatusRes toPaymentStatusList(Organization organization) {
        return new PaymentStatusRes(organization.getEmail(),organization.getPaymentPendings());
    }
    public PaymentPendingResponse toPaymentPending(PaymentPending paymentPending) {
        Optional<Event> event = eventRepository.findEventById(paymentPending.getIdEvent());
        if(event.isPresent())
        {
            return new PaymentPendingResponse(event.get().getName(),paymentPending.getUSDBalanceLock(),paymentPending.getVNDBalanceLock(),paymentPending.getStatus());

        }
        else
            return new PaymentPendingResponse("null","null","null", EPaymentStatus.CANCEL);
    }
    public FollowedListRes toFollowedListRes(Organization organization) {
        return new FollowedListRes();
    }
}
