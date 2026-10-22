import api from './client';

export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  organizer: string;
  category?: string;
  capacity?: number;
  poster?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  isRegistered?: boolean;
}

export const getEvents = async (params?: { search?: string; category?: string; page?: number; limit?: number }) => {
  const response = await api.get('/events', { params });
  return response.data;
};

export const getEventDetails = async (id: string) => {
  const response = await api.get(`/events/${id}`);
  return response.data;
};
