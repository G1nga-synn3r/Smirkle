import React from 'react';
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import tutorialFlowchart from '../../assets/tutorial-flowchart.png';

interface TutorialOverlayProps {
  onComplete: () => void;
}

export default function TutorialOverlay({ onComplete }: TutorialOverlayProps) {
  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Text style={styles.title}>Tutorial</Text>
        <Text style={styles.subtitle}>
          Learn the circular flow before you jump into the game.
        </Text>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.imageWrapper}>
            <Image
              source={tutorialFlowchart}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.ctaButton} onPress={onComplete}>
          <Text style={styles.ctaText}>Got it!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

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
    color: '#00ffea',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 24,
  },
  subtitle: {
    color: '#cbd5e1',
    textAlign: 'center',
    fontSize: 15,
    marginHorizontal: 24,
    marginTop: 12,
    marginBottom: 18,
    lineHeight: 22,
  },
  scrollContent: {
    paddingBottom: 24,
    alignItems: 'center',
  },
  imageWrapper: {
    width: width - 64,
    maxWidth: 680,
    height: (width - 64) * 0.95,
    backgroundColor: '#020617',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  ctaButton: {
    margin: 18,
    backgroundColor: '#00ffea',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#050816',
    fontSize: 17,
    fontWeight: '800',
  },
});