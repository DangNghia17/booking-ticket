package com.nghia.bookingevent.repository;

import com.nghia.bookingevent.models.chat.ChatSession;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;
import java.util.List;

public interface ChatSessionRepository extends MongoRepository<ChatSession, String> {
    List<ChatSession> findByUserIdOrderByLastMessageAtDesc(String userId);
    Optional<ChatSession> findByIdAndUserId(String id, String userId);
    List<ChatSession> findByUserIdAndStatus(String userId, String status);
} 