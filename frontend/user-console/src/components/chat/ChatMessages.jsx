import React, { useEffect, useRef } from 'react';
import ChatBubble from './ChatBubble';

const ChatMessages = ({ messages, isTyping }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-messages">
      {messages.map((message, index) => (
        <ChatBubble key={index} message={message} />
      ))}
      {isTyping && (
        <div className="message bot">
          <div className="message-content">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages; 