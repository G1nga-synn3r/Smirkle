import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PARTICLE_COUNT = 20;

interface Particle {
  id: number;
  emoji: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay: number;
  rotation: number;
}

const createParticles = (emojis: string[]): Particle[] => {
  const centerX = SCREEN_WIDTH / 2;
  const centerY = SCREEN_HEIGHT / 2;
  
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    emoji: emojis[i % emojis.length],
    startX: centerX,
    startY: centerY,
    endX: Math.random() * SCREEN_WIDTH,
    endY: Math.random() * SCREEN_HEIGHT,
    delay: Math.random() * 300,
    rotation: Math.random() * 360,
  }));
};

const EmojiParticle: React.FC<{ particle: Particle; onComplete?: () => void; index: number; total: number }> = ({
  particle,
  onComplete,
  index,
  total,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    const targetX = particle.endX - particle.startX;
    const targetY = particle.endY - particle.startY;

    scale.value = withDelay(particle.delay, withTiming(1.5, { duration: 800, easing: Easing.out(Easing.back(2)) }));
    translateX.value = withDelay(
      particle.delay,
      withTiming(targetX, { duration: 1500, easing: Easing.out(Easing.quad) })
    );
    translateY.value = withDelay(
      particle.delay,
      withTiming(targetY, { duration: 1500, easing: Easing.out(Easing.quad) })
    );
    rotate.value = withDelay(
      particle.delay,
      withTiming(particle.rotation, { duration: 1500, easing: Easing.out(Easing.quad) })
    );
    opacity.value = withDelay(
      particle.delay + 800,
      withTiming(0, { duration: 700, easing: Easing.in(Easing.quad) }, (finished) => {
        if (finished && onComplete && index === total - 1) {
          runOnJS(onComplete)();
        }
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[styles.particle, animatedStyle]}>
      {particle.emoji}
    </Animated.Text>
  );
};

interface EmojiParticlesProps {
  emojis: string[];
  visible: boolean;
  onComplete?: () => void;
}

export default function EmojiParticles({ emojis, visible, onComplete }: EmojiParticlesProps) {
  const [particles] = useState(() => createParticles(emojis));

  if (!visible) return null;

  return (
    <>
      {particles.map((particle, index) => (
        <EmojiParticle
          key={particle.id}
          particle={particle}
          onComplete={onComplete}
          index={index}
          total={particles.length}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    fontSize: 32,
    top: SCREEN_HEIGHT / 2 - 16,
    left: SCREEN_WIDTH / 2 - 16,
  },
});