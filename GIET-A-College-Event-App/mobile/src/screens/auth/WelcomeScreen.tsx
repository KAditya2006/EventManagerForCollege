import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { Button } from '../../components/Button';
import { CampusIllustration } from '../../components/CampusIllustration';
import { colors, spacing, typography } from '../../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
};

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        
        {/* Top Header with Skip action */}
        <View style={styles.topHeader}>
          <View style={styles.headerSpacer} />
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={() => navigation.navigate('EmailLogin')}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Center Content Section */}
        <View style={styles.centerSection}>
          <Image 
            source={require('../../../assets/giet-logo-transparent.png')} 
            style={styles.logo} 
            resizeMode="contain" 
            accessibilityLabel="GIET(A) Official Logo"
          />

          <Text style={styles.title}>Welcome to GIET(A)</Text>
          <Text style={styles.subtitle}>
            Discover events, connect with your peers and be a part of campus life.
          </Text>

          {/* Pagination dots matching Screen 2 of design template */}
          <View style={styles.paginationRow}>
            <View style={styles.dotActive} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Bottom Section with Campus sketch and actions */}
        <View style={styles.bottomSection}>
          <View style={styles.illustrationWrap}>
            <CampusIllustration height={75} />
          </View>

          <Button 
            title="Get Started"
            onPress={() => navigation.navigate('EmailLogin')}
            variant="primary"
            size="lg"
            style={styles.getStartedButton}
          />

          <Text style={styles.institutionFooter}>
            Gandhi Institute for Education and Technology, Bhubaneswar
          </Text>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    height: 44,
  },
  headerSpacer: {
    width: 44,
  },
  skipButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748B',
  },
  centerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SCREEN_HEIGHT < 700 ? spacing.md : spacing.xl,
  },
  logo: {
    width: 125,
    height: 125,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    letterSpacing: 0.3,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
    paddingHorizontal: spacing.sm,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: spacing.xxl,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  dotActive: {
    width: 22,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  illustrationWrap: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  getStartedButton: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: spacing.md,
  },
  adminOption: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  adminText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  adminHighlight: {
    color: colors.primary,
    fontWeight: '600',
  },
  institutionFooter: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default WelcomeScreen;
