import React from 'react';
import { View, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';

export interface WatermarkProps {
  style?: StyleProp<ViewStyle>;
  size?: number;
}

export const Watermark: React.FC<WatermarkProps> = ({ style, size = 200 }) => {
  return (
    <View style={[styles.container, style]} pointerEvents="none">
      <Image
        source={require('../../assets/giet-logo-transparent.png')}
        style={[styles.image, { width: size, height: size }]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: -25,
    bottom: -25,
    opacity: 0.05,
    zIndex: -1,
  },
  image: {
    // Natural logo colors preserved per design spec
  },
});
