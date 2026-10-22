import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { StudentNavigator } from './StudentNavigator';
import { AdminNavigator } from './AdminNavigator';
import SplashScreen from '../screens/auth/SplashScreen';
import CompleteProfileScreen from '../screens/auth/CompleteProfileScreen';

export const RootNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthNavigator />
      ) : !user.profileCompleted ? (
        <CompleteProfileScreen navigation={null as any} /> 
      ) : user.role === 'ADMIN' ? (
        <AdminNavigator />
      ) : (
        <StudentNavigator />
      )}
    </NavigationContainer>
  );
};
