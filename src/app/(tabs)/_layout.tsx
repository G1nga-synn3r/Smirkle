import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // For icons, or use emoji labels
import { colors } from '../theme/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.neonCyan,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.neonMagenta,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.neonCyan,
        headerTitleStyle: {
          color: colors.neonYellow,
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
    </Tabs>
  );
}

