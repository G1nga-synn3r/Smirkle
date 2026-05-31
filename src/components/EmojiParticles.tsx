import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface EmojiParticlesProps {
  emojis: string[];
  visible: boolean;
  onComplete: () => void;
}

export default function EmojiParticles({ emojis, visible, onComplete }: EmojiParticlesProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && emojis.length > 0) {
      opacity.setValue(1);
      translateY.setValue(0);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -200,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onComplete();
      });
    }
  }, [visible, emojis, onComplete]);

  if (!visible || emojis.length === 0) return null;

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      {emojis.map((emoji, index) => (
        <Text key={index} style={[styles.emoji, { left: `${(index + 1) * 10}%` }]}>
          {emoji}
        </Text>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  emoji: {
    fontSize: 32,
    position: 'absolute',
    top: '50%',
  },
});