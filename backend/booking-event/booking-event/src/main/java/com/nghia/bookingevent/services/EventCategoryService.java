package com.nghia.bookingevent.services;

import com.nghia.bookingevent.Implement.IEventCategory;
import com.nghia.bookingevent.models.event.Event;
import com.nghia.bookingevent.models.EventCategory;
import com.nghia.bookingevent.payload.request.CategoryReq;
import com.nghia.bookingevent.payload.response.ResponseObject;
import com.nghia.bookingevent.payload.response.CategoryResponse;
import com.nghia.bookingevent.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class EventCategoryService implements IEventCategory {

    private final EventRepository eventRepository;
    
    @Override
    public ResponseEntity<?> findAll() {
        try {
            List<Event> events = eventRepository.findAll();
            Set<String> uniqueCategories = new HashSet<>();
            
            // Lấy tất cả categories từ eventCategoryList của mỗi event
            for (Event event : events) {
                if (event.getEventCategoryList() != null && !event.getEventCategoryList().isEmpty()) {
                    uniqueCategories.addAll(event.getEventCategoryList().stream()
                            .map(category -> category.getName())
                            .filter(name -> name != null && !name.trim().isEmpty())
                            .collect(Collectors.toList()));
                }
            }
            
            List<String> categoryList = new ArrayList<>(uniqueCategories).stream()
                .filter(category -> category != null && !category.trim().isEmpty())
                .sorted()
                .collect(Collectors.toList());
            
            return ResponseEntity.status(HttpStatus.OK).body(
                    new ResponseObject(true, 
                                     categoryList.size() > 0 ? "Get all Category" : "Category list is empty", 
                                     categoryList,
                                     200));
                                     
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ResponseObject(false, 
                                     "Error when finding categories: " + e.getMessage(), 
                                     null,
                                     500));
        }
    }
    @Override
    public ResponseEntity<?> addCategory(CategoryReq categoryReq)
    {
        try
        {
            // Kiểm tra xem category đã tồn tại trong bất kỳ event nào chưa
            boolean categoryExists = eventRepository.findAll().stream()
                .anyMatch(event -> event.getEventCategoryList() != null && 
                                 event.getEventCategoryList().contains(categoryReq.getName()));
            
            if (categoryExists) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    new ResponseObject(false, "Category already exists", "", 400));
            }
            
            return ResponseEntity.status(HttpStatus.OK).body(
                    new ResponseObject(true, "Add category successfully","" ,200));
        }
        catch (Exception e )
        {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ResponseObject(false, "Add category with name: "+ categoryReq.getName(), "",400));
        }
    }
    @Override
    public ResponseEntity<?> deleteCategory(CategoryReq categoryReq)
    {
        try {
            // Kiểm tra xem category có đang được sử dụng bởi event nào không
            boolean categoryInUse = eventRepository.findAll().stream()
                .anyMatch(event -> event.getEventCategoryList() != null && 
                                 event.getEventCategoryList().contains(categoryReq.getName()));
            
            if(categoryInUse) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                        new ResponseObject(false, "Cannot delete category that is in use", "", 400));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                        new ResponseObject(false, "Category not found", "", 404));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ResponseObject(false, "Delete category failed: " + e.getMessage(), "", 500));
        }
    }
}