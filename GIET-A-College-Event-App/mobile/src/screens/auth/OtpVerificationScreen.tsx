import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  TextInput 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { requestOtp, verifyOtp } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'OtpVerification'>;

const OtpVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { email } = route.params;
  const { signIn } = useAuth();
  
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(45);
  const [errorMessage, setErrorMessage] = useState('');

  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const otpValue = digits.join('');

  const handleDigitChange = (text: string, index: number) => {
    setErrorMessage('');
    const numeric = text.replace(/[^0-9]/g, '');

    // Handle paste of full 6-digit code
    if (numeric.length > 1) {
      const codeDigits = numeric.slice(0, 6).split('');
      const newDigits = [...digits];
      codeDigits.forEach((d, i) => {
        newDigits[i] = d;
      });
      setDigits(newDigits);
      const nextFocus = Math.min(codeDigits.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = numeric;
    setDigits(newDigits);

    // Auto-advance focus
    if (numeric && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerify = async () => {
    setErrorMessage('');
    if (otpValue.length < 6) {
      setErrorMessage('Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOtp(email, otpValue);
      if (response.success) {
        const { token, user } = response.data;
        await signIn(token, user);
      }
    } catch (error: any) {
      let msg = error.response?.data?.error?.message;
      if (!msg) {
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          msg = 'Connection timed out. The cloud server may be waking up (Render free tier). Please wait a moment and try again.';
        } else if (error.message?.includes('Network Error') || !error.response) {
          msg = 'Cannot reach backend server. Please verify your internet connection or wait for the cloud server to wake up.';
        } else {
          msg = 'Failed to verify OTP. Please try again.';
        }
      }
      setErrorMessage(msg);
      Alert.alert('Verification Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resendLoading) return;
    
    setResendLoading(true);
    setErrorMessage('');
    try {
      await requestOtp(email);
      setCountdown(45);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      Alert.alert('Code Sent', 'A fresh 6-digit verification code has been sent to your email.');
    } catch (error: any) {
      let msg = error.response?.data?.error?.message;
      if (!msg) {
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          msg = 'Connection timed out. The cloud server may be waking up. Please wait a moment and try again.';
        } else if (error.message?.includes('Network Error') || !error.response) {
          msg = 'Cannot reach backend server. Please verify your internet connection or wait for the cloud server to wake up.';
        } else {
          msg = 'Failed to resend OTP. Please wait and try again.';
        }
      }
      setErrorMessage(msg);
      Alert.alert('Resend Failed', msg);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View>
            {/* Top Bar with Sleek Circular Back Arrow */}
            <View style={styles.topBar}>
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => navigation.goBack()}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Text style={styles.backIcon}>‹</Text>
              </TouchableOpacity>
            </View>

            {/* Header Text - Template Screen 4 */}
            <View style={styles.header}>
              <Text style={styles.title}>Verify Your Email</Text>
              <Text style={styles.subtitle}>
                Enter the 6-digit code sent to
              </Text>
              <Text style={styles.emailText}>{email}</Text>
            </View>

            {/* 6 Square Digit Input Boxes matching Design Template */}
            <View style={styles.boxesRow}>
              {digits.map((digit, index) => {
                const isFocused = focusedIndex === index;
                return (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    style={[
                      styles.boxInput,
                      isFocused && styles.boxInputFocused,
                      digit !== '' && styles.boxInputFilled,
                      errorMessage !== '' && styles.boxInputError,
                    ]}
                    value={digit}
                    onChangeText={(text) => handleDigitChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    onFocus={() => setFocusedIndex(index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    editable={!loading}
                    accessibilityLabel={`Digit ${index + 1}`}
                  />
                );
              })}
            </View>

            {errorMessage !== '' && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}

            {/* Countdown / Resend Section */}
            <View style={styles.resendSection}>
              {resendLoading ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : countdown > 0 ? (
                <Text style={styles.resendCooldown}>
                  Resend in 00:{countdown.toString().padStart(2, '0')}
                </Text>
              ) : (
                <TouchableOpacity 
                  onPress={handleResend}
                  accessibilityRole="button"
                  accessibilityLabel="Resend code"
                >
                  <Text style={styles.resendLink}>Resend Code</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={styles.changeEmailBtn}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.changeEmailText}>Change Email</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Button & Footer */}
          <View style={styles.actionSection}>
            <Button 
              title="Verify & Continue"
              onPress={handleVerify}
              loading={loading}
              size="lg"
              style={styles.verifyButton}
            />

            <View style={styles.footer}>
              <Text style={styles.infoText}>
                GIET(A) Secure OTP Verification • Code expires in 5 minutes
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
  },
  topBar: {
    marginBottom: spacing.xl,
    height: 44,
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 26,
    color: '#334155',
    lineHeight: 28,
    marginTop: -2,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 0.2,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  emailText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  boxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.xl,
    gap: 8,
  },
  boxInput: {
    flex: 1,
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
  },
  boxInputFocused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  boxInputFilled: {
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  boxInputError: {
    borderColor: colors.danger,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  resendSection: {
    alignItems: 'center',
    marginTop: spacing.md,
    gap: 12,
  },
  resendCooldown: {
    fontSize: 13,
    color: '#64748B',
  },
  resendLink: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  changeEmailBtn: {
    paddingVertical: 4,
  },
  changeEmailText: {
    fontSize: 13,
    color: '#64748B',
    textDecorationLine: 'underline',
  },
  actionSection: {
    width: '100%',
    marginTop: spacing.xxxl,
  },
  verifyButton: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  infoText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
});

export default OtpVerificationScreen;
