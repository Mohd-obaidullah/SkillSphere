import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
 baseURL: API_BASE_URL,
 headers: {
 'Content-Type': 'application/json',
 },
});

api.interceptors.request.use((config) => {
 const token = localStorage.getItem('skillsphere_token');
 if (token) {
 config.headers.Authorization = `Bearer ${token}`;
 }
 return config;
});

export const authAPI = {
 register: (data) => api.post('/auth/register', data),
 login: (data) => api.post('/auth/login', data),
 getMe: (config) => api.get('/auth/me', config),
};

 export const profileAPI = {
  getProfile: () => api.get('/profile/'),
  updateProfile: (data) => api.put('/profile/', data),
  getSkills: () => api.get('/profile/skills'),
  addSkill: (data) => api.post('/profile/skills', data),
  deleteSkill: (skillId) => api.delete(`/profile/skills/${skillId}`),
  addBadge: (data) => api.post('/profile/badges', data),
 };

export const storageAPI = {
 uploadDocument: (file, roomId = null) => {
 const formData = new FormData();
 formData.append('file', file);
 if (roomId) formData.append('room_id', roomId);
 return api.post('/storage/upload/document', formData, {
 headers: { 'Content-Type': 'multipart/form-data' },
 });
 },
 uploadImage: (file, updateProfile = false) => {
 const formData = new FormData();
 formData.append('file', file);
 if (updateProfile) formData.append('update_profile', 'true');
 return api.post('/storage/upload/image', formData, {
 headers: { 'Content-Type': 'multipart/form-data' },
 });
 }
};

export const peersAPI = {
 getPeers: (search) => api.get(`/peers/?q=${search || ''}`),
 requestConnection: (userId) => api.post(`/peers/request/${userId}`),
};

export const projectsAPI = {
 getProjects: (search) => api.get(`/projects/?q=${search || ''}`),
 createProject: (data) => api.post('/projects/', data),
 applyProject: (projectId) => api.post(`/projects/${projectId}/apply`),
 getTasks: (projectId) => api.get(`/projects/${projectId}/tasks`),
 createTask: (projectId, data) => api.post(`/projects/${projectId}/tasks`, data),
 updateTask: (taskId, data) => api.put(`/projects/tasks/${taskId}`, data),
};

export const roomsAPI = {
 getRooms: () => api.get('/rooms/'),
 createRoom: (data) => api.post('/rooms/', data),
 joinRoom: (roomId) => api.post(`/rooms/${roomId}/join`),
 getQuestions: (roomId) => api.get(`/rooms/${roomId}/questions`),
 createQuestion: (roomId, data) => api.post(`/rooms/${roomId}/questions`, data),
 getResources: (roomId) => api.get(`/rooms/${roomId}/resources`),
 askAI: (roomId, data) => api.post(`/rooms/${roomId}/ai-help`, data),
};

export const evidenceAPI = {
 getEvidence: () => api.get('/evidence/'),
 addEvidence: (data) => api.post('/evidence/', data),
 deleteEvidence: (itemId) => api.delete(`/evidence/${itemId}`),
};

export const eventsAPI = {
 getEvents: () => api.get('/events/'),
 createEvent: (data) => api.post('/events/', data),
 registerEvent: (eventId) => api.post(`/events/${eventId}/register`),
 unregisterEvent: (eventId) => api.post(`/events/${eventId}/unregister`),
};

export const notificationsAPI = {
 getNotifications: () => api.get('/notifications/'),
 createNotification: (data) => api.post('/notifications/', data),
 markAsRead: (notifId) => api.put(`/notifications/${notifId}/read`),
 markAllAsRead: () => api.put('/notifications/read-all'),
};

export default api;
