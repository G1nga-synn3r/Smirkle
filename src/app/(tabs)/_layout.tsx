import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // For icons, or use emoji labels

export default function TabLayout() {
  return (
    <Tabs
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
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
          tabBarLabel: '🏠',
        }} 
      />
      <Tabs.Screen 
        name="search" 
        options={{ 
          title: 'Search',
          tabBarIcon: ({ color }) => <Ionicons name="search" size={24} color={color} />,
          tabBarLabel: '🔍',
        }} 
      />
      <Tabs.Screen 
        name="friends" 
        options={{ 
          title: 'Friends',
          tabBarIcon: ({ color }) => <Ionicons name="people" size={24} color={color} />,
          tabBarLabel: '👥',
        }} 
      />
      <Tabs.Screen 
        name="leaderboard" 
        options={{ 
          title: 'Leaderboard',
          tabBarIcon: ({ color }) => <Ionicons name="trophy" size={24} color={color} />,
          tabBarLabel: '🏆',
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
          tabBarLabel: '👤',
        }} 
      />
      <Tabs.Screen 
        name="settings" 
        options={{ 
          title: 'Settings',
          tabBarIcon: ({ color }) => <Ionicons name="settings" size={24} color={color} />,
          tabBarLabel: '⚙️',
        }} 
      />
      <Tabs.Screen 
        name="game" 
        options={{ 
          title: 'Game',
          tabBarIcon: ({ color }) => <Ionicons name="game-controller" size={24} color={color} />,
          tabBarLabel: '🎮',
        }} 
      />
    </Tabs>
  );
}

