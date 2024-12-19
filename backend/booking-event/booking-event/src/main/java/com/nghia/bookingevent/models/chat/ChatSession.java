package com.nghia.bookingevent.models.chat;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;

@Data
@Document(collection = "chat_sessions")
@CompoundIndexes({
    @CompoundIndex(name = "user_lastMessage_idx", def = "{'userId': 1, 'lastMessageAt': -1}")
})
public class ChatSession {
    @Id
    private String id;
    private String userId;
    private LocalDateTime createdAt;
    private LocalDateTime lastMessageAt;
    private String status; // "active" hoặc "closed"
    
    public ChatSession() {
        this.createdAt = LocalDateTime.now();
        this.lastMessageAt = LocalDateTime.now();
        this.status = "active";
    }
} 