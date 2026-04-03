import React from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OCTAGON_SIZE = 60;
const BORDER_WIDTH = 3;

interface OctagonInputProps extends TextInputProps {
  label: string;
  onSparkle?: () => void;
  fontLoaded?: boolean;
}

const OctagonInput: React.FC<OctagonInputProps> = ({
  label,
  onSparkle,
  fontLoaded = true,
  ...inputProps
}) => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const focused = useSharedValue(false);

  const handleFocus = () => {
    scale.value = withTiming(1.05, { duration: 200 });
    glowOpacity.value = withTiming(1, { duration: 200 });
    focused.value = true;
    onSparkle?.();
  };

  const handleBlur = () => {
    scale.value = withTiming(1, { duration: 200 });
    glowOpacity.value = withTiming(0, { duration: 200 });
    focused.value = false;
  };

  const animatedProps = useAnimatedProps(() => ({
    scale: scale.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.inputWrapper, { transform: [{ scale: scale.value }] }]}>
        {/* Outer glow gradient */}
        <Defs>
          <LinearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#00ffea" stopOpacity="0.6" />
            <Stop offset="50%" stopColor="#ffff00" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#ff00ff" stopOpacity="0.6" />
          </LinearGradient>
        </Defs>

        {/* Glow ring */}
        <Svg
          style={[styles.glowSvg, { opacity: glowOpacity.value }]}
          width={OCTAGON_SIZE + 20}
          height={OCTAGON_SIZE + 20}
          viewBox={`0 0 ${OCTAGON_SIZE + 20} ${OCTAGON_SIZE + 20}`}
        >
          <Path
            d={`M10 10 L${OCTAGON_SIZE + 10} 10 L${OCTAGON_SIZE + 15} 15 L${OCTAGON_SIZE + 15} ${OCTAGON_SIZE + 5} L${OCTAGON_SIZE + 10} ${OCTAGON_SIZE + 10} L10 ${OCTAGON_SIZE + 10} L5 ${OCTAGON_SIZE + 5} L5 15 Z`}
            fill="url(#glowGradient)"
            opacity="0.5"
            stroke="none"
          />
        </Svg>

        {/* Main octagon border */}
        <Animated.View style={styles.svgContainer}>
          <Svg
            style={styles.svg}
            width={OCTAGON_SIZE}
            height={OCTAGON_SIZE}
            viewBox={`0 0 ${OCTAGON_SIZE} ${OCTAGON_SIZE}`}
          >
          {/* Octagon path: long top/bottom, 3-segment capped ends */}
          <Path
            d={\`
              M 12 5 
              L ${OCTAGON_SIZE - 12} 5 
              L ${OCTAGON_SIZE - 7} 10 
              L ${OCTAGON_SIZE - 7} ${OCTAGON_SIZE - 10} 
              L ${OCTAGON_SIZE - 12} ${OCTAGON_SIZE - 5} 
              L 12 ${OCTAGON_SIZE - 5} 
              L 7 ${OCTAGON_SIZE - 10} 
              L 7 10 Z
            \`}
            fill="transparent"
            stroke={focused.value ? '#00ffea' : '#555555'}
            strokeWidth={BORDER_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>

        {/* Inner input area */}
        <View style={styles.textInputContainer}>
          <TextInput
            style={[
              styles.textInput,
              fontLoaded ? { fontFamily: 'LuckiestGuy_400Regular' } : {},
            ]}
            placeholderTextColor="#888888"
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...inputProps}
          />
        </View>
      </Animated.View>

      {/* Label above */}
      <Animated.Text
        style={[
          styles.label,
          fontLoaded ? { fontFamily: 'LuckiestGuy_400Regular' } : {},
          focused.value && styles.labelFocused,
        ]}
      >
        {label.toUpperCase()}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 10,
  },
  inputWrapper: {
    position: 'relative',
    alignSelf: 'center',
    marginBottom: 8,
  },
  glowSvg: {
    position: 'absolute',
    top: -10,
    left: -10,
  },
  svg: {
    position: 'absolute',
  },
  textInputContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    color: '#ffffff',
    backgroundColor: 'transparent',
    textAlign: 'center',
    letterSpacing: 1,
    padding: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00ffea',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  labelFocused: {
    color: '#ffff00',
  },
});

export default OctagonInput;

