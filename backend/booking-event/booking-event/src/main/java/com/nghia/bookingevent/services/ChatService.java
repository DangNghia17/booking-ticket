package com.nghia.bookingevent.services;

import com.nghia.bookingevent.models.chat.ChatMessage;
import com.nghia.bookingevent.models.chat.ChatSession;
import com.nghia.bookingevent.repository.ChatMessageRepository;
import com.nghia.bookingevent.repository.ChatSessionRepository;
import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatCompletionResult;
import com.theokanning.openai.service.OpenAiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChatService {
    private static final Logger logger = LoggerFactory.getLogger(ChatService.class);
    
    @Value("${openai.api.key}")
    private String apiKey;
    
    private final ChatMessageRepository messageRepository;
    private final ChatSessionRepository sessionRepository;
    private final String MODEL_ID = "ft:gpt-3.5-turbo-1106:personal:lotus-ticket-chatbot:Ag7UfYvO";
    private OpenAiService openAiService;
    private final Map<String, LocalDateTime> lastMessageTime = new ConcurrentHashMap<>();
    private static final Duration MESSAGE_COOLDOWN = Duration.ofSeconds(1);
    
    public ChatService(ChatMessageRepository messageRepository, 
                      ChatSessionRepository sessionRepository) {
        this.messageRepository = messageRepository;
        this.sessionRepository = sessionRepository;
    }

    @PostConstruct
    public void init() {
        this.openAiService = new OpenAiService(apiKey);
    }

    public ChatMessage sendMessage(String userId, String sessionId, String content) {
        try {
            // Input validation
            validateInput(userId, sessionId, content);
            checkRateLimit(userId);
            
            logger.info("Processing message - userId: {}, sessionId: {}", userId, sessionId);

            // Create or get session
            ChatSession session = getOrCreateSession(userId, sessionId);

            // Save user message
            ChatMessage userMessage = saveUserMessage(userId, session.getId(), content);
            logger.debug("Saved user message with id: {}", userMessage.getId());

            // Get chat history
            List<ChatMessage> history = messageRepository.findBySessionIdOrderByTimestampAsc(session.getId());
            
            // Call OpenAI
            ChatMessage assistantMessage = callOpenAI(userId, session, history);
            logger.info("Successfully processed message for user: {}", userId);
            
            return assistantMessage;

        } catch (IllegalArgumentException e) {
            logger.warn("Invalid input - userId: {}, error: {}", userId, e.getMessage());
            return createErrorMessage(userId, sessionId, "Yêu cầu không hợp lệ: " + e.getMessage());
        } catch (IllegalStateException e) {
            logger.warn("Rate limit exceeded - userId: {}", userId);
            return createErrorMessage(userId, sessionId, e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error processing message", e);
            return createErrorMessage(userId, sessionId, "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.");
        }
    }

    private void validateInput(String userId, String sessionId, String content) {
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("userId không được để trống");
        }
        if (sessionId == null || sessionId.trim().isEmpty()) {
            throw new IllegalArgumentException("sessionId không được để trống");
        }
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Nội dung tin nhắn không được để trống");
        }
    }

    private void checkRateLimit(String userId) {
        LocalDateTime lastTime = lastMessageTime.get(userId);
        if (lastTime != null && 
            Duration.between(lastTime, LocalDateTime.now()).compareTo(MESSAGE_COOLDOWN) < 0) {
            throw new IllegalStateException("Vui lòng đợi giây lát trước khi gửi tin nhắn tiếp theo");
        }
        lastMessageTime.put(userId, LocalDateTime.now());
    }

    private ChatSession getOrCreateSession(String userId, String sessionId) {
        return sessionRepository.findById(sessionId)
            .orElseGet(() -> {
                ChatSession newSession = new ChatSession();
                newSession.setUserId(userId);
                newSession.setStatus("active");
                return sessionRepository.save(newSession);
            });
    }

    private ChatMessage saveUserMessage(String userId, String sessionId, String content) {
        ChatMessage userMessage = new ChatMessage();
        userMessage.setSessionId(sessionId);
        userMessage.setUserId(userId);
        userMessage.setRole("user");
        userMessage.setContent(content);
        return messageRepository.save(userMessage);
    }

    private ChatMessage callOpenAI(String userId, ChatSession session, List<ChatMessage> history) {
        ChatCompletionRequest completionRequest = ChatCompletionRequest.builder()
            .model(MODEL_ID)
            .messages(buildMessages(history))
            .maxTokens(200)
            .temperature(0.7)
            .build();

        ChatMessage assistantMessage = new ChatMessage();
        try {
            logger.info("Calling OpenAI API for user: {}", userId);
            ChatCompletionResult result = openAiService.createChatCompletion(completionRequest);
            String response = result.getChoices().get(0).getMessage().getContent();
            
            assistantMessage.setSessionId(session.getId());
            assistantMessage.setUserId(userId);
            assistantMessage.setRole("assistant");
            assistantMessage.setContent(response);
            messageRepository.save(assistantMessage);

            session.setLastMessageAt(LocalDateTime.now());
            sessionRepository.save(session);
            
            return assistantMessage;
        } catch (Exception e) {
            logger.error("Error calling OpenAI API", e);
            throw e;
        }
    }

    private ChatMessage createErrorMessage(String userId, String sessionId, String errorMessage) {
        ChatMessage message = new ChatMessage();
        message.setSessionId(sessionId);
        message.setUserId(userId);
        message.setRole("assistant");
        message.setContent(errorMessage);
        return message;
    }

    private List<com.theokanning.openai.completion.chat.ChatMessage> buildMessages(List<ChatMessage> history) {
        List<com.theokanning.openai.completion.chat.ChatMessage> messages = new ArrayList<>();
        
        // System prompt
        messages.add(new com.theokanning.openai.completion.chat.ChatMessage("system", 
            "Bạn là Lotus Ticket Assistant, chatbot hỗ trợ cho nền tảng đặt vé Lotus Ticket. " +
            "Nhiệm vụ của bạn là giúp người dùng với thông tin về sự kiện, đặt vé và các câu hỏi chung. " +
            "Hãy trả lời ngắn gọn, thân thiện và chuyên nghiệp."));

        // Chat history (giới hạn 5 tin nhắn gần nhất)
        int maxHistoryMessages = 5;
        int startIndex = Math.max(0, history.size() - maxHistoryMessages);
        
        for (int i = startIndex; i < history.size(); i++) {
            ChatMessage msg = history.get(i);
            messages.add(new com.theokanning.openai.completion.chat.ChatMessage(msg.getRole(), msg.getContent()));
        }
        
        return messages;
    }

    public List<ChatMessage> getChatHistory(String userId, String sessionId) {
        return messageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
    }

    public List<ChatSession> getUserSessions(String userId) {
        return sessionRepository.findByUserIdOrderByLastMessageAtDesc(userId);
    }
}