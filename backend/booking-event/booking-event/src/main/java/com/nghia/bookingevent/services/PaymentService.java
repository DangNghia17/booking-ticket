package com.nghia.bookingevent.services;

import com.nghia.bookingevent.exception.NotFoundException;
import com.nghia.bookingevent.models.admin.Admin;
import com.nghia.bookingevent.models.EPaymentStatus;
import com.nghia.bookingevent.models.event.Event;
import com.nghia.bookingevent.models.organization.Organization;
import com.nghia.bookingevent.models.organization.PaymentPending;
import com.nghia.bookingevent.repository.AdminRepository;
import com.nghia.bookingevent.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final OrganizationRepository organizationRepository;

    private final AdminRepository adminRepository;
    public PaymentPending setPaymentToInProgress(String idEvent) {
        PaymentPending paymentPending = new PaymentPending();
        try {
            if (idEvent != null) {
                paymentPending.setIdEvent(idEvent);
                paymentPending.setStatus(EPaymentStatus.INPROGRESS);
                paymentPending.setVNDBalanceLock("0");
                paymentPending.setUSDBalanceLock("0");
            }
            return paymentPending;
        } catch (Exception e) {
            throw new NotFoundException("Can not setPaymentToInProgress " + e);
        }

    }

    public void setPaymentToCancel(List<PaymentPending> pendingList, String currency, String idEvent) {

        Optional<Admin> admin= adminRepository.findByEmail("lotusticket.vn@gmail.com");

        for (PaymentPending element : pendingList) {
            if (element.getIdEvent().equals(idEvent)) {
                element.setStatus(EPaymentStatus.CANCEL);
                if(currency.equals("USD"))
                {
                    BigDecimal usdBlock = new BigDecimal(element.getUSDBalanceLock());
                    BigDecimal adminUSD = new BigDecimal(admin.get().getVNDBalanceLock());
                    //subtract
                    admin.get().setVNDBalanceLock(adminUSD.subtract(usdBlock).toString() );
                }
                else
                {
                    BigDecimal vndBlock = new BigDecimal(element.getVNDBalanceLock());
                    BigDecimal adminVND = new BigDecimal(admin.get().getUSDBalanceLock());
                    //subtract
                    admin.get().setVNDBalanceLock(adminVND.subtract(vndBlock).toString() );

                }
                adminRepository.save(admin.get());

                return;
            }
        }
    }

    public void setPaymentToCountedVND(Organization organization, String idEvent, BigDecimal valueVND) {

        Optional<Admin> admin= adminRepository.findByEmail("lotusticket.vn@gmail.com");


        for (PaymentPending element : organization.getPaymentPendings()) {
            if (element.getIdEvent().equals(idEvent)) {
                //get VNDBlock previous
                BigDecimal vndBlock = new BigDecimal(element.getVNDBalanceLock());
                //no rounded
                BigDecimal result = vndBlock.add(valueVND);
                BigDecimal adminVND = new BigDecimal(admin.get().getVNDBalanceLock());
                //add
                admin.get().setVNDBalanceLock(adminVND.add(valueVND).toString() );
                element.setVNDBalanceLock(result.toString());
                adminRepository.save(admin.get());
                return;
            }
        }
    }

    public void setPaymentToCountedUSD(Organization organization, String idEvent, BigDecimal valueUSD) {

        Optional<Admin> admin= adminRepository.findByEmail("lotusticket.vn@gmail.com");
        for (PaymentPending element : organization.getPaymentPendings()) {
            if (element.getIdEvent().equals(idEvent)) {
                //get USDBlock previous
                BigDecimal usdBlock = new BigDecimal(element.getUSDBalanceLock());
                //
                BigDecimal result = usdBlock.add(valueUSD).setScale(2, RoundingMode.DOWN);
                BigDecimal adminUSD = new BigDecimal(admin.get().getUSDBalanceLock());
                //
                admin.get().setUSDBalanceLock(adminUSD.add(valueUSD).toString() );
                //add
                element.setUSDBalanceLock(result.toString());
                adminRepository.save(admin.get());
                return;
            }
        }
    }

    public void setPaymentToCompleted(Event event) {
        if (event == null || event.getId() == null) {
            throw new NotFoundException("Event or Event ID cannot be null");
        }

        List<Organization> organizationList = organizationRepository.findAll();
        try {
            for (Organization element : organizationList) {
                if (element != null && element.getEventList() != null && 
                    element.getEventList().contains(event.getId())) {
                    
                    if (element.getPaymentPendings() == null) {
                        continue;
                    }

                    for (PaymentPending elementPayment : element.getPaymentPendings()) {
                        if (elementPayment != null && event.getId().equals(elementPayment.getIdEvent())) {
                            System.out.println("event name payment: "+ event.getName());
                            Optional<Admin> admin = adminRepository.findByEmail("lotusticket.vn@gmail.com");
                            
                            if (!admin.isPresent()) {
                                throw new NotFoundException("Admin account not found");
                            }

                            elementPayment.setStatus(EPaymentStatus.COMPLETED);

                            BigDecimal hundred = new BigDecimal("100");
                            BigDecimal five = new BigDecimal("5");

                            if (event.getOrganizationTickets() != null && 
                                !event.getOrganizationTickets().isEmpty()) {
                                
                                if ("USD".equals(event.getOrganizationTickets().get(0).getCurrency())) {
                                    processUSDPayment(element, elementPayment, admin.get(), five, hundred);
                                } else {
                                    processVNDPayment(element, elementPayment, admin.get(), five, hundred);
                                }
                                
                                organizationRepository.save(element);
                                return;
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            throw new NotFoundException("Error processing payment: " + e.getMessage());
        }
    }

    private void processUSDPayment(Organization org, PaymentPending payment, Admin admin, 
                                   BigDecimal five, BigDecimal hundred) {
        BigDecimal totalPaymentUSD = new BigDecimal(org.getUSDBalance());
        BigDecimal usdBlock = new BigDecimal(payment.getUSDBalanceLock());
        
        BigDecimal adminFee = usdBlock.multiply(five).divide(hundred);
        BigDecimal organizerAmount = usdBlock.subtract(adminFee);
        
        admin.setUSDBalance(new BigDecimal(org.getUSDBalance())
                .add(adminFee)
                .toString());
                
        BigDecimal result = totalPaymentUSD.add(organizerAmount)
                .setScale(2, RoundingMode.DOWN);
                
        BigDecimal adminPending = new BigDecimal(admin.getUSDBalanceLock());
        admin.setUSDBalanceLock(adminPending.subtract(usdBlock).toString());
        
        adminRepository.save(admin);
        org.setUSDBalance(result.toString());
    }

    private void processVNDPayment(Organization org, PaymentPending payment, Admin admin,
                                   BigDecimal five, BigDecimal hundred) {
        BigDecimal totalPaymentVND = new BigDecimal(org.getVNDBalance());
        BigDecimal vndBlock = new BigDecimal(payment.getVNDBalanceLock());
        
        BigDecimal adminFee = vndBlock.multiply(five).divide(hundred);
        BigDecimal organizerAmount = vndBlock.subtract(adminFee);
        
        BigDecimal adminBalance = new BigDecimal(org.getVNDBalance());
        admin.setVNDBalance(adminBalance.add(adminFee).toString());
        
        BigDecimal result = totalPaymentVND.add(organizerAmount)
                .setScale(2, RoundingMode.DOWN);
                
        BigDecimal adminMoney = new BigDecimal(admin.getVNDBalanceLock());
        admin.setVNDBalanceLock(adminMoney.subtract(vndBlock).toString());
        
        adminRepository.save(admin);
        org.setVNDBalance(result.toString());
    }
}
