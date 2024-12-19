import { useQuery, useMutation } from "@tanstack/react-query";
import httpRequest from "../../services/httpRequest";
import { ChatAPI } from "../configs/chat";

const sendMessage = async (userId, sessionId, content) => {
  try {
    const response = await httpRequest(ChatAPI.sendMessage(userId, sessionId, content));
    return response.data;
  } catch (err) {
    console.error('Chat service error:', err);
    throw err;
  }
};

const getChatHistory = async (userId, sessionId) => {
  try {
    const response = await httpRequest(ChatAPI.getChatHistory(userId, sessionId));
    return response.data;
  } catch (err) {
    throw err.response.data;
  }
};

const getUserSessions = async (userId) => {
  try {
    const response = await httpRequest(ChatAPI.getUserSessions(userId));
    return response.data;
  } catch (err) {
    throw err.response.data;
  }
};

export const useSendMessage = () => {
  return useMutation(
    ({ userId, sessionId, content }) => sendMessage(userId, sessionId, content)
  );
};

export const useGetChatHistory = (userId, sessionId) => {
  return useQuery(
    ["chatHistory", userId, sessionId],
    () => getChatHistory(userId, sessionId),
    {
      enabled: !!userId && !!sessionId,
      refetchInterval: 5000 // Poll every 5 seconds
    }
  );
};

export const useGetUserSessions = (userId) => {
  return useQuery(
    ["chatSessions", userId],
    () => getUserSessions(userId),
    {
      enabled: !!userId
    }
  );
};

const chatServices = {
  sendMessage,
  getChatHistory,
  getUserSessions
};

export default chatServices; 