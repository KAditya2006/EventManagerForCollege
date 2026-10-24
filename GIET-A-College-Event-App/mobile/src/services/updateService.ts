import * as Updates from 'expo-updates';
import { Alert, Platform } from 'react-native';

/**
 * Checks and applies Over-The-Air (OTA) updates via EAS Update.
 * Safe for both development and production standalone builds.
 */
export const checkAndApplyOtaUpdate = async (isManual = false): Promise<boolean> => {
  // In development (Expo Go), expo-updates check is not supported
  if (__DEV__) {
    if (isManual) {
      Alert.alert('Development Environment', 'OTA live updates run on standalone APK builds.');
    }
    return false;
  }

  try {
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      const fetched = await Updates.fetchUpdateAsync();
      if (fetched.isNew) {
        Alert.alert(
          '🎉 Update Ready',
          'A fresh update with the latest features, improvements and fixes is ready! Would you like to restart now to apply it?',
          [
            { text: 'Next Time', style: 'cancel' },
            {
              text: 'Restart Now',
              style: 'default',
              onPress: async () => {
                try {
                  await Updates.reloadAsync();
                } catch (reloadErr) {
                  console.warn('[Updates] Reload error:', reloadErr);
                }
              },
            },
          ]
        );
        return true;
      }
    } else if (isManual) {
      Alert.alert('App Up to Date', 'You are already running the latest version of the app.');
    }
    return false;
  } catch (error: any) {
    console.warn('[Updates] OTA check warning:', error.message);
    if (isManual) {
      Alert.alert('Check Failed', 'Could not check for updates. Please check your internet connection.');
    }
    return false;
  }
};
