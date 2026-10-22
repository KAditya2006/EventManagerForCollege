import api from './client';

export interface CheckInResponse {
  success: boolean;
  alreadyCheckedIn?: boolean;
  data?: {
    student: {
      _id: string;
      name: string;
      email: string;
      branch: string;
      year: string;
    };
    checkedInAt: string;
    checkedIn: boolean;
  };
  error?: {
    message: string;
  };
}

export const checkInStudentQR = async (eventId: string, qrToken: string): Promise<CheckInResponse> => {
  try {
    const response = await api.post(`/admin/events/${eventId}/check-in`, { qrToken });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return { success: false, error: { message: 'Network or server error.' } };
  }
};
