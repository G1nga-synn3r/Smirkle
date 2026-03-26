import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import HomeScreen from './Screens/HomeScreen';
import AuthScreen from './Screens/AuthScreen';
import GameScreen from './Screens/GameScreen';
import ProfileScreen from './Screens/ProfileScreen';
import SettingsScreen from './Screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#00ffea',
        tabBarInactiveTintColor: '#555',
        tabBarStyle: {
          backgroundColor: '#0a0a0a',
          borderTopWidth: 1,
          borderTopColor: '#ff00ff',
        },
        headerStyle: { backgroundColor: '#0a0a0a' },
        headerTintColor: '#00ffea',
        headerTitleStyle: { 
          color: '#ffff00',
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen}
        options={{ 
          title: 'Home',
          tabBarIcon: () => null,
          tabBarLabel: '🏠',
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          title: 'Profile',
          tabBarIcon: () => null,
          tabBarLabel: '👤',
        }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ 
          title: 'Settings',
          tabBarIcon: () => null,
          tabBarLabel: '⚙️',
        }} 
      />
      <Tab.Screen 
        name="GameTab" 
        component={GameScreen}
        options={{ 
          title: 'Game',
          tabBarIcon: () => null,
          tabBarLabel: '🎮',
        }} 
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        <Stack.Navigator
          initialRouteName="Auth"
          screenOptions={{
            headerStyle: { backgroundColor: '#0a0a0a' },
            headerTintColor: '#00ffea',
            headerTitleStyle: { 
              color: '#ffff00',
              fontWeight: 'bold',
            },
            contentStyle: { backgroundColor: '#0a0a0a' },
          }}
        >
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen} 
            options={{ title: 'SMIRKLE' }} 
          />
          <Stack.Screen 
            name="MainTabs" 
            component={MainTabs} 
            options={{ headerShown: false }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
