import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../../constants/colors';

interface Props {
  challenged: boolean;
  size?: number;
  children: React.ReactNode;
}

export function RosterRing({ challenged, size = 56, children }: Props) {
  const scaleValue = useSharedValue(1);

  useEffect(() => {
    if (!challenged) {
      scaleValue.value = withRepeat(
        withTiming(1.06, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
    } else {
      scaleValue.value = 1;
    }
  }, [challenged]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const ringSize = size + 14;
  const half = ringSize / 2;
  const pad = 3;

  // Diamond ring path
  const diamondPath = `M ${half},${pad} L ${ringSize - pad},${half} L ${half},${ringSize - pad} L ${pad},${half} Z`;

  // Dashed diamond segments for "challenged"
  const segments = challenged
    ? [
        `M ${half},${pad} L ${ringSize - pad - 8},${half - 8}`,
        `M ${ringSize - pad},${half} L ${ringSize - pad - 8},${half + 8}`,
        `M ${half},${ringSize - pad} L ${pad + 8},${half + 8}`,
        `M ${pad},${half} L ${pad + 8},${half - 8}`,
      ]
    : [];

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={animatedStyle}>
        <Svg
          width={ringSize}
          height={ringSize}
          style={StyleSheet.absoluteFill}
          viewBox={`0 0 ${ringSize} ${ringSize}`}
        >
          {!challenged ? (
            <Path
              d={diamondPath}
              stroke={colors.accent}
              strokeWidth={2}
              fill="none"
            />
          ) : (
            segments.map((d, i) => (
              <Path
                key={i}
                d={d}
                stroke={colors.error}
                strokeWidth={2.5}
                fill="none"
                strokeLinecap="round"
              />
            ))
          )}
        </Svg>
      </Animated.View>
      <View style={{ width: size, height: size, overflow: 'hidden', borderRadius: 4 }}>
        {children}
      </View>
    </View>
  );
}
