package com.nghia.bookingevent.controllers;

import com.nghia.bookingevent.models.chat.*;
import com.nghia.bookingevent.services.ChatService;
import com.nghia.bookingevent.payload.response.ResponseObject;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/api/chat")
@Api(tags = "Chat APIs", description = "APIs for chat functionality")
public class ChatController {
    
    private final ChatService chatService;

    @ApiOperation("Send a message to the chatbot")
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(
            @ApiParam(value = "User ID", required = true)
            @RequestParam String userId,
            @ApiParam(value = "Session ID", required = true)
            @RequestParam String sessionId,
            @ApiParam(value = "Message content", required = true)
            @RequestBody String content) {
        try {
            ChatMessage response = chatService.sendMessage(userId, sessionId, content);
            return ResponseEntity.ok(new ResponseObject(
                true, 
                "Message sent successfully",
                response,
                200
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ResponseObject(
                    false, 
                    "Error sending message: " + e.getMessage(), 
                    null, 
                    400
                ));
        }
    }

    @ApiOperation("Get chat history for a session")
    @GetMapping("/history")
    public ResponseEntity<?> getChatHistory(
            @ApiParam(value = "User ID", required = true)
            @RequestParam String userId,
            @ApiParam(value = "Session ID", required = true)
            @RequestParam String sessionId) {
        try {
            return ResponseEntity.ok(new ResponseObject(
                true, 
                "Chat history retrieved successfully",
                chatService.getChatHistory(userId, sessionId),
                200
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ResponseObject(false, "Error getting chat history: " + e.getMessage(), null, 400));
        }
    }

    @ApiOperation("Get all chat sessions for a user")
    @GetMapping("/sessions")
    public ResponseEntity<?> getUserSessions(
            @ApiParam(value = "User ID", required = true)
            @RequestParam String userId) {
        try {
            return ResponseEntity.ok(new ResponseObject(
                true,
                "User sessions retrieved successfully", 
                chatService.getUserSessions(userId),
                200
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ResponseObject(false, "Error getting user sessions: " + e.getMessage(), null, 400));
        }
    }
}