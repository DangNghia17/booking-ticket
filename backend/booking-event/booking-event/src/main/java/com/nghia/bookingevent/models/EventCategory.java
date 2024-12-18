package com.nghia.bookingevent.models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "event_category")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EventCategory {
    @Id
    private String id;
    private String name;

    public EventCategory(String name) {
        this.name = name;
    }
}
