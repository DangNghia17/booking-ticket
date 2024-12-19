import React, { useState } from 'react';
import { IoSend } from 'react-icons/io5';
import { useChat } from '../../context/ChatContext';
import { useSendMessage } from '../../api/services/chatServices';

const ChatInput = () => {
  const [input, setInput] = useState('');
  const { state, dispatch } = useChat();
  const sendMessageMutation = useSendMessage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const messageContent = input.trim();
    setInput('');

    // Add user message locally
    dispatch({
      type: 'ADD_MESSAGE',
      payload: { text: messageContent, sender: 'user' }
    });

    // Set bot typing indicator
    dispatch({ type: 'SET_TYPING', payload: true });

    try {
      const response = await sendMessageMutation.mutateAsync({
        userId: state.userId || 'anonymous',
        sessionId: state.currentSession || 'new',
        content: messageContent
      });

      // Add bot response - đã sửa để phù hợp với response từ BE
      if (response.data && response.data.content) {
        dispatch({
          type: 'ADD_MESSAGE',
          payload: { 
            text: response.data.content, 
            sender: 'bot' 
          }
        });
      } else if (response.content) { // Trường hợp response trực tiếp
        dispatch({
          type: 'ADD_MESSAGE',
          payload: { 
            text: response.content, 
            sender: 'bot' 
          }
        });
      }

      // Cập nhật session ID nếu là session mới
      if (response.sessionId && !state.currentSession) {
        dispatch({
          type: 'SET_SESSION',
          payload: response.sessionId
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      dispatch({
        type: 'ADD_MESSAGE',
        payload: { 
          text: 'Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.',
          sender: 'bot'
        }
      });
    } finally {
      dispatch({ type: 'SET_TYPING', payload: false });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="chat-input">
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
        />
        <button type="submit" aria-label="Send message">
          <IoSend />
        </button>
      </div>
    </form>
  );
};

export default ChatInput; 