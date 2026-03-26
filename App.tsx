import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import HomeScreen from './Screens/HomeScreen';
import AuthScreen from './Screens/AuthScreen';
import GameScreen from './Screens/GameScreen';

const Stack = createNativeStackNavigator();

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
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'Home' }} 
          />
          <Stack.Screen 
            name="Game" 
            component={GameScreen} 
            options={{ title: 'Game' }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}