import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, Text, ActivityIndicator } from 'react-native';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import HomeScreen from './src/screens/HomeScreen';
import ComplaintsScreen from './src/screens/ComplaintsScreen';
import PersonalComplaintsScreen from './src/screens/PersonalComplaintsScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ChatScreen from './src/screens/ChatScreen';
import AuthFlowScreen from './src/screens/auth/AuthFlowScreen';
import VisitorCheckInScreen from './src/screens/visitor/VisitorCheckInScreen';
import PinEntryScreen from './src/screens/visitor/PinEntryScreen';
import PinDocumentCaptureScreen from './src/screens/visitor/PinDocumentCaptureScreen';
import QRDocumentCaptureScreen from './src/screens/visitor/QRDocumentCaptureScreen';
import UnitSelectionScreen from './src/screens/visitor/UnitSelectionScreen';
import ResidentApprovalScreen from './src/screens/visitor/ResidentApprovalScreen';
import VisitStatusScreen from './src/screens/visitor/VisitStatusScreen';
import { RootTabParamList } from './src/types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createStackNavigator();

function TabNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Reports':
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
              break;
            case 'PersonalComplaints':
              iconName = focused ? 'document-text' : 'document-text-outline';
              break;
            case 'Community':
              iconName = focused ? 'people-circle' : 'people-circle-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return <Ionicons name={iconName} size={focused ? 26 : 24} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textTertiary,
        tabBarStyle: {
          backgroundColor: isDark ? 'rgba(26, 26, 27, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderTopWidth: 0,
          borderTopColor: 'transparent',
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 12,
          height: Platform.OS === 'ios' ? 88 : 68,
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: Platform.OS === 'ios' ? 24 : 16,
          borderRadius: 24,
          shadowColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)',
          shadowOffset: {
            width: 0,
            height: 8,
          },
          shadowOpacity: 1,
          shadowRadius: 24,
          elevation: 16,
          backdropFilter: 'blur(20px)',
        },
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarBackground: () => null,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Reports" 
        component={ComplaintsScreen} 
        options={{ tabBarLabel: 'Reports' }}
      />
      <Tab.Screen 
        name="PersonalComplaints" 
        component={PersonalComplaintsScreen} 
        options={{ tabBarLabel: 'Issues' }}
      />
      <Tab.Screen 
        name="Community" 
        component={CommunityScreen} 
        options={{ tabBarLabel: 'Social' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { theme, isDark } = useTheme();
  const { isAuthenticated, isLoading, user, estate } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ color: '#fff', marginTop: 16, fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthFlowScreen />;
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {user && estate && (
        <View style={{ 
          position: 'absolute', 
          top: 50, 
          left: 20, 
          right: 20, 
          zIndex: 1000,
          backgroundColor: 'rgba(59, 130, 246, 0.9)',
          padding: 12,
          borderRadius: 8,
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <Ionicons name="business" size={16} color="#fff" style={{ marginRight: 8 }} />
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600', flex: 1 }}>
            {user.name} • {estate.name} ({estate.code}) • Unit {user.unitNumber}
          </Text>
        </View>
      )}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="VisitorCheckIn" component={VisitorCheckInScreen} />
        <Stack.Screen name="PinEntry" component={PinEntryScreen} />
        <Stack.Screen name="PinDocumentCapture" component={PinDocumentCaptureScreen} />
        <Stack.Screen name="QRDocumentCapture" component={QRDocumentCaptureScreen} />
        <Stack.Screen name="UnitSelection" component={UnitSelectionScreen} />
        <Stack.Screen name="ResidentApproval" component={ResidentApprovalScreen} />
        <Stack.Screen name="VisitStatus" component={VisitStatusScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
}
