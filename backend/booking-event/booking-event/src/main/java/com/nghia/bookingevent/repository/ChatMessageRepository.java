package com.nghia.bookingevent.repository;

import com.nghia.bookingevent.models.chat.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findBySessionIdOrderByTimestampAsc(String sessionId);
    List<ChatMessage> findByUserIdOrderByTimestampDesc(String userId);
} 