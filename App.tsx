import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import HomeScreen from './src/screens/HomeScreen';
import ComplaintsScreen from './src/screens/ComplaintsScreen';
import PersonalComplaintsScreen from './src/screens/PersonalComplaintsScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { RootTabParamList } from './src/types';

const Tab = createBottomTabNavigator<RootTabParamList>();

function TabNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
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
          options={{ tabBarLabel: 'Complaints' }}
        />
        <Tab.Screen 
          name="Community" 
          component={CommunityScreen} 
          options={{ tabBarLabel: 'Community' }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ tabBarLabel: 'Profile' }}
        />
      </Tab.Navigator>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}
