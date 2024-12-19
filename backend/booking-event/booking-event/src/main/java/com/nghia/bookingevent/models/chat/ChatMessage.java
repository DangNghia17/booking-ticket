package com.nghia.bookingevent.models.chat;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;

@Data
@Document(collection = "chat_messages")
@CompoundIndexes({
    @CompoundIndex(name = "session_timestamp_idx", def = "{'sessionId': 1, 'timestamp': 1}"),
    @CompoundIndex(name = "user_timestamp_idx", def = "{'userId': 1, 'timestamp': 1}")
})
public class ChatMessage {
    @Id
    private String id;
    private String sessionId;
    private String userId;
    private String role; // "user", "assistant", "system"
    private String content;
    private LocalDateTime timestamp;
    
    public ChatMessage() {
        this.timestamp = LocalDateTime.now();
    }
} 