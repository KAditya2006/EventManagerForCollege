import api from './client';
import { Event } from './events';

export const getAdminEvents = async (params?: { search?: string; status?: string; page?: number; limit?: number }) => {
  const response = await api.get('/admin/events', { params });
  return response.data;
};

export const getAdminEventDetails = async (id: string) => {
  const response = await api.get(`/admin/events/${id}`);
  return response.data;
};

export const createEvent = async (eventData: Partial<Event>) => {
  const response = await api.post('/admin/events', eventData);
  return response.data;
};

export const updateEvent = async (id: string, eventData: Partial<Event>) => {
  const response = await api.put(`/admin/events/${id}`, eventData);
  return response.data;
};

export const updateEventStatus = async (id: string, status: string) => {
  const response = await api.patch(`/admin/events/${id}/status`, { status });
  return response.data;
};
