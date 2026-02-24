import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../../constants/colors';

interface Props {
  active: boolean; // true = in geofence range
  onPress: () => void;
  label?: string;
  disabled?: boolean;
}

const SIZE = 80;

export function DiamondPulse({ active, onPress, label = 'CHECK IN', disabled }: Props) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);
  const flashScale = useSharedValue(1);
  const flashOpacity = useSharedValue(0);

  useEffect(() => {
    if (active) {
      scale.value = withRepeat(
        withTiming(1.12, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
      opacity.value = withRepeat(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
    } else {
      scale.value = withTiming(1);
      opacity.value = withTiming(0.3);
    }
  }, [active]);

  function handlePress() {
    if (disabled || !active) return;
    // Flash animation on success
    flashScale.value = withSequence(
      withTiming(0.7, { duration: 120 }),
      withTiming(1.2, { duration: 200 }),
      withTiming(1, { duration: 150 })
    );
    flashOpacity.value = withSequence(
      withTiming(1, { duration: 50 }),
      withTiming(0, { duration: 400 })
    );
    onPress();
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: '45deg' }],
    opacity: opacity.value,
  }));

  const flashStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flashScale.value }, { rotate: '45deg' }],
    opacity: flashOpacity.value,
  }));

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || !active}
      style={styles.wrapper}
      activeOpacity={0.8}
    >
      {/* Pulse ring */}
      <Animated.View style={[styles.ring, animatedStyle]} />
      {/* Flash ring */}
      <Animated.View style={[styles.flashRing, flashStyle]} />
      {/* Core diamond */}
      <Animated.View
        style={[
          styles.core,
          { transform: [{ rotate: '45deg' }] },
          !active && styles.coreInactive,
        ]}
      />
      <Text style={[styles.label, !active && styles.labelInactive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  ring: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: 6,
  },
  flashRing: {
    position: 'absolute',
    width: SIZE + 16,
    height: SIZE + 16,
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: 8,
  },
  core: {
    width: SIZE - 20,
    height: SIZE - 20,
    backgroundColor: colors.accent,
    borderRadius: 4,
    marginBottom: 4,
  },
  coreInactive: {
    backgroundColor: colors.accentMuted + '60',
    borderWidth: 1.5,
    borderColor: colors.accentMuted,
  },
  label: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  labelInactive: {
    color: colors.textSecondary,
  },
});
