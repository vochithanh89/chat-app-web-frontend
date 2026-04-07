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

export const groupService = {
  async getGroups() {
    const res = await api.get("/chat-management/api/v1/groups");
    return res.data.data;
  },

  async getGroupById(groupId) {
    const res = await api.get(`/chat-management/api/v1/groups/${groupId}`);
    return res.data.data;
  },

  async createGroup(data) {
    const res = await api.post("/chat-management/api/v1/groups", data);
    return res.data.data;
  },

  async updateGroup(groupId, data) {
    const res = await api.put(`/chat-management/api/v1/groups/${groupId}`, data);
    return res.data.data;
  },

  async deleteGroup(groupId) {
    // TODO: Implement if needed
    return true;
  },

  async addMember(groupId, userId) {
    // TODO: Implement if needed
    return null;
  },

  async removeMember(groupId, userId) {
    // TODO: Implement if needed
    return null;
  },

  async getGroupMembers(groupId) {
    // TODO: Implement if needed
    return [];
  },
};
