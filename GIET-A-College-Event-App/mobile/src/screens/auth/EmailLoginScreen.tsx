import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  Alert, 
  ScrollView, 
  TouchableOpacity,
  TextInput 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { requestOtp } from '../../api/auth';
import { Button } from '../../components/Button';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'EmailLogin'>;

const EmailLoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<TextInput>(null);

  const validateEmail = (input: string) => {
    return /^\S+@\S+\.\S+$/.test(input.trim());
  };

  const handleSendOtp = async () => {
    setErrorMessage('');
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setErrorMessage('Please enter your college email address.');
      inputRef.current?.focus();
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address (e.g., student@giet.edu).');
      inputRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      await requestOtp(trimmedEmail);
      navigation.navigate('OtpVerification', { email: trimmedEmail });
    } catch (error: any) {
      let msg = error.response?.data?.error?.message;
      if (!msg) {
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          msg = 'Connection timed out. Please verify your phone and computer are on the same Wi-Fi.';
        } else if (error.message?.includes('Network Error') || !error.response) {
          msg = 'Cannot reach backend server. Please verify your server is running and Wi-Fi matches.';
        } else {
          msg = 'Failed to request OTP. Please try again.';
        }
      }
      setErrorMessage(msg);
      Alert.alert('Unable to Send Code', msg);
    } finally {
      setLoading(false);
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
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          bounces={false}
        >
          {/* Top Bar with Sleek Back Arrow */}
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

          {/* Centered Brand Header - Template Screen 3 */}
          <View style={styles.header}>
            <Image 
              source={require('../../../assets/giet-logo-transparent.png')} 
              style={styles.logo} 
              resizeMode="contain" 
              accessibilityLabel="GIET(A) Official Logo"
            />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in with your college email
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.form}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              ref={inputRef}
              style={[
                styles.textInput,
                isFocused && styles.textInputFocused,
                errorMessage !== '' && styles.textInputError,
              ]}
              placeholder="you@college.ac.in"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errorMessage) setErrorMessage('');
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              editable={!loading}
              onSubmitEditing={handleSendOtp}
              returnKeyType="done"
              accessibilityLabel="College Email Address"
            />

            {errorMessage !== '' && (
              <Text style={styles.inlineError}>{errorMessage}</Text>
            )}

            <Button 
              title="Send OTP"
              onPress={handleSendOtp}
              loading={loading}
              size="lg"
              style={[
                styles.submitButton,
                email.trim() === '' && styles.submitButtonIdle
              ]}
            />
          </View>

          {/* Footer note */}
          <View style={styles.footer}>
            <Text style={styles.footerNote}>
              GIET (Autonomous) • Bhubaneswar, Odisha
            </Text>
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
    marginBottom: spacing.lg,
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
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xxxl,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    letterSpacing: 0.2,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: spacing.xs + 2,
  },
  textInput: {
    width: '100%',
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1E293B',
  },
  textInputFocused: {
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  textInputError: {
    borderColor: colors.danger,
    backgroundColor: '#FEF2F2',
  },
  inlineError: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 6,
    marginLeft: 2,
  },
  submitButton: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    backgroundColor: colors.primary,
    marginTop: spacing.xl,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  submitButtonIdle: {
    opacity: 0.88,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xxxl,
    paddingTop: spacing.md,
  },
  footerNote: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
});

export default EmailLoginScreen;
