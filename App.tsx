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
import LeaderboardScreen from './Screens/LeaderboardScreen';
import SearchScreen from './Screens/SearchScreen';
import FriendsScreen from './Screens/FriendsScreen';
import SubmitVideoScreen from './Screens/SubmitVideoScreen';

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
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
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
        name="Home" 
        component={HomeScreen}
        options={{ 
          title: 'Home',
          tabBarIcon: () => null,
          tabBarLabel: '🏠',
        }} 
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{ 
          title: 'Search',
          tabBarIcon: () => null,
          tabBarLabel: '🔍',
        }} 
      />
      <Tab.Screen 
        name="Friends" 
        component={FriendsScreen}
        options={{ 
          title: 'Friends',
          tabBarIcon: () => null,
          tabBarLabel: '👥',
        }} 
      />
      <Tab.Screen 
        name="Leaderboard" 
        component={LeaderboardScreen}
        options={{ 
          title: 'Leaderboard',
          tabBarIcon: () => null,
          tabBarLabel: '🏆',
        }} 
      />
      <Tab.Screen 
        name="Upload" 
        component={SubmitVideoScreen}
        options={{ 
          title: 'Upload',
          tabBarIcon: () => null,
          tabBarLabel: '📤',
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
        name="Game" 
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
