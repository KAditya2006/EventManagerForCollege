import api from './client';
import { Event } from './events';

export interface Registration {
  _id: string;
  student: string;
  event: Event;
  status: 'REGISTERED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  checkedIn?: boolean;
  checkedInAt?: string;
  hasFeedback?: boolean;
}

export const registerForEvent = async (eventId: string) => {
  const response = await api.post(`/events/${eventId}/register`);
  return response.data;
};

export const getMyRegistrations = async () => {
  const response = await api.get('/registrations');
  return response.data;
};

export const getRegistrationDetails = async (registrationId: string) => {
  const response = await api.get(`/registrations/${registrationId}`);
  return response.data;
};

export const getRegistrationPass = async (registrationId: string) => {
  const response = await api.get(`/registrations/${registrationId}/pass`);
  return response.data;
};
