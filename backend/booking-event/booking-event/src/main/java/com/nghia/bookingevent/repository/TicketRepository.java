package com.nghia.bookingevent.repository;

import com.nghia.bookingevent.models.ticket.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TicketRepository extends MongoRepository<Ticket,String> {

}
