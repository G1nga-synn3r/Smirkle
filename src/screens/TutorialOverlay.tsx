import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

interface TutorialOverlayProps {
  onComplete: () => void;
}

export default function TutorialOverlay({ onComplete }: TutorialOverlayProps) {
  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Text style={styles.title}>😎 Welcome to Smirkle! 🎮</Text>

        <ScrollView
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.section}>
            <Text style={styles.bold}>Smirkle is the high-energy "try not to laugh" challenge!</Text>
            {'\n\n'}
            Watch random funny YouTube videos while the front camera monitors your face.
          </Text>

          <Text style={styles.section}>
            <Text style={styles.bold}>How to Play:</Text>
            {'\n'}
            • Get face lock: Eyes open, neutral face, front camera only.
            {'\n'}
            • Start - survive to score +111 points per second!
            {'\n'}
            • PiP camera overlay tracks you.
            {'\n\n'}
            <Text style={styles.bold}>Fail Conditions (instant end):</Text>
            {'\n'}
            • Smile detected (threshold: 0.60)
            {'\n'}
            • Eyes closed more than 2 seconds
            {'\n'}
            • Face leaves frame/obscured
            {'\n'}
            • Internet lost/video fail
          </Text>

          <Text style={styles.section}>
            <Text style={styles.bold}>Controls:</Text>
            {'\n'}
            • No pause/skip/rewind - pure challenge!
            {'\n'}
            • Warnings flash if close to fail (neon red border).
            {'\n'}
            • Save high scores, climb leaderboards.
          </Text>

          <Text style={styles.footer}>Good luck! 💀</Text>
        </ScrollView>

        <TouchableOpacity style={styles.ctaButton} onPress={onComplete}>
          <Text style={styles.ctaText}>GOT IT! Let&apos;s Play 😎</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 8, 22, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  container: {
    width: '100%',
    maxWidth: 760,
    backgroundColor: '#0b1126',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#00ffea',
    overflow: 'hidden',
    shadowColor: '#00ffea',
    shadowOpacity: 0.24,
    shadowRadius: 30,
    elevation: 20,
  },
  title: {
    color: '#ff00ff',
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 24,
    textShadowColor: '#00ffea',
    textShadowRadius: 15,
  },
  scrollContent: {
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  section: {
    color: '#ffff00',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
    textShadowColor: '#ffff00',
    textShadowRadius: 8,
  },
  bold: {
    fontWeight: '900',
    color: '#00ffea',
  },
  footer: {
    color: '#00ffea',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
    textShadowColor: '#00ffea',
    textShadowRadius: 5,
  },
  ctaButton: {
    margin: 18,
    backgroundColor: '#00ffea',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ff00ff',
  },
  ctaText: {
    color: '#050816',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
});