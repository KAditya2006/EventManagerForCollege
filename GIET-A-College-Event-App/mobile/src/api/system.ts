import api from './client';

export interface SystemStatusData {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  minRequiredVersion: string;
  latestVersion: string;
  apkDownloadUrl: string;
}

export const fetchSystemStatus = async (): Promise<SystemStatusData> => {
  try {
    const response = await api.get('/system/status');
    return response.data?.data || {
      maintenanceMode: false,
      maintenanceMessage: '',
      minRequiredVersion: '1.0.0',
      latestVersion: '1.0.0',
      apkDownloadUrl: 'https://giet-a-event-manager.onrender.com/download/app',
    };
  } catch (error) {
    // If system check fails (e.g. offline), default to non-maintenance so offline cache/screens aren't locked
    return {
      maintenanceMode: false,
      maintenanceMessage: '',
      minRequiredVersion: '1.0.0',
      latestVersion: '1.0.0',
      apkDownloadUrl: 'https://giet-a-event-manager.onrender.com/download/app',
    };
  }
};

export const updateMaintenanceMode = async (
  maintenanceMode: boolean,
  maintenanceMessage?: string
) => {
  const response = await api.put('/system/maintenance', {
    maintenanceMode,
    maintenanceMessage,
  });
  return response.data;
};
