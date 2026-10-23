import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../navigation/StudentNavigator';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<StudentStackParamList, 'ScanEventRegistration'>;

export const extractEventIdFromQr = (qrData: string): string | null => {
  if (!qrData) return null;
  const trimmed = qrData.trim();

  // 1. Direct MongoDB ObjectId: 24 hex characters
  if (/^[a-f0-9]{24}$/i.test(trimmed)) {
    return trimmed;
  }

  // 2. Custom Scheme: gieta://event/:eventId or gieta://e/:eventId
  const schemeMatch = trimmed.match(/gieta:\/\/(?:event|e)\/([a-f0-9]{24})/i);
  if (schemeMatch && schemeMatch[1]) {
    return schemeMatch[1];
  }

  // 3. Web URL: https://.../e/:eventId or https://.../events/:eventId
  const urlMatch = trimmed.match(/(?:\/e|\/events|\/event)\/([a-f0-9]{24})/i);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }

  return null;
};

const ScanEventRegistrationScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setScanned(false);
      setProcessing(false);
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
            GIET(A) Events needs camera permission to scan campus event poster QR codes for instant event registration.
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

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned || processing) return;

    setScanned(true);
    setProcessing(true);

    const eventId = extractEventIdFromQr(data);

    if (!eventId) {
      Alert.alert(
        'Invalid Event QR',
        'This QR code does not appear to be an official GIET(A) Event Registration code. Please scan an event poster QR code.',
        [
          {
            text: 'Try Again',
            onPress: () => {
              setScanned(false);
              setProcessing(false);
            },
          },
        ]
      );
      return;
    }

    // Step 2 Validation: Check if student has completed their profile
    const isProfileIncomplete = !user?.name || !user?.rollNumber || !user?.branch || !user?.profileCompleted;

    if (isProfileIncomplete) {
      Alert.alert(
        'Profile Setup Required',
        'Before you can register for events, you must set up your student profile with your Name, Roll Number, and Branch.',
        [
          {
            text: 'Setup Profile Now',
            onPress: () => {
              setScanned(false);
              setProcessing(false);
              navigation.navigate('EditProfile', { profileData: user });
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              setScanned(false);
              setProcessing(false);
            },
          },
        ]
      );
      return;
    }

    // Step 3: Profile complete - navigate directly to Event Details for 1-tap registration
    setProcessing(false);
    navigation.replace('EventDetails', { eventId });
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
          <Text style={styles.overlayTitle}>Scan Event QR to Register</Text>
          <Text style={styles.overlaySubtitle}>
            Point your camera at the QR code on the event poster or screen
          </Text>
        </View>

        <View style={styles.scannerWrapper}>
          <View style={styles.scannerOutline}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        <View style={styles.bottomBar}>
          {processing ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: spacing.sm }} />
              <Text style={styles.helpText}>Processing Event QR Code...</Text>
            </View>
          ) : (
            <Text style={styles.helpText}>
              Hold steady • Scans automatically
            </Text>
          )}

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  permissionCard: {
    width: '100%',
    padding: spacing.xl,
    alignItems: 'center',
  },
  permissionIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  permissionTitle: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  permissionText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  topBar: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    width: '100%',
  },
  overlayTitle: {
    ...typography.titleMedium,
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 4,
  },
  overlaySubtitle: {
    ...typography.caption,
    color: '#cbd5e1',
    textAlign: 'center',
  },
  scannerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerOutline: {
    width: 260,
    height: 260,
    backgroundColor: 'transparent',
    position: 'relative',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderRadius: radii.lg,
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#38bdf8',
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: radii.md,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: radii.md,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: radii.md,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: radii.md,
  },
  bottomBar: {
    width: '100%',
    alignItems: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  helpText: {
    ...typography.bodySmall,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  cancelButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: radii.pill,
  },
  cancelText: {
    ...typography.bodySmall,
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default ScanEventRegistrationScreen;
