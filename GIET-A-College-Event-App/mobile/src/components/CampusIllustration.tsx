import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  width?: number;
  height?: number;
  color?: string;
}

export const CampusIllustration: React.FC<Props> = ({
  width = SCREEN_WIDTH - 48,
  height = 90,
  color = '#E2E8F0',
}) => {
  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width={width} height={height} viewBox="0 0 320 90" fill="none">
        {/* Ground baseline */}
        <Path d="M 0,85 L 320,85" stroke={color} strokeWidth="1.5" />

        {/* Left Building Wing */}
        <Rect x="20" y="45" width="60" height="40" stroke={color} strokeWidth="1.2" />
        <Rect x="30" y="52" width="10" height="12" stroke={color} strokeWidth="1" />
        <Rect x="46" y="52" width="10" height="12" stroke={color} strokeWidth="1" />
        <Rect x="62" y="52" width="10" height="12" stroke={color} strokeWidth="1" />
        <Rect x="30" y="68" width="10" height="12" stroke={color} strokeWidth="1" />
        <Rect x="46" y="68" width="10" height="12" stroke={color} strokeWidth="1" />
        <Rect x="62" y="68" width="10" height="12" stroke={color} strokeWidth="1" />

        {/* Trees Left */}
        <Circle cx="12" cy="74" r="8" stroke={color} strokeWidth="1" />
        <Path d="M 12,82 L 12,85" stroke={color} strokeWidth="1.2" />

        {/* Central Main University Hall with Pillars & Pediment */}
        <Path d="M 100,32 L 160,10 L 220,32 Z" stroke={color} strokeWidth="1.5" />
        {/* Clock / Emblem Circle */}
        <Circle cx="160" cy="24" r="5" stroke={color} strokeWidth="1" />

        {/* Main Hall Base */}
        <Rect x="105" y="32" width="110" height="53" stroke={color} strokeWidth="1.5" />

        {/* Classical Columns */}
        <Rect x="120" y="38" width="8" height="38" stroke={color} strokeWidth="1" />
        <Rect x="138" y="38" width="8" height="38" stroke={color} strokeWidth="1" />
        <Rect x="174" y="38" width="8" height="38" stroke={color} strokeWidth="1" />
        <Rect x="192" y="38" width="8" height="38" stroke={color} strokeWidth="1" />

        {/* Central Entrance Arch */}
        <Path d="M 152,76 L 152,56 C 152,50 168,50 168,56 L 168,76" stroke={color} strokeWidth="1.2" />

        {/* Right Building Wing */}
        <Rect x="240" y="45" width="60" height="40" stroke={color} strokeWidth="1.2" />
        <Rect x="248" y="52" width="10" height="12" stroke={color} strokeWidth="1" />
        <Rect x="264" y="52" width="10" height="12" stroke={color} strokeWidth="1" />
        <Rect x="280" y="52" width="10" height="12" stroke={color} strokeWidth="1" />
        <Rect x="248" y="68" width="10" height="12" stroke={color} strokeWidth="1" />
        <Rect x="264" y="68" width="10" height="12" stroke={color} strokeWidth="1" />
        <Rect x="280" y="68" width="10" height="12" stroke={color} strokeWidth="1" />

        {/* Trees Right */}
        <Circle cx="308" cy="74" r="8" stroke={color} strokeWidth="1" />
        <Path d="M 308,82 L 308,85" stroke={color} strokeWidth="1.2" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.65,
  },
});
