package com.nghia.bookingevent.services;

import com.nghia.bookingevent.Implement.IEventService;
import com.nghia.bookingevent.Implement.IEventSlugGeneratorService;
import com.nghia.bookingevent.config.CloudinaryConfig;
import com.nghia.bookingevent.exception.AppException;
import com.nghia.bookingevent.exception.NotFoundException;
import com.nghia.bookingevent.mapper.AccountMapper;
import com.nghia.bookingevent.mapper.EventMapper;
import com.nghia.bookingevent.mapper.OrderMapper;
import com.nghia.bookingevent.models.Customer;
import com.nghia.bookingevent.models.Order;
import com.nghia.bookingevent.models.account.Account;
import com.nghia.bookingevent.models.dto.EventPreviewDto;
import com.nghia.bookingevent.models.event.Event;
import com.nghia.bookingevent.models.event.EventStatus;
import com.nghia.bookingevent.models.organization.Organization;
import com.nghia.bookingevent.models.organization.PaymentPending;
import com.nghia.bookingevent.models.ticket.Ticket;
import com.nghia.bookingevent.payload.request.EventReq;
import com.nghia.bookingevent.payload.response.EventViewResponse;
import com.nghia.bookingevent.payload.response.PaginationResponse;
import com.nghia.bookingevent.payload.response.ResponseObject;
import com.nghia.bookingevent.payload.response.ResponseObjectWithPagination;
import com.nghia.bookingevent.repository.*;
import com.nghia.bookingevent.services.mail.EMailType;
import com.nghia.bookingevent.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.TextCriteria;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

import static com.nghia.bookingevent.utils.DateUtils.*;
import static com.nghia.bookingevent.utils.Utils.*;

@Service
@RequiredArgsConstructor
public class EventService implements IEventService {

    private final EventRepository eventRepository;
    private final OrderRepository orderRepository;

    private final MongoTemplate mongoTemplate;
    private final OrganizationRepository organizationRepository;
    private final EventMapper eventMapper;
    private final OrderMapper orderMapper;

    private final IEventSlugGeneratorService slugGeneratorService;
    private final CloudinaryConfig cloudinary;
    private final PaymentService paymentService;
    private final CustomerRepository customerRepository;
    private final MailService mailService;

    private final AccountMapper accountMapper;
    private final AccountRepository accountRepository;

    @SneakyThrows
    @Override
    public ResponseEntity<?> createEvent(EventReq eventReq, String email) {
        Optional<Organization> organization = organizationRepository.findByEmail(email);
        if (organization.isPresent()) {
            // handle events
            int randomNum = ThreadLocalRandom.current().nextInt(1000, 30000 + 1);
            String idSlung = slugGeneratorService.generateSlug(toSlug(eventReq.getName() + "-" + randomNum));
            Event event = new Event(eventReq);
            event.setId(idSlung);
            event.setCreatedDate(new Date());
            event.setStatus(EventStatus.AVAILABLE);
            event.setModifyTimes(0);
            //
            eventRepository.save(event);
            //add event in organization
            //add payment pending when not finished
            organization.get().getEventList().add(event.getId());
            PaymentPending paymentPending = paymentService.setPaymentToInProgress(idSlung);
            organization.get().getPaymentPendings().add(paymentPending);
            //save organization
            organizationRepository.save(organization.get());
            //send email
            List<String> ids = Collections.singletonList(email);
            List<Customer> customerListForSending = customerRepository.findByFollowList(ids);
            List<Account> accountList = customerListForSending.stream().map(accountMapper::toAccount).collect(Collectors.toList());
            //get account information of organizer
            Optional<Account> account = accountRepository.findByEmail(email);
            Map<String, String> map = new HashMap<>();
            map.put("id", event.getId());
            map.put("eventName", event.getName());
            mailService.sendMailWhenCreatingEvent(accountList, map, account.get().getName(), EMailType.NEW_EVENT);
            return ResponseEntity.status(HttpStatus.OK).body(
                    new ResponseObject(true, "Save event successfully ", idSlung, 200));


        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ResponseObject(false, "Save event fail", "", 400));
        }

    }

    @Override
    public ResponseEntity<?> findAllbyPage(Pageable pageable) {
        Page<Event> eventPage = eventRepository.findAll(pageable);
        List<Event> eventList = eventPage.toList();
        if (eventList.size() > 0)
            return ResponseEntity.status(HttpStatus.OK).body(
                    new ResponseObject(true, "Get all user success", eventList, 200));
        throw new NotFoundException("Can not find any organization");
    }

    @Override
    public ResponseEntity<?> eventPagination(Pageable pageable) {
        List<Event> events = sortEventByDateAsc(eventRepository.findAll());
        Page<Event> eventPage = (Page<Event>) toPage(events, pageable);
        List<Event> eventsPerPage = eventPage.toList();

        if (eventsPerPage.size() > 0)
            return ResponseEntity.status(HttpStatus.OK).body(
                    new ResponseObjectWithPagination(true, "Successfully show data", pageable.getPageNumber(), pageable.getPageSize(), eventRepository.findAll().size(), eventsPerPage));
        throw new NotFoundException("Can not find any event");
    }

    @Override
    public ResponseEntity<?> checkEventStatus() {
        try {
            List<Event> events = sortEventByDateAsc(eventRepository.findAll());
            List<Event> updatedEvents = new ArrayList<>();
            
            for (Event event : events) {
                // Skip invalid events
                if (!isValidEventForUpdate(event)) {
                    System.out.println("Bỏ qua event không hợp lệ: " + (event != null ? event.getId() : "null"));
                    continue;
                }
                
                try {
                    boolean needsSave = false;
                    Event originalEvent = eventRepository.findById(event.getId()).orElse(null);
                    
                    if (originalEvent == null) {
                        System.out.println("Không tìm thấy event gốc với id: " + event.getId());
                        continue;
                    }
                    
                    // Kiểm tra số lượng vé
                    if (originalEvent.getTicketRemaining() == 0 && 
                        originalEvent.getStatus() != EventStatus.SOLD_OUT) {
                        originalEvent.setStatus(EventStatus.SOLD_OUT);
                        needsSave = true;
                    }
                    
                    // Kiểm tra ngày kết thúc
                    if (originalEvent.getEndingDate() != null && 
                        isBeforeToday(originalEvent.getEndingDate()) && 
                        originalEvent.getStatus() == EventStatus.AVAILABLE) {
                        
                        originalEvent.setStatus(EventStatus.COMPLETED);
                        needsSave = true;
                        
                        // Xử lý payment pending riêng biệt
                        try {
                            if (hasPaymentPending(originalEvent)) {
                                paymentService.setPaymentToCompleted(originalEvent);
                            }
                        } catch (Exception e) {
                            System.err.println("Lỗi xử lý payment cho event " + originalEvent.getId() + ": " + e.getMessage());
                        }
                    }
                    
                    // Chỉ lưu nếu có thay đổi và event hợp lệ
                    if (needsSave) {
                        updatedEvents.add(originalEvent);
                    }
                    
                } catch (Exception e) {
                    System.err.println("Lỗi xử lý event " + event.getId() + ": " + e.getMessage());
                    e.printStackTrace();
                }
            }
            
            // Batch save tất cả events đã thay đổi
            if (!updatedEvents.isEmpty()) {
                try {
                    eventRepository.saveAll(updatedEvents);
                    System.out.println("Đã cập nhật thành công " + updatedEvents.size() + " events");
                } catch (Exception e) {
                    System.err.println("Lỗi khi lưu các events: " + e.getMessage());
                    e.printStackTrace();
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                        new ResponseObject(false, "Error saving events: " + e.getMessage(), null, 500)
                    );
                }
            }
            
            return ResponseEntity.ok().body(
                new ResponseObject(true, "Event status checked successfully", null, 200)
            );
            
        } catch (Exception e) {
            System.err.println("Lỗi tổng thể: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ResponseObject(false, "Error checking event status: " + e.getMessage(), null, 500)
            );
        }
    }

    // Thêm method kiểm tra event hợp lệ cho việc update
    private boolean isValidEventForUpdate(Event event) {
        return event != null 
            && event.getId() != null 
            && !event.getId().isEmpty()
            && event.getStatus() != null
            && event.getTicketRemaining() >= 0
            && event.getEndingDate() != null;
    }

    private boolean hasPaymentPending(Event event) {
        if (!isValidEventForUpdate(event)) {
            return false;
        }
        
        try {
            List<Organization> organizations = organizationRepository.findAll();
            for (Organization org : organizations) {
                if (org != null 
                    && org.getEventList() != null 
                    && !org.getEventList().isEmpty()
                    && org.getEventList().contains(event.getId()) 
                    && org.getPaymentPendings() != null) {
                    
                    return org.getPaymentPendings().stream()
                        .filter(Objects::nonNull)
                        .filter(payment -> payment.getIdEvent() != null)
                        .anyMatch(payment -> event.getId().equals(payment.getIdEvent()));
                }
            }
        } catch (Exception e) {
            System.err.println("Lỗi kiểm tra payment pending cho event " + event.getId() + ": " + e.getMessage());
        }
        return false;
    }

    @Override
    public ResponseEntity<?> findAllEvents() {
        try {
            List<Event> events = sortEventByDateAsc(eventRepository.findAll());
            List<EventViewResponse> eventRes = events.stream()
                .filter(event -> !event.getStatus().equals(EventStatus.DELETED))
                .map(eventMapper::toEventRes)
                .collect(Collectors.toList());
            
            return ResponseEntity.status(HttpStatus.OK).body(
                new ResponseObject(true, "Show data successfully ", eventRes, 200));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ResponseObject(false, "Error processing dates: " + e.getMessage(), null, 500));
        }
    }

    @Override
    public ResponseEntity<?> findEventAfterToday(Pageable pageable) {

        List<Event> eventList = getEventAfterTodayList();
        // get all highlight events
        getEventAfterTodayList();
        // Create a Page object with the eventList and pageable
        Page<Event> eventPage = (Page<Event>) toPage(eventList, pageable);

        // Retrieve the content and pagination information from the Page object
        List<Event> paginatedEvents = eventPage.getContent();
        int totalPages = eventPage.getTotalPages();
        long totalElements = eventPage.getTotalElements();

        // Create a custom response object with pagination information
        PaginationResponse<EventViewResponse> paginationResponse = new PaginationResponse<>();
        paginationResponse.setContent(paginatedEvents.stream().map(eventMapper::toEventRes).collect(Collectors.toList()));
        paginationResponse.setPage(pageable.getPageNumber());
        paginationResponse.setSize(pageable.getPageSize());
        paginationResponse.setTotalElements(totalElements);
        paginationResponse.setTotalPages(totalPages);

        return ResponseEntity.status(HttpStatus.OK).body(
                new ResponseObject(true, "Show data successfully", paginationResponse, 200));
    }

    @Override
    public ResponseEntity<?> findEventAfterToday() {
        List<Event> eventList = getEventAfterTodayList();
        
        List<EventViewResponse> eventRes = eventList.stream()
            .map(eventMapper::toEventRes)
            .collect(Collectors.toList());
        
        return ResponseEntity.status(HttpStatus.OK).body(
                new ResponseObject(true, "Show data successfully", eventRes, 200));
    }

    private List<Event> getEventAfterTodayList() {
        // Điều kiện:
        // 1. endingDate phải sau hoặc bằng ngày hiện tại (isAfterToday)
        // 2. status không phải là DELETED
        List<Event> events = sortEventByDateAsc(eventRepository.findAll());
        List<Event> eventList = new ArrayList<>();
        for (Event event : events) {
            if (isAfterToday(event.getEndingDate()) && !event.getStatus().equals(EventStatus.DELETED)) {
                eventList.add(event);
            }
        }
        return eventList;
    }

    @Override
    public ResponseEntity<?> findBestSellerEvent() {
        List<Event> events = sortEventByDateAsc(eventRepository.findAll());
        List<Event> eventList = new ArrayList<>();
        
        for (Event event : events) {
            float soldRatio = (float) (event.getTicketTotal() - event.getTicketRemaining()) / event.getTicketTotal();
            if (soldRatio >= 0.5 
                && event.getStatus().equals(EventStatus.AVAILABLE)
                && isAfterToday(event.getStartingDate())) {
                eventList.add(event);
            }
        }
        
        List<EventViewResponse> eventRes = eventList.stream()
            .filter(event -> !event.getStatus().equals(EventStatus.DELETED))
            .map(eventMapper::toEventRes)
            .collect(Collectors.toList());
        
        return ResponseEntity.status(HttpStatus.OK).body(
                new ResponseObject(true, "Show data successfully", eventRes, 200));
    }

    private boolean isAfterToday(String dateStr) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            LocalDate date = LocalDate.parse(dateStr, formatter);
            return date.isAfter(LocalDate.now()) || date.isEqual(LocalDate.now());
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public ResponseEntity<?> findEventsByProvince(String province) {

        List<Event> eventList = sortEventByDateAsc(eventRepository.findAllByProvince(province));
        List<EventViewResponse> eventRes = eventList.stream().filter(event -> !event.getStatus().equals(EventStatus.DELETED)).map(eventMapper::toEventRes).collect(Collectors.toList());

        return ResponseEntity.status(HttpStatus.OK).body(
                new ResponseObject(true, "Show data successfully", eventRes, 200));

    }

    @SneakyThrows
    @Override
    public ResponseEntity<?> deleteEvent(String id, String email) {
        try {
            Optional<Organization> organization = organizationRepository.findByEmail(email);
            Optional<Event> event = eventRepository.findEventById(id);
            
            if (!organization.isPresent() || !event.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ResponseObject(false, "Organization or Event not found", "", 404));
            }

            // Remove event ID from organization's eventList
            List<String> eventList = organization.get().getEventList();
            eventList.remove(id);
            organization.get().setEventList(eventList);

            // Change event status to DELETED
            event.get().setStatus(EventStatus.DELETED);

            // Handle refunds and notifications only if event hasn't ended
            Optional<Account> organizerAccount = accountRepository.findByEmail(organization.get().getEmail());
            if (organizerAccount.isPresent() && !isBeforeToday(event.get().getEndingDate())) {
                List<Order> orders = orderRepository.findAllByIdEvent(id);
                
                // Chỉ xử lý payment và gửi email nếu có orders
                if (!orders.isEmpty()) {
                    paymentService.setPaymentToCancel(
                        organization.get().getPaymentPendings(), 
                        orders.get(0).getCurrency(), 
                        id
                    );
                    
                    Map<String, String> map = new HashMap<>();
                    map.put("id", event.get().getId());
                    map.put("eventName", event.get().getName());
                    
                    mailService.sendMailWhenDeletingEvent(
                        orders, 
                        map, 
                        organizerAccount.get().getName(), 
                        EMailType.DELETE_EVENT
                    );
                }
            }

            // Save changes
            organizationRepository.save(organization.get());
            eventRepository.save(event.get());

            return ResponseEntity.status(HttpStatus.OK).body(
                new ResponseObject(true, "Delete event successfully", "", 200));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ResponseObject(false, "Error deleting event: " + e.getMessage(), "", 500));
        }
    }

    @SneakyThrows
    @Override
    public ResponseEntity<?> updateEvent(String id, EventReq eventReq) {

        Optional<Event> event = eventRepository.findById(id);
        if (event.isPresent()) {
            if (event.get().getModifyTimes() >= 2) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                        new ResponseObject(false, "Exceed modifyTime ", "", 404));
            }
            event.get().setName(eventReq.getName());
            event.get().setUpdatedDate(new Date());
            event.get().setProvince(eventReq.getProvince());
            event.get().setVenue(eventReq.getVenue());
            event.get().setVenue_address(eventReq.getVenue_address());
            //
            event.get().setStartingTime(eventReq.getStartingTime());
            event.get().setEndingTime(eventReq.getEndingTime());
            event.get().setStartingDate(eventReq.getStartingDate());
            event.get().setEndingDate(eventReq.getEndingDate());
            //
            event.get().setHost_id(eventReq.getHost_id());
            event.get().setDescription(eventReq.getDescription());
            event.get().setEventCategoryList(eventReq.getEventCategoryList());
            //event.get().setOrganizationTickets(eventReq.getOrganizationTickets());
            event.get().setCreatedDate(event.get().getCreatedDate());
            event.get().setModifyTimes(event.get().getModifyTimes() + 1);
            //
            //int updateTotal = 0;


            for (Ticket ticket : eventReq.getOrganizationTickets())
            {
                for(Ticket eventTicketType: event.get().getOrganizationTickets())
                {
                    int fluctutation = 0;
                    if(ticket.getId().equals(eventTicketType.getId()))
                    {
                        if(ticket.getQuantity() > eventTicketType.getQuantity())
                        {
                            fluctutation = ticket.getQuantity()- eventTicketType.getQuantity();
                            eventTicketType.setQuantityRemaining( eventTicketType.getQuantityRemaining() + fluctutation);
                            eventTicketType.setQuantity( ticket.getQuantity());
                        }
                        else if(ticket.getQuantity() < eventTicketType.getQuantity())
                        {
                            fluctutation = eventTicketType.getQuantity()- ticket.getQuantity();
                            eventTicketType.setQuantityRemaining( eventTicketType.getQuantityRemaining() - fluctutation);
                            eventTicketType.setQuantity( ticket.getQuantity());
                        }
                    }
                }
                //updateTotal += ticket.getQuantity();
            }
            if(event.get().getTicketTotal() != eventReq.getTicketTotal() )
            {
                int fluctutation = 0;
                if(eventReq.getTicketTotal() > event.get().getTicketTotal())
                {
                    fluctutation = eventReq.getTicketTotal() - event.get().getTicketTotal();
                    event.get().setTicketRemaining(event.get().getTicketRemaining() + fluctutation);
                }
                else
                {
                    fluctutation = event.get().getTicketTotal()- eventReq.getTicketTotal() ;
                    event.get().setTicketRemaining(event.get().getTicketRemaining() - fluctutation);
                }
                event.get().setTicketTotal(eventReq.getTicketTotal());
            }

            //transfer Order to account
            List<Order> orders = orderRepository.findAllByIdEvent(id);
            List<Account> accountOfCustomerBoughtList = orders.stream().map(orderMapper::toAccount).collect(Collectors.toList());
            //
            Optional<Organization> organization = organizationRepository.findByEventList(id);
            Optional<Account> account = accountRepository.findByEmail(organization.get().getEmail());
            if (account.isPresent()) {
                Map<String, String> map = new HashMap<>();
                map.put("id", event.get().getId());
                map.put("eventName", event.get().getName());
                mailService.sendMailWhenUpdatingEvent(accountOfCustomerBoughtList, map, account.get().getName(), EMailType.UPDATE_EVENT);
            }

            eventRepository.save(event.get());
            return ResponseEntity.status(HttpStatus.OK).body(
                    new ResponseObject(true, "Update event successfully ", "", 200));

        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ResponseObject(false, "Update data fail with id:" + id, "", 404));
        }
    }

    @SneakyThrows
    @Override
    public ResponseEntity<?> updateEventBackground(String id, MultipartFile file) {

        try {
            Optional<Event> event = eventRepository.findById(id);
            if (event.isPresent()) {

                //&& (file != null && !file.isEmpty())
                String imgUrl = cloudinary.uploadImage(file, event.get().getBackground());
                event.get().setBackground(imgUrl);
                eventRepository.save(event.get());
                return ResponseEntity.status(HttpStatus.OK).body(
                        new ResponseObject(true, "Update background successfully ", "", 200));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                        new ResponseObject(false, "Update background  fail with id event:" + id, "", 404));
            }
        } catch (IOException e) {
            throw new AppException(HttpStatus.EXPECTATION_FAILED.value(), "Error when upload image");
        }


    }

    @Override
    public ResponseEntity<?> upcomingEvents() {

        LocalDate currentDate = LocalDate.now();
        LocalDate nextOneWeek = currentDate.plusDays(7);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        List<Event> eventPreviews = new ArrayList<>();
        for (Event event : eventRepository.findAll()) {
            if (LocalDate.parse(event.getStartingDate(), formatter).isBefore(currentDate) && LocalDate.parse(event.getStartingDate(), formatter).isAfter(nextOneWeek)) {
                eventPreviews.add(event);
            }
        }

        List<EventPreviewDto> upcomingEvents = eventPreviews.stream()
                .map(event -> new EventPreviewDto(event.getName(), event.getBackground(), event.getStartingDate(), event.getTicketTotal(), event.getTicketRemaining(), event.getEventCategoryList()))
                .collect(Collectors.toList());
        if (!upcomingEvents.isEmpty()) {
            return ResponseEntity.status(HttpStatus.OK).body(
                    new ResponseObject(false, "Upcoming events fetched successfully", upcomingEvents, 200));

        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ResponseObject(false, "Upcoming event is empty", new ArrayList<>(), 404));

        }
    }

    @Override
    public ResponseEntity<?> searchEvents(String key) {
        try {
            // Tạo text criteria với language support
            TextCriteria criteria = TextCriteria
                .forDefaultLanguage()
                .matchingAny(key);

            // Tìm events và sort theo text score
            List<Event> eventList = mongoTemplate.find(
                Query.query(criteria)
                    .with(Sort.by(Sort.Direction.DESC, "score")), 
                Event.class
            );

            if (!eventList.isEmpty()) {
                List<EventViewResponse> eventRes = eventList.stream()
                    .filter(event -> !event.getStatus().equals(EventStatus.DELETED))
                    .map(eventMapper::toEventRes)
                    .collect(Collectors.toList());
                    
                return ResponseEntity.status(HttpStatus.OK).body(
                    new ResponseObject(true, "Search " + key + " success", eventRes, 200));
            }
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new ResponseObject(false, "No events found for: " + key, null, 404));
                
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ResponseObject(false, "Error searching events: " + e.getMessage(), null, 500));
        }
    }


    @Override
    public ResponseEntity<?> findEventById(String id) {

        Optional<Event> event = eventRepository.findById(id);
        if (event.isPresent()) {
            return ResponseEntity.status(HttpStatus.OK).body(
                    new ResponseObject(true, "find data successfully with name:" + id, eventRepository.findById(id), 200));

        }
        throw new NotFoundException("Can not found any product with id: " + id);
    }
    @Override
    public Event findEventById_Object(String id) {

        Optional<Event> event = eventRepository.findById(id);
        if (event.isPresent()) {
            return event.get();
        }
        throw new NotFoundException("Can not found any product with id: " + id);
    }
    @Override
    public ResponseEntity<?> findEventListById(String id) {

        Optional<Event> event = eventRepository.findById(id);
        if (event.isPresent()) {
            return ResponseEntity.status(HttpStatus.OK).body(
                    new ResponseObject(true, "Can not find data with name:" + id, eventRepository.findById(id), 404));

        }
        throw new NotFoundException("Can not found any product with id: " + id);
    }


    @Override
    public ResponseEntity<?> findByProvinceAndCategoryIdAndStatusAndDate(
        String province, 
        String categoryName, 
        String status, 
        String date, 
        Integer pageNumber,
        Integer size) {
        
        Query query = new Query();
        Criteria criteria = new Criteria();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        List<Criteria> andCriteria = new ArrayList<>();
        
        if (province != null) {
            if (!province.equals("others")) {
                andCriteria.add(Criteria.where("province").is(province));
            } else {
                andCriteria.add(Criteria.where("province").ne("TP. Hồ Chí Minh"));
                andCriteria.add(Criteria.where("province").ne("Hà Nội"));
            }
        }
        
        if (categoryName != null) {
            andCriteria.add(Criteria.where("eventCategoryList").elemMatch(
                Criteria.where("name").is(categoryName)
            ));
        }
        
        if (status != null) {
            andCriteria.add(Criteria.where("status").is(status));
        }
        
        if (!andCriteria.isEmpty()) {
            criteria.andOperator(andCriteria.toArray(new Criteria[0]));
            query.addCriteria(criteria);
        }
        
        List<Event> eventList;
        if (province == null && categoryName == null && status == null) {
            eventList = sortEventByDateAsc(eventRepository.findAll());
        } else {
            System.out.println("Query: " + query.toString());
            eventList = sortEventByDateAsc(mongoTemplate.find(query, Event.class));
            System.out.println("Found events: " + eventList.size());
        }
        
        if (date != null) {
            if (date.equals("this_week")) {
                LocalDate startOfWeek = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                LocalDate endOfWeek = startOfWeek.plusDays(6);
                eventList = filterEventsByDateRange(eventList, startOfWeek, endOfWeek);
            } else if (date.equals("this_month")) {
                LocalDate startOfMonth = LocalDate.now().with(TemporalAdjusters.firstDayOfMonth());
                LocalDate endOfMonth = LocalDate.now().with(TemporalAdjusters.lastDayOfMonth());
                eventList = filterEventsByDateRange(eventList, startOfMonth, endOfMonth);
            } else if (date.startsWith("range:")) {
                String[] range = date.split(":");
                if (range.length == 3) {
                    String startDate = range[1];
                    String endDate = range[2];
                    eventList = filterEventsByDateRange(eventList, LocalDate.parse(startDate, formatter), LocalDate.parse(endDate, formatter));
                }
            } else {
                String startDate = "01/01/1000";
                String endDate = "31/12/2999";
                eventList = filterEventsByDateRange(eventList, LocalDate.parse(startDate, formatter), LocalDate.parse(endDate, formatter));

            }
        }
        List<EventViewResponse> eventRes = eventList.stream()
            .filter(event -> !event.getStatus().equals(EventStatus.DELETED))
            .map(eventMapper::toEventRes)
            .collect(Collectors.toList());
        
        if (size != null && size > 0) {
            eventRes = eventRes.subList(0, Math.min(size, eventRes.size()));
        }

        return ResponseEntity.status(HttpStatus.OK).body(
            new ResponseObject(true, "Successfully query data", eventRes, 200));
    }

    public int getPreviousDayEventCount(String email) {

        Optional<Organization> organization = organizationRepository.findByEmail(email);
        List<Event> events = new ArrayList<>();
        for (String eventId : organization.get().getEventList()) {
            events.add(eventRepository.findEventById(eventId).get());
        }
        LocalDate yesterday = LocalDate.now().minusDays(1);
        LocalDateTime startOfYesterday = yesterday.atStartOfDay();
        LocalDateTime startOfPast = LocalDateTime.of(2000, 1, 1, 0, 0, 0);

        Date startOfYesterdayDate = Date.from(startOfYesterday.atZone(ZoneId.systemDefault()).toInstant());
        Date startOfPastDate = Date.from(startOfPast.atZone(ZoneId.systemDefault()).toInstant());

        long eventCount = events.stream()
                .filter(event -> event.getCreatedDate().after(startOfPastDate) &&
                        event.getCreatedDate().before(startOfYesterdayDate))
                .count();

        return (int) eventCount;
    }


    // filter by date

    public List<Event> filterEventsByDateRange(List<Event> events, LocalDate startDate, LocalDate endDate) {
        return events.stream()
                .filter(event -> convertStringToDate(event.getStartingDate()).isAfter(startDate) && convertStringToDate(event.getStartingDate()).isBefore(endDate))
                .collect(Collectors.toList());
    }

    private List<Event> sortEventByDateAsc(List<Event> events) {
        DateTimeFormatter[] formatters = {
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),
            DateTimeFormatter.ISO_DATE_TIME
        };
        
        return events.stream()
            .sorted((e1, e2) -> {
                LocalDateTime date1 = parseDate(e1.getStartingDate(), formatters);
                LocalDateTime date2 = parseDate(e2.getStartingDate(), formatters);
                return date1.compareTo(date2);
            })
            .collect(Collectors.toList());
    }

    private LocalDateTime parseDate(String dateStr, DateTimeFormatter[] formatters) {
        for (DateTimeFormatter formatter : formatters) {
            try {
                if (dateStr.contains("T")) {
                    return LocalDateTime.parse(dateStr, formatter);
                } else {
                    return LocalDate.parse(dateStr, formatter).atStartOfDay();
                }
            } catch (Exception e) {
                continue;
            }
        }
        throw new IllegalArgumentException("Cannot parse date: " + dateStr);
    }
}
