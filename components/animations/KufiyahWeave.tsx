import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G, Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import { colors } from '../../constants/colors';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface Props {
  progress: number; // 0 to 1
  size?: number;
}

const GRID = 8; // 8x8 grid
const PADDING = 12;

// Calculate which ring a cell (row, col) belongs to
// Ring 0 = outermost, higher = inner
function getRing(row: number, col: number, grid: number): number {
  return Math.min(row, col, grid - 1 - row, grid - 1 - col);
}

// Build fill order: outer ring first
function buildFillOrder(grid: number): Array<[number, number]> {
  const maxRing = Math.floor(grid / 2);
  const order: Array<[number, number]> = [];
  for (let ring = 0; ring < maxRing; ring++) {
    // Top row of this ring
    for (let c = ring; c < grid - ring; c++) order.push([ring, c]);
    // Right col (excluding corners)
    for (let r = ring + 1; r < grid - ring; r++) order.push([r, grid - 1 - ring]);
    // Bottom row (excluding corners, reverse)
    for (let c = grid - 2 - ring; c >= ring; c--) order.push([grid - 1 - ring, c]);
    // Left col (excluding corners, reverse)
    for (let r = grid - 2 - ring; r > ring; r--) order.push([r, ring]);
  }
  return order;
}

const FILL_ORDER = buildFillOrder(GRID);
const TOTAL_CELLS = FILL_ORDER.length;

export function KufiyahWeave({ progress, size = 240 }: Props) {
  const glowValue = useSharedValue(0);
  const cellSize = (size - PADDING * 2) / GRID;
  const half = cellSize * 0.42; // diamond half-size

  // Start glow animation when complete
  useEffect(() => {
    if (progress >= 1) {
      glowValue.value = withRepeat(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
    } else {
      glowValue.value = 0;
    }
  }, [progress]);

  const filledCount = Math.floor(progress * TOTAL_CELLS);

  // Build diamond path for a cell center
  function diamondPath(cx: number, cy: number, h: number): string {
    return `M ${cx},${cy - h} L ${cx + h},${cy} L ${cx},${cy + h} L ${cx - h},${cy} Z`;
  }

  // Chain stitch lines connecting diamonds in rows
  function chainLine(r: number): string {
    const y = PADDING + r * cellSize + cellSize / 2;
    const x1 = PADDING + half;
    const x2 = PADDING + (GRID - 1) * cellSize + cellSize / 2 - half;
    return `M ${x1},${y} Q ${PADDING + cellSize},${y - 3} ${PADDING + cellSize + half},${y} Q ${PADDING + 2 * cellSize},${y + 3} ${x2},${y}`;
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Outer border diamond */}
        <Path
          d={`M ${size / 2},${4} L ${size - 4},${size / 2} L ${size / 2},${size - 4} L ${4},${size / 2} Z`}
          stroke={colors.border}
          strokeWidth={1.5}
          fill="none"
        />

        {/* Subtle chain lines */}
        {Array.from({ length: GRID }, (_, r) => (
          <Path
            key={`chain-${r}`}
            d={chainLine(r)}
            stroke={colors.border}
            strokeWidth={0.5}
            fill="none"
            opacity={0.4}
          />
        ))}

        {/* Diamond cells */}
        <G>
          {FILL_ORDER.map(([row, col], index) => {
            const cx = PADDING + col * cellSize + cellSize / 2;
            const cy = PADDING + row * cellSize + cellSize / 2;
            const isFilled = index < filledCount;
            const isEdge = index === filledCount - 1;

            return (
              <Path
                key={`${row}-${col}`}
                d={diamondPath(cx, cy, half)}
                fill={isFilled ? colors.accent : 'none'}
                stroke={isFilled ? colors.accent : colors.border}
                strokeWidth={isFilled ? 0 : 0.8}
                opacity={isFilled ? (isEdge ? 0.9 : 1) : 0.35}
              />
            );
          })}
        </G>

        {/* Center mark */}
        <Path
          d={`M ${size / 2},${size / 2 - 4} L ${size / 2 + 4},${size / 2} L ${size / 2},${size / 2 + 4} L ${size / 2 - 4},${size / 2} Z`}
          fill={progress > 0 ? colors.accent : colors.border}
          opacity={progress > 0 ? 1 : 0.3}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
