import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { checkInStudentQR } from '../../api/attendance';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AdminStackParamList, 'ScanAttendance'>;

const ScanAttendanceScreen: React.FC<Props> = ({ route, navigation }) => {
  const { eventId } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setScanned(false);
      setLoading(false);
    });
    return unsubscribe;
  }, [navigation]);

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Initializing camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Card style={styles.permissionCard}>
          <Text style={styles.permissionIcon}>📷</Text>
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            GIET(A) Events needs camera access to scan student digital QR passes and record attendance check-ins.
          </Text>
          <Button 
            onPress={requestPermission} 
            title="Grant Camera Access" 
            size="lg"
            style={{ width: '100%' }}
          />
        </Card>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned || loading) return;
    
    setScanned(true);
    setLoading(true);

    try {
      const res = await checkInStudentQR(eventId, data);
      navigation.navigate('CheckInResult', { eventId, result: res });
    } catch (error) {
      console.error('Scan error:', error);
      Alert.alert(
        'Scan Processing Error',
        'Failed to process the QR code. Please ensure good lighting and try again.',
        [{ text: 'Retry', onPress: () => { setScanned(false); setLoading(false); } }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />
      
      <View style={styles.overlay}>
        <View style={styles.topBar}>
          <Text style={styles.overlayTitle}>Scan Student QR Pass</Text>
          <Text style={styles.overlaySubtitle}>Position student's digital pass inside target</Text>
        </View>

        <View style={styles.scannerWrapper}>
          <View style={styles.scannerOutline} />
        </View>

        <View style={styles.bottomBar}>
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: spacing.sm }} />
              <Text style={styles.helpText}>Verifying attendance token...</Text>
            </View>
          ) : (
            <Text style={styles.helpText}>Keep camera steady for automatic recognition</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  permissionCard: {
    padding: spacing.xl,
    alignItems: 'center',
    maxWidth: 340,
  },
  permissionIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  permissionTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  permissionText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  overlay: {
    ...(StyleSheet.absoluteFill as any),
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 1.5,
  },
  topBar: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  overlayTitle: {
    ...typography.titleSmall,
    color: '#ffffff',
  },
  overlaySubtitle: {
    ...typography.bodySmall,
    color: '#cbd5e1',
    marginTop: 2,
  },
  scannerWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerOutline: {
    width: 260,
    height: 260,
    borderWidth: 2.5,
    borderColor: '#38bdf8', // Bright blue outline for high contrast
    borderRadius: radii.lg,
    backgroundColor: 'transparent',
  },
  bottomBar: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpText: {
    ...typography.bodySmall,
    color: '#ffffff',
    fontWeight: '500',
  },
});

export default ScanAttendanceScreen;
