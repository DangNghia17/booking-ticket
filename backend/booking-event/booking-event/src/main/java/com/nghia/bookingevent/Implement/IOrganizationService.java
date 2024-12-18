package com.nghia.bookingevent.Implement;

import com.nghia.bookingevent.models.organization.Organization;
import com.nghia.bookingevent.models.ticket.Ticket;
import com.nghia.bookingevent.payload.request.OrganizationProfileReq;
import com.nghia.bookingevent.payload.request.OrganizationSubmitReq;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface IOrganizationService {
     ResponseEntity<?> createOrganization(Organization organization);
     ResponseEntity<?> findAll();
     ResponseEntity<?> submitOrganization(OrganizationSubmitReq organizationSubmitReq);
     ResponseEntity<?> findAll(Pageable pageable);
     ResponseEntity<?> deleteOrganization(String email);
     ResponseEntity<?> findEventsByOrganization(String email);
     ResponseEntity<?> approveOrganization(String email);
     ResponseEntity<?> refuseOrganization(String email);
     ResponseEntity<?> findOrganizationByEmail(String email);
     ResponseEntity<?> findOrganizationById(String id);
     ResponseEntity<?> updateBioAndAddress(String email, OrganizationProfileReq profileReq);
     ResponseEntity<?> removeBio(String email);
     ResponseEntity<?> createTemplateTickets(String email, List<Ticket> tickets);
     ResponseEntity<?> getTemplateTickets(String email);
     ResponseEntity<?> findOrganizationByEventid(String eventId);
     ResponseEntity<?> findTicketListByEventId(String eventId,String email);
     ResponseEntity<?> findCustomerListByEventId(String eventId,String email);
     ResponseEntity<?> statistic(String email);
     ResponseEntity<?> PaymentStatus(String email);
     ResponseEntity<?> findAllPaymentStatus();
     ResponseEntity<?> getFollowedList(String email);
     ResponseEntity<?> getStatistics(String email);

}
