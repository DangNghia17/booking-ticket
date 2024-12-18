package com.nghia.bookingevent.models;

import com.nghia.bookingevent.models.event.Event;
import lombok.Value;

import java.time.LocalDate;
import java.util.List;

@Value
public class OrderStats {
    LocalDate date;
    int orderCount;
    List<Event> eventsSold;
}
