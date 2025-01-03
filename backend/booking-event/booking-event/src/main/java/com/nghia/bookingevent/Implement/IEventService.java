package com.nghia.bookingevent.Implement;


import com.nghia.bookingevent.models.event.Event;
import com.nghia.bookingevent.payload.request.EventReq;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;


public interface IEventService {
    ResponseEntity<?> createEvent(EventReq eventReq, String email);
    ResponseEntity<?> findAllEvents();
    ResponseEntity<?> findEventAfterToday(Pageable pageable);
    ResponseEntity<?> findEventAfterToday();
    ResponseEntity<?> findBestSellerEvent();
    ResponseEntity<?> findEventsByProvince(String province);
    ResponseEntity<?> deleteEvent(String id,String email);
    ResponseEntity<?> findEventById(String id);

    ResponseEntity<?> searchEvents(String key);
    ResponseEntity<?> findEventListById(String id);
    ResponseEntity<?> eventPagination(Pageable pageable);
    ResponseEntity<?> checkEventStatus();

    ResponseEntity<?> updateEvent(String id,EventReq eventReq);
    ResponseEntity<?> findAllbyPage(Pageable pageable);

    ResponseEntity<?> findByProvinceAndCategoryIdAndStatusAndDate(
        String province, 
        String categoryName, 
        String status, 
        String date, 
        Integer pageNumber,
        Integer size
    );
    ResponseEntity<?> updateEventBackground(String id, MultipartFile file);

    ResponseEntity<?> upcomingEvents();
    //
    Event findEventById_Object(String id);


}
