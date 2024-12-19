import React, { createContext, useContext, useReducer } from 'react';

const ChatContext = createContext();

const initialState = {
  messages: [],
  isTyping: false,
  currentSession: null,
  userId: null
};

const chatReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        userId: action.payload
      };
    case 'SET_SESSION':
      return {
        ...state,
        currentSession: action.payload
      };
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: action.payload
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };
    case 'SET_TYPING':
      return {
        ...state,
        isTyping: action.payload
      };
    default:
      return state;
  }
};

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}; 