export const ChatAPI = {
  sendMessage: (userId, sessionId, content) => ({
    url: "/chat/send",
    method: "POST",
    params: {
      userId,
      sessionId
    },
    data: content
  }),
  
  getChatHistory: (userId, sessionId) => ({
    url: "/chat/history",
    method: "GET",
    params: {
      userId,
      sessionId
    }
  }),

  getUserSessions: (userId) => ({
    url: "/chat/sessions",
    method: "GET",
    params: {
      userId
    }
  })
}; 