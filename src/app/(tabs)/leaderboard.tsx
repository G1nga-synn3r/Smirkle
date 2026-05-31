import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export default function LeaderboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      <Text style={styles.placeholder}>Leaderboard page coming soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: colors.neonCyan,
    fontSize: 28,
    fontWeight: '900',
  },
  placeholder: {
    color: colors.neonYellow,
    fontSize: 16,
    marginTop: 20,
  },
});

