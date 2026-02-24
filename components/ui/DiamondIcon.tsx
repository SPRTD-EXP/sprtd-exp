import React from 'react';
import Svg, { Path, G } from 'react-native-svg';
import { colors } from '../../constants/colors';

interface Props {
  size?: number;
  active?: boolean;
  icon: 'home' | 'events' | 'map' | 'profile';
}

// Diamond-outlined icons for tab bar
export function DiamondIcon({ size = 24, active = false, icon }: Props) {
  const color = active ? colors.accent : colors.textSecondary;
  const fill = active ? colors.accent : 'none';

  // Diamond outline shape
  const half = size / 2;
  const pad = 3;
  const diamondPath = `M ${half},${pad} L ${size - pad},${half} L ${half},${size - pad} L ${pad},${half} Z`;

  const iconPaths: Record<typeof icon, string> = {
    home: `M ${half},${pad + 2} L ${size - pad - 2},${half} L ${size - pad - 2},${size - pad - 2} L ${pad + 2},${size - pad - 2} L ${pad + 2},${half} Z`,
    events: `M ${half - 4},${half - 2} h 8 M ${half - 4},${half + 2} h 8 M ${half},${pad + 2} L ${half},${size - pad - 2}`,
    map: `M ${half},${pad + 2} C ${half - 5},${pad + 2} ${pad + 2},${half - 3} ${pad + 2},${half} C ${pad + 2},${half + 5} ${half},${size - pad - 2} ${half},${size - pad - 2} C ${half},${size - pad - 2} ${size - pad - 2},${half + 5} ${size - pad - 2},${half} C ${size - pad - 2},${half - 3} ${half + 5},${pad + 2} ${half},${pad + 2} Z`,
    profile: `M ${half},${half - 3} m -4,0 a 4,4 0 1 0 8,0 a 4,4 0 1 0 -8,0 M ${pad + 2},${size - pad - 2} C ${pad + 2},${half + 4} ${half - 5},${half + 1} ${half},${half + 1} C ${half + 5},${half + 1} ${size - pad - 2},${half + 4} ${size - pad - 2},${size - pad - 2}`,
  };

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Diamond outline */}
      <Path
        d={diamondPath}
        stroke={color}
        strokeWidth={active ? 0 : 1.5}
        fill={active ? fill : 'none'}
        strokeLinejoin="round"
      />
      {/* Inner icon indicator */}
      <G>
        <Path
          d={`M ${half - 3},${half} L ${half},${half - 3} L ${half + 3},${half} L ${half},${half + 3} Z`}
          fill={active ? colors.card : color}
          opacity={0.9}
        />
      </G>
    </Svg>
  );
}
