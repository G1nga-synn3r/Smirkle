import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>😎 SMIRKLE 😎</Text>
      <Text style={styles.subtitle}>Don't Smile Challenge</Text>
      <Button
        title="Play Game"
        color="#00ffea"
        onPress={() => {
          // TODO: Navigate to GameScreen
        }}
      />
      <Button
        title="Leaderboard"
        color="#ffff00"
        onPress={() => {
          // TODO: Navigate to LeaderboardScreen
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    color: '#00ffea',        // neon cyan
    fontWeight: 'bold',
    textShadowColor: '#ff00ff', // magenta glow
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: 2,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 22,
    color: '#ffff00',        // neon yellow
    marginTop: 0,
    textShadowColor: '#00ffea',
    textShadowRadius: 10,
    marginBottom: 30,
  },
});

export default HomeScreen;