import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only remove token on 401 errors that are not network errors
    if (error.response?.status === 401 && !error.code) {
      console.warn('Authentication failed - token removed');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Don't redirect here - let the component handle it
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  creator_id: number;
  creator_name: string;
  creator_last_name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: number;
  user_id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location?: string;
  is_busy: boolean;
  first_name?: string;
  last_name?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface Meeting {
  id: number;
  group_id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location?: string;
  creator_id: number;
  creator_name: string;
  group_name: string;
  participation_status: string;
  created_at: string;
  updated_at: string;
}

// Auth API
export const authAPI = {
  register: (userData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }) => api.post('/auth/register', userData),

  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),

  getProfile: () => api.get('/auth/me'),
};

// Groups API
export const groupsAPI = {
  getGroups: () => api.get('/groups'),
  createGroup: (groupData: { name: string; description: string }) =>
    api.post('/groups', groupData),
  getGroupById: (id: number) => api.get(`/groups/${id}`),
  updateGroup: (id: number, updates: { name: string; description: string }) =>
    api.put(`/groups/${id}`, updates),
  deleteGroup: (id: number) => api.delete(`/groups/${id}`),
  addMember: (groupId: number, memberData: { email: string; role: string }) =>
    api.post(`/groups/${groupId}/members`, memberData),
  removeMember: (groupId: number, userId: number) =>
    api.delete(`/groups/${groupId}/members/${userId}`),
  getGroupMembers: (groupId: number) => api.get(`/groups/${groupId}/members`),
};

// Events API
export const eventsAPI = {
  getEvents: (params?: { start_date?: string; end_date?: string }) =>
    api.get('/events', { params }),
  createEvent: (eventData: {
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    location?: string;
    is_busy?: boolean;
  }) => api.post('/events', eventData),
  getEventById: (id: number) => api.get(`/events/${id}`),
  updateEvent: (id: number, updates: any) => api.put(`/events/${id}`, updates),
  deleteEvent: (id: number) => api.delete(`/events/${id}`),
  getUserBusyTimes: (params: { start_date: string; end_date: string }) =>
    api.get('/events/busy-times', { params }),
  getGroupEvents: (groupId: number, params?: { start_date?: string; end_date?: string }) =>
    api.get(`/events/group/${groupId}`, { params }),
  getGroupBusyTimes: (groupId: number, params: { start_date: string; end_date: string }) =>
    api.get(`/events/group/${groupId}/busy-times`, { params }),
};

// Meetings API
export const meetingsAPI = {
  getUserMeetings: () => api.get('/meetings/user'),
  getAllUserMeetings: () => api.get('/meetings/user/all'),
  createMeeting: (meetingData: {
    group_id: number;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    location?: string;
  }) => api.post('/meetings', meetingData),
  getMeetingById: (id: number) => api.get(`/meetings/${id}`),
  updateMeeting: (id: number, updates: any) => api.put(`/meetings/${id}`, updates),
  deleteMeeting: (id: number) => api.delete(`/meetings/${id}`),
  getGroupMeetings: (groupId: number) => api.get(`/meetings/group/${groupId}`),
  updateParticipantStatus: (meetingId: number, status: string) =>
    api.put(`/meetings/${meetingId}/status`, { status }),
  findAvailableSlots: (groupId: number, params: {
    start_date: string;
    end_date: string;
    duration?: number;
  }) => api.get(`/meetings/group/${groupId}/available-slots`, { params }),
};

export default api; 