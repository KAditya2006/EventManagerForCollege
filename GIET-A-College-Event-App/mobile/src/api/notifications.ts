import api from './client';

export interface Notification {
  _id: string;
  recipient: string;
  type: 'REGISTRATION_CONFIRMED' | 'EVENT_UPDATED' | 'EVENT_CANCELLED' | 'ATTENDANCE_CONFIRMED';
  title: string;
  message: string;
  read: boolean;
  event?: string;
  registration?: string;
  createdAt: string;
  readAt?: string;
}

export const getNotifications = async (page: number = 1, limit: number = 20) => {
  const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await api.get('/notifications/unread-count');
  return response.data;
};

export const markNotificationAsRead = async (id: string) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};
