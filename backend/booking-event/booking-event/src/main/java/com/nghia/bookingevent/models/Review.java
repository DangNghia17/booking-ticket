package com.nghia.bookingevent.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import java.util.Date;

@Document(collection = "review")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Review {


    @Id
    @JsonIgnore
    private String id;
    @NotNull
    private String name;
    @NotNull
    private String email;

    private String avatar;
    @NotNull
    private String idEvent;
    @NotNull
    private String message;
    @Min(1)
    @Max(5)
    private int rate;
    @NotNull
    private Date createdAt;
    @Override
    public String toString() {
        return "Review{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", avatar='" + avatar + '\'' +
                ", idEvent='" + idEvent + '\'' +
                ", message='" + message + '\'' +
                ", rate=" + rate +
                ", createdAt=" + createdAt +
                '}';
    }
}
