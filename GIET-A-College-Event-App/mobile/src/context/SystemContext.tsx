import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchSystemStatus, SystemStatusData } from '../api/system';
import { checkAndApplyOtaUpdate } from '../services/updateService';
import { MaintenanceScreen } from '../screens/app/MaintenanceScreen';
import { useAuth } from './AuthContext';

interface SystemContextData {
  status: SystemStatusData | null;
  refreshStatus: () => Promise<void>;
  checkUpdates: (isManual?: boolean) => Promise<boolean>;
  isMaintenanceActive: boolean;
}

const SystemContext = createContext<SystemContextData>({} as SystemContextData);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<SystemStatusData | null>(null);
  const [adminBypassed, setAdminBypassed] = useState(false);

  const refreshStatus = async () => {
    try {
      const data = await fetchSystemStatus();
      setStatus(data);
    } catch (err) {
      console.warn('[SystemContext] Refresh error:', err);
    }
  };

  const checkUpdates = async (isManual = false) => {
    return await checkAndApplyOtaUpdate(isManual);
  };

  useEffect(() => {
    // 1. Fetch system & maintenance status
    refreshStatus();

    // 2. Automatically check for OTA live updates in background
    checkAndApplyOtaUpdate(false);
  }, []);

  const isMaintenanceActive = !!status?.maintenanceMode && !adminBypassed;

  if (isMaintenanceActive) {
    return (
      <MaintenanceScreen
        message={status?.maintenanceMessage}
        onRefreshStatus={refreshStatus}
        isAdmin={user?.role === 'ADMIN'}
        onAdminBypass={() => setAdminBypassed(true)}
      />
    );
  }

  return (
    <SystemContext.Provider
      value={{
        status,
        refreshStatus,
        checkUpdates,
        isMaintenanceActive,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => useContext(SystemContext);
