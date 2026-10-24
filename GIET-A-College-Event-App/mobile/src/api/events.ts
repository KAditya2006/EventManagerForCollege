import api from './client';

export interface EventWinner {
  position: number;
  studentId?: string;
  name: string;
  rollNumber?: string;
  branch?: string;
  prize?: string;
}

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
  status: 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED';
  winners?: EventWinner[];
  winnersAnnouncedAt?: string;
  completedAt?: string;
  registrationCount?: number;
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
