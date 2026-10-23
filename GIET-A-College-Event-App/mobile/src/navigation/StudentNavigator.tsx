import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, Platform, StyleSheet } from 'react-native';
import StudentProfileScreen from '../screens/app/StudentProfileScreen';
import StudentHomeScreen from '../screens/app/StudentHomeScreen';
import EventsScreen from '../screens/app/EventsScreen';
import EventDetailsScreen from '../screens/app/EventDetailsScreen';
import MyRegistrationsScreen from '../screens/app/MyRegistrationsScreen';
import RegistrationConfirmationScreen from '../screens/app/RegistrationConfirmationScreen';
import RegistrationDetailsScreen from '../screens/app/RegistrationDetailsScreen';
import QREventPassScreen from '../screens/app/QREventPassScreen';
import NotificationsScreen from '../screens/app/NotificationsScreen';
import NotificationDetailsScreen from '../screens/app/NotificationDetailsScreen';
import EventFeedbackScreen from '../screens/app/EventFeedbackScreen';
import FeedbackSubmittedScreen from '../screens/app/FeedbackSubmittedScreen';
import EditProfileScreen from '../screens/app/EditProfileScreen';
import SettingsScreen from '../screens/app/SettingsScreen';
import ScanEventRegistrationScreen from '../screens/app/ScanEventRegistrationScreen';
import { Notification } from '../api/notifications';
import { NotificationBell } from '../components/NotificationBell';
import { colors } from '../theme';

export type StudentStackParamList = {
  StudentTabs: undefined;
  EventDetails: { eventId: string };
  ScanEventRegistration: undefined;
  RegistrationConfirmation: { eventId: string; registrationId: string };
  RegistrationDetails: { registrationId: string };
  QREventPass: { registrationId: string };
  Notifications: undefined;
  NotificationDetails: { notificationId: string; notification?: Notification };
  EventFeedback: { eventId: string; eventTitle: string };
  FeedbackSubmitted: { eventTitle: string };
  EditProfile: { profileData: any };
  Settings: undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<StudentStackParamList>();

import { 
  HomeTabIcon, 
  EventsTabIcon, 
  TicketTabIcon, 
  UserTabIcon 
} from '../components/FormIcons';

const StudentTabs = () => {
  return (
    <Tab.Navigator 
      screenOptions={{ 
        headerTitleAlign: 'center', 
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerShadowVisible: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={StudentHomeScreen} 
        options={{
          headerShown: false,
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <HomeTabIcon size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Events" 
        component={EventsScreen} 
        options={{
          title: 'Discover Events',
          tabBarLabel: 'Events',
          tabBarIcon: ({ color }) => (
            <EventsTabIcon size={22} color={color} />
          ),
          headerRight: () => <NotificationBell />
        }}
      />
      <Tab.Screen 
        name="Registrations" 
        component={MyRegistrationsScreen} 
        options={{
          title: 'My Registrations',
          tabBarLabel: 'Registrations',
          tabBarIcon: ({ color }) => (
            <TicketTabIcon size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={StudentProfileScreen} 
        options={{
          title: 'Student Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <UserTabIcon size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const StudentNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerTitleAlign: 'center',
        headerTintColor: colors.primary,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerShadowVisible: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="StudentTabs" component={StudentTabs} options={{ headerShown: false }} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} options={{ title: 'Event Details' }} />
      <Stack.Screen name="ScanEventRegistration" component={ScanEventRegistrationScreen} options={{ title: 'Scan Event QR', headerTitleAlign: 'center' }} />
      <Stack.Screen name="RegistrationConfirmation" component={RegistrationConfirmationScreen} options={{ title: 'Confirmed' }} />
      <Stack.Screen name="RegistrationDetails" component={RegistrationDetailsScreen} options={{ title: 'Registration Pass' }} />
      <Stack.Screen name="QREventPass" component={QREventPassScreen} options={{ title: 'Event Pass', presentation: 'modal' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Stack.Screen name="NotificationDetails" component={NotificationDetailsScreen} options={{ title: 'Notification Details' }} />
      <Stack.Screen name="EventFeedback" component={EventFeedbackScreen} options={{ title: 'Event Feedback' }} />
      <Stack.Screen name="FeedbackSubmitted" component={FeedbackSubmittedScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'App Settings' }} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopColor: colors.surfaceBorder,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 62,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: 6,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabIcon: {
    fontSize: 18,
  },
  header: {
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
