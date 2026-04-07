import axios from 'axios'

const API_BASE_URL = "http://localhost:8082";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const chatService = {
  async getConversations() {
    const res = await api.get("/chat-management/api/v1/chat/conversations");
    return res.data.data;
  },

  async getConversation(conversationId) {
    const res = await api.get(`/chat-management/api/v1/chat/conversations/${conversationId}`);
    return res.data.data;
  },

  async getMessages(conversationId) {
    const res = await api.get(`/chat-management/api/v1/chat/conversations/${conversationId}/messages`);
    return res.data.data;
  },

  async sendMessage(conversationId, message) {
    const res = await api.post(`/chat-management/api/v1/chat/conversations/${conversationId}/messages`, message);
    return res.data.data;
  },

  async markAsRead(conversationId) {
    // TODO: Implement if needed
    return true;
  },

  async createConversation(participantId) {
    // TODO: Implement if needed
    return null;
  },

  async deleteMessage(conversationId, messageId) {
    // TODO: Implement if needed
    return true;
  },

  async searchMessages(query) {
    // TODO: Implement if needed
    return [];
  },
};
