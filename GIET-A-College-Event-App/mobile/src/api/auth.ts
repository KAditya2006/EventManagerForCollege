import api from './client';

export const requestOtp = async (email: string) => {
  const response = await api.post('/auth/request-otp', { email });
  return response.data;
};

export const verifyOtp = async (email: string, otp: string) => {
  const response = await api.post('/auth/verify-otp', { email, otp });
  return response.data;
};

export const fetchCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export interface CompleteProfileData {
  name: string;
  rollNumber: string;
  phone: string;
  course: string;
  branch: string;
  year: string;
  semester: string;
  section?: string;
}

export const completeProfile = async (data: CompleteProfileData | Record<string, any>) => {
  const response = await api.put('/auth/profile', data);
  return response.data;
};
