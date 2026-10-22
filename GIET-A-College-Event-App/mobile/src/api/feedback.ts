import api from './client';

export interface Feedback {
  _id: string;
  event: string;
  student: {
    _id: string;
    name: string;
    email: string;
  };
  registration: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export const submitFeedback = async (eventId: string, rating: number, comment?: string) => {
  const response = await api.post(`/events/${eventId}/feedback`, { rating, comment });
  return response.data;
};

export const getEventFeedback = async (eventId: string, page: number = 1, limit: number = 20) => {
  const response = await api.get(`/admin/events/${eventId}/feedback?page=${page}&limit=${limit}`);
  return response.data;
};
