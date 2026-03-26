import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>😎 SMIRKLE 😎</Text>
      <Text style={styles.subtitle}>Don't Smile Challenge</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Game')}>
        <Text style={styles.buttonText}>Play Now</Text>
      </TouchableOpacity>
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
  button: {
    backgroundColor: '#00ffea', // neon cyan
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,
  },
  buttonText: {
    color: '#0a0a0a',        // dark background color for text
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default HomeScreen;