import api from './client';

export const getProfile = async () => {
  const response = await api.get('/profile');
  return response.data;
};

export const updateProfile = async (data: { name?: string; branch?: string; year?: string }) => {
  const response = await api.patch('/profile', data);
  return response.data;
};
