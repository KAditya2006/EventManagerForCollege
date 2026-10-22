import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform, NativeModules } from 'react-native';

/**
 * Production and Development API Base URL configuration.
 *
 * Automatically resolves:
 * 1. EXPO_PUBLIC_API_URL environment variable (if provided)
 * 2. Metro Bundler host IP (when connected via Expo Go on physical phone)
 * 3. Local network IP (10.179.129.183:5000) for physical device testing
 * 4. Android emulator fallback (10.0.2.2:5000)
 */
export const getBaseUrl = (): string => {
  // 1. EXPO_PUBLIC_API_URL environment variable
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (
    envApiUrl && 
    envApiUrl.trim().length > 0 && 
    !envApiUrl.includes('10.179.129.183')
  ) {
    return envApiUrl.trim();
  }

  // 2. Auto-detect host machine IP dynamically from Metro bundler when in development
  const scriptURL = NativeModules?.SourceCode?.scriptURL;
  if (scriptURL && typeof scriptURL === 'string') {
    const match = scriptURL.match(/https?:\/\/([^:\/]+)/);
    if (
      match && 
      match[1] && 
      match[1] !== 'localhost' && 
      match[1] !== '127.0.0.1' &&
      match[1] !== '10.179.129.183'
    ) {
      return `http://${match[1]}:5000/api`;
    }
  }

  // 3. Hosted backend API URL (Default production fallback for standalone APK testing)
  return 'https://giet-a-event-manager.onrender.com/api';
};

export const BASE_URL = getBaseUrl();

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  // Ensure baseURL is always dynamically current and never points to stale IP
  config.baseURL = getBaseUrl();
  try {
    const token = await SecureStore.getItemAsync('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error('[API Client] Error retrieving auth token from SecureStore:', err);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.warn(
        '[API Client] Network timeout or unreachable endpoint:', 
        error.message, 
        `${error.config?.baseURL || ''}${error.config?.url || ''}`
      );
    }
    return Promise.reject(error);
  }
);

export default api;
