import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../../theme';

interface MaintenanceScreenProps {
  message?: string;
  onRefreshStatus: () => Promise<void>;
  onAdminBypass?: () => void;
  isAdmin?: boolean;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({
  message,
  onRefreshStatus,
  onAdminBypass,
  isAdmin = false,
}) => {
  const [checking, setChecking] = useState(false);

  const handleRefresh = async () => {
    setChecking(true);
    try {
      await onRefreshStatus();
    } finally {
      setChecking(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Top College Header */}
        <View style={styles.header}>
          <Text style={styles.collegePre}>GIET (AUTONOMOUS)</Text>
          <Text style={styles.collegeTitle}>College Event Manager</Text>
        </View>

        {/* Center Maintenance Visual */}
        <View style={styles.visualCard}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🛠️</Text>
          </View>

          <View style={styles.statusBadge}>
            <View style={styles.pulsingDot} />
            <Text style={styles.statusText}>Scheduled Maintenance</Text>
          </View>

          <Text style={styles.cardTitle}>System Upgrade in Progress</Text>

          <Text style={styles.cardMessage}>
            {message ||
              'We are currently upgrading the GIET(A) Event Management platform to bring you new features and enhanced performance.'}
          </Text>

          {/* Assurance Note */}
          <View style={styles.safeNoteBox}>
            <Text style={styles.safeNoteIcon}>🛡️</Text>
            <View style={styles.safeNoteTextContainer}>
              <Text style={styles.safeNoteTitle}>Zero Data Loss Guarantee</Text>
              <Text style={styles.safeNoteDesc}>
                All your event registrations, QR check-in passes, and profile details are 100% safe in the database.
              </Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.refreshButton, checking && styles.buttonDisabled]}
            onPress={handleRefresh}
            disabled={checking}
            activeOpacity={0.8}
          >
            {checking ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.refreshButtonText}>Check Status Again</Text>
                <Text style={styles.refreshArrow}>↻</Text>
              </>
            )}
          </TouchableOpacity>

          {isAdmin && onAdminBypass && (
            <TouchableOpacity
              style={styles.bypassButton}
              onPress={onAdminBypass}
              activeOpacity={0.7}
            >
              <Text style={styles.bypassText}>Continue as Administrator (Bypass)</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.footerHelp}>
            Need urgent support? Contact{' '}
            <Text
              style={styles.linkText}
              onPress={() => Linking.openURL('mailto:support@gieta.edu.in')}
            >
              support@gieta.edu.in
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  collegePre: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0E526B',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  collegeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  visualCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#FDE68A',
  },
  iconText: {
    fontSize: 36,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FCD34D',
    marginBottom: 14,
  },
  pulsingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#D97706',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 10,
  },
  cardMessage: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  safeNoteBox: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FB',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BCE3EC',
    alignItems: 'flex-start',
    width: '100%',
  },
  safeNoteIcon: {
    fontSize: 20,
    marginRight: 10,
    marginTop: 2,
  },
  safeNoteTextContainer: {
    flex: 1,
  },
  safeNoteTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0E526B',
    marginBottom: 2,
  },
  safeNoteDesc: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
  actionsContainer: {
    width: '100%',
    marginTop: 24,
    alignItems: 'center',
  },
  refreshButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#0E526B',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0E526B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  refreshArrow: {
    color: '#FFFFFF',
    fontSize: 18,
    marginLeft: 8,
    fontWeight: '700',
  },
  bypassButton: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  bypassText: {
    fontSize: 13,
    color: '#0E526B',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  footerHelp: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 24,
    textAlign: 'center',
  },
  linkText: {
    color: '#0E526B',
    fontWeight: '600',
  },
});

export default MaintenanceScreen;
