import React, { useState } from 'react';
import ChatWindow from './ChatWindow';
import ChatToggleButton from './ChatToggleButton';
import { ChatProvider } from '../../context/ChatContext';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <ChatProvider>
      <div className="chat-container">
        <ChatToggleButton onClick={toggleChat} isOpen={isOpen} />
        {isOpen && <ChatWindow />}
      </div>
    </ChatProvider>
  );
};

export default ChatBot; 