import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { SystemProvider } from './src/context/SystemContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <SystemProvider>
          <RootNavigator />
        </SystemProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
