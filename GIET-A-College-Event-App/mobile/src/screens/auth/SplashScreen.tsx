import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  Image, 
  Dimensions, 
  Animated 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path } from 'react-native-svg';
import { colors, spacing } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SplashScreen: React.FC = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Animated.View 
        style={[
          styles.brandContainer, 
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}
      >
        <Image 
          source={require('../../../assets/giet-logo-transparent.png')} 
          style={styles.logo} 
          resizeMode="contain" 
          accessibilityLabel="GIET(A) Official Logo"
        />

        <Text style={styles.brandTitle}>GIET(A)</Text>
        <Text style={styles.brandSubtitle}>College Event Management</Text>
        
        <View style={styles.taglineBox}>
          <Text style={styles.taglineText}>EVENTS</Text>
          <Text style={styles.taglineDot}>•</Text>
          <Text style={styles.taglineText}>CONNECT</Text>
          <Text style={styles.taglineDot}>•</Text>
          <Text style={styles.taglineText}>GROW</Text>
        </View>

        <View style={styles.loaderBox}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </Animated.View>

      {/* Template-accurate dual wave accent lines at bottom */}
      <View style={styles.bottomWaveContainer} pointerEvents="none">
        <Svg
          width={SCREEN_WIDTH}
          height={130}
          viewBox="0 0 400 130"
          preserveAspectRatio="none"
          style={styles.svgWave}
        >
          {/* Red decorative curve line (matches GIET gear accent) */}
          <Path
            d="M -10,75 C 90,105 210,105 410,32"
            fill="none"
            stroke="#DC2626"
            strokeWidth={3}
            strokeLinecap="round"
          />
          {/* Primary Teal/Blue curve line (matches institutional brand) */}
          <Path
            d="M -10,95 C 100,125 220,125 410,52"
            fill="none"
            stroke={colors.primary}
            strokeWidth={3.5}
            strokeLinecap="round"
          />
        </Svg>
      </View>

      {/* Institutional accreditation text */}
      <View style={styles.footerContainer} pointerEvents="none">
        <Text style={styles.footerText}>
          Gandhi Institute for Education and Technology, Bhubaneswar
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  brandContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    width: '100%',
    zIndex: 2,
    marginTop: -30,
  },
  logo: {
    width: 145,
    height: 145,
    marginBottom: spacing.lg,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  brandSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginTop: 6,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  taglineBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    gap: 8,
  },
  taglineText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: 1.5,
  },
  taglineDot: {
    fontSize: 14,
    color: '#94A3B8',
  },
  loaderBox: {
    marginTop: 28,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomWaveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: 130,
    overflow: 'hidden',
    zIndex: 1,
  },
  svgWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    zIndex: 2,
  },
  footerText: {
    fontSize: 10.5,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});

export default SplashScreen;
