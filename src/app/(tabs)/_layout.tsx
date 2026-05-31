import { Tabs } from 'expo-router';
import { colors } from '../../theme/colors';

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
          tabBarIcon: () => null,
          tabBarLabel: '🏠',
        }} 
      />
      <Tabs.Screen 
        name="search" 
        options={{ 
          title: 'Search',
          tabBarIcon: () => null,
          tabBarLabel: '🔍',
        }} 
      />
      <Tabs.Screen 
        name="friends" 
        options={{ 
          title: 'Friends',
          tabBarIcon: () => null,
          tabBarLabel: '👥',
        }} 
      />
      <Tabs.Screen 
        name="leaderboard" 
        options={{ 
          title: 'Leaderboard',
          tabBarIcon: () => null,
          tabBarLabel: '🏆',
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile',
          tabBarIcon: () => null,
          tabBarLabel: '👤',
        }} 
      />
      <Tabs.Screen 
        name="settings" 
        options={{ 
          title: 'Settings',
          tabBarIcon: () => null,
          tabBarLabel: '⚙️',
        }} 
      />
    </Tabs>
  );
}