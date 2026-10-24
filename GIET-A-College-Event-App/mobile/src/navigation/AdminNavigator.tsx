import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, Platform, StyleSheet } from 'react-native';
import AdminProfileScreen from '../screens/app/AdminProfileScreen';
import AdminDashboardScreen from '../screens/app/AdminDashboardScreen';
import AdminEventsScreen from '../screens/app/AdminEventsScreen';
import AdminParticipantsScreen from '../screens/app/AdminParticipantsScreen';
import CreateEventScreen from '../screens/app/CreateEventScreen';
import EditEventScreen from '../screens/app/EditEventScreen';
import AdminEventDetailsScreen from '../screens/app/AdminEventDetailsScreen';
import ScanAttendanceScreen from '../screens/app/ScanAttendanceScreen';
import CheckInResultScreen from '../screens/app/CheckInResultScreen';
import AdminEventFeedbackScreen from '../screens/app/AdminEventFeedbackScreen';
import EditProfileScreen from '../screens/app/EditProfileScreen';
import SettingsScreen from '../screens/app/SettingsScreen';
import AdminUsersScreen from '../screens/app/AdminUsersScreen';
import AdminEventParticipantsScreen from '../screens/app/AdminEventParticipantsScreen';
import AdminEventWinnersScreen from '../screens/app/AdminEventWinnersScreen';
import { colors } from '../theme';

export type AdminStackParamList = {
  AdminTabs: undefined;
  CreateEvent: undefined;
  EditEvent: { eventId: string };
  AdminEventDetails: { eventId: string };
  AdminUsers: undefined;
  AdminEventParticipants: { eventId: string; eventTitle: string };
  AdminEventWinners: { eventId: string; eventTitle: string };
  ScanAttendance: { eventId: string };
  CheckInResult: { eventId: string; result: any };
  AdminEventFeedback: { eventId: string; eventTitle: string };
  EditProfile: { profileData: any };
  Settings: undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<AdminStackParamList>();

import { 
  DashboardTabIcon, 
  EventsTabIcon, 
  AttendanceTabIcon, 
  UserTabIcon 
} from '../components/FormIcons';

const AdminTabs = () => (
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
      name="Dashboard" 
      component={AdminDashboardScreen} 
      options={{
        headerShown: false,
        tabBarLabel: 'Dashboard',
        tabBarIcon: ({ color }) => (
          <DashboardTabIcon size={22} color={color} />
        ),
      }}
    />
    <Tab.Screen 
      name="Events" 
      component={AdminEventsScreen} 
      options={{
        title: 'Event Management',
        tabBarLabel: 'Events',
        tabBarIcon: ({ color }) => (
          <EventsTabIcon size={22} color={color} />
        ),
      }}
    />
    <Tab.Screen 
      name="Users" 
      component={AdminUsersScreen} 
      options={{
        headerShown: false,
        tabBarLabel: 'Users',
        tabBarIcon: ({ color }) => (
          <AttendanceTabIcon size={22} color={color} />
        ),
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={AdminProfileScreen} 
      options={{
        title: 'Admin Profile',
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color }) => (
          <UserTabIcon size={22} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

export const AdminNavigator = () => {
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
      <Stack.Screen name="AdminTabs" component={AdminTabs} options={{ headerShown: false }} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} options={{ title: 'Create Event' }} />
      <Stack.Screen name="EditEvent" component={EditEventScreen} options={{ title: 'Edit Event' }} />
      <Stack.Screen name="AdminEventDetails" component={AdminEventDetailsScreen} options={{ title: 'Event Management' }} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'Registered Students' }} />
      <Stack.Screen name="AdminEventParticipants" component={AdminEventParticipantsScreen} options={{ title: 'Event Participants' }} />
      <Stack.Screen name="AdminEventWinners" component={AdminEventWinnersScreen} options={{ title: 'Manage Winners' }} />
      <Stack.Screen name="ScanAttendance" component={ScanAttendanceScreen} options={{ title: 'Scan Student Pass' }} />
      <Stack.Screen name="CheckInResult" component={CheckInResultScreen} options={{ title: 'Check-In Result', headerBackVisible: false }} />
      <Stack.Screen name="AdminEventFeedback" component={AdminEventFeedbackScreen} options={{ title: 'Feedback & Ratings' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Admin Settings' }} />
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
