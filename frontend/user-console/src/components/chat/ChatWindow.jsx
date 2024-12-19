import React, { useEffect } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { useChat } from '../../context/ChatContext';
import { useGetChatHistory } from '../../api/services/chatServices';

const ChatWindow = () => {
  const { state, dispatch } = useChat();
  const { data: chatHistory } = useGetChatHistory(
    state.userId,
    state.currentSession
  );

  useEffect(() => {
    if (chatHistory?.data) {
      dispatch({
        type: 'SET_MESSAGES',
        payload: chatHistory.data.map(msg => ({
          text: msg.content,
          sender: msg.role === 'assistant' ? 'bot' : 'user'
        }))
      });
    }
  }, [chatHistory, dispatch]);

  return (
    <div className="chat-window">
      <ChatHeader />
      <ChatMessages messages={state.messages} isTyping={state.isTyping} />
      <ChatInput />
    </div>
  );
};

export default ChatWindow; 