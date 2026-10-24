import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import EmailLoginScreen from '../screens/auth/EmailLoginScreen';
import OtpVerificationScreen from '../screens/auth/OtpVerificationScreen';
import CompleteProfileScreen from '../screens/auth/CompleteProfileScreen';

export type AuthStackParamList = {
  Welcome: undefined;
  EmailLogin: undefined;
  OtpVerification: { email: string; name?: string };
  CompleteProfile: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#ffffff' }
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="EmailLogin" component={EmailLoginScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
    </Stack.Navigator>
  );
};
