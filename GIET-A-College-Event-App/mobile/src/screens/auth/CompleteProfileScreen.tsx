import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { completeProfile } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing } from '../../theme';
import {
  UserIcon,
  IdCardIcon,
  PhoneIcon,
  GraduationCapIcon,
  BranchIcon,
  CalendarIcon,
  ChevronDownIcon,
  CheckIcon,
  CloseIcon,
  SparklesIcon,
} from '../../components/FormIcons';

type Props = {
  navigation?: NativeStackNavigationProp<AuthStackParamList, 'CompleteProfile'>;
};

interface PickerOption {
  label: string;
  subLabel?: string;
  value: string;
}

const COURSES: PickerOption[] = [
  { label: 'B.Tech', subLabel: 'Bachelor of Technology', value: 'B.Tech' },
  { label: 'M.Tech', subLabel: 'Master of Technology', value: 'M.Tech' },
  { label: 'MCA', subLabel: 'Master of Computer Applications', value: 'MCA' },
  { label: 'MBA', subLabel: 'Master of Business Administration', value: 'MBA' },
  { label: 'Diploma', subLabel: 'Diploma in Engineering', value: 'Diploma' },
  { label: 'BCA', subLabel: 'Bachelor of Computer Applications', value: 'BCA' },
];

const BRANCHES: PickerOption[] = [
  { label: 'Computer Science & Engineering', subLabel: 'CSE', value: 'CSE' },
  { label: 'CSE (AI & Machine Learning)', subLabel: 'CSE-AIML', value: 'CSE (AI & ML)' },
  { label: 'Electronics & Communication', subLabel: 'ECE', value: 'ECE' },
  { label: 'Electrical Engineering', subLabel: 'EE', value: 'EE' },
  { label: 'Mechanical Engineering', subLabel: 'ME', value: 'ME' },
  { label: 'Civil Engineering', subLabel: 'CE', value: 'Civil' },
  { label: 'Information Technology', subLabel: 'IT', value: 'IT' },
];

const YEARS: PickerOption[] = [
  { label: '1st Year', subLabel: 'Freshman', value: '1st Year' },
  { label: '2nd Year', subLabel: 'Sophomore', value: '2nd Year' },
  { label: '3rd Year', subLabel: 'Junior', value: '3rd Year' },
  { label: '4th Year', subLabel: 'Senior / Final Year', value: '4th Year' },
];

const SEMESTERS: PickerOption[] = [
  { label: '1st Semester', value: '1st Sem' },
  { label: '2nd Semester', value: '2nd Sem' },
  { label: '3rd Semester', value: '3rd Sem' },
  { label: '4th Semester', value: '4th Sem' },
  { label: '5th Semester', value: '5th Sem' },
  { label: '6th Semester', value: '6th Sem' },
  { label: '7th Semester', value: '7th Sem' },
  { label: '8th Semester', value: '8th Sem' },
];

type ModalType = 'course' | 'branch' | 'year' | 'semester' | null;

const CompleteProfileScreen: React.FC<Props> = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState('');
  const [branch, setBranch] = useState('');
  const [customBranch, setCustomBranch] = useState('');
  const [isOtherBranch, setIsOtherBranch] = useState(false);
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [section, setSection] = useState('');

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const errs: { [key: string]: string } = {};

    if (!name.trim()) {
      errs.name = 'Full name is required';
    }

    if (!rollNumber.trim()) {
      errs.rollNumber = 'Registration / Roll No. is required';
    } else if (rollNumber.trim().length < 4) {
      errs.rollNumber = 'Enter a valid Roll / Reg. number';
    }

    if (!phone.trim()) {
      errs.phone = 'Mobile number is required';
    } else if (!/^[0-9]{10}$/.test(phone.trim())) {
      errs.phone = 'Enter a valid 10-digit number';
    }

    if (!course.trim()) {
      errs.course = 'Please select your degree / program';
    }

    const effectiveBranch = isOtherBranch ? customBranch.trim() : branch.trim();
    if (!effectiveBranch) {
      errs.branch = 'Branch is required';
    }

    if (!year.trim()) {
      errs.year = 'Please select your year';
    }

    if (!semester.trim()) {
      errs.semester = 'Please select your semester';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleComplete = async () => {
    if (!validate()) {
      Alert.alert('Required Details Missing', 'Please fill in all mandatory fields to continue.');
      return;
    }

    const effectiveBranch = isOtherBranch ? customBranch.trim() : branch.trim();

    setLoading(true);
    try {
      const response = await completeProfile({
        name: name.trim(),
        rollNumber: rollNumber.trim().toUpperCase(),
        phone: phone.trim(),
        course: course.trim(),
        branch: effectiveBranch,
        year: year.trim(),
        semester: semester.trim(),
        section: section.trim(),
      });

      if (response.success) {
        updateUser(response.user);
      }
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || 'Failed to complete profile. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const renderModalContent = () => {
    if (!activeModal) return null;

    let title = '';
    let options: PickerOption[] = [];
    let selectedValue = '';
    let onSelect = (val: string) => {};

    if (activeModal === 'course') {
      title = 'Select Degree / Program';
      options = COURSES;
      selectedValue = course;
      onSelect = (val) => {
        setCourse(val);
        setActiveModal(null);
      };
    } else if (activeModal === 'branch') {
      title = 'Select Branch / Department';
      options = BRANCHES;
      selectedValue = isOtherBranch ? '__other__' : branch;
      onSelect = (val) => {
        if (val === '__other__') {
          setIsOtherBranch(true);
        } else {
          setIsOtherBranch(false);
          setBranch(val);
        }
        setActiveModal(null);
      };
    } else if (activeModal === 'year') {
      title = 'Select Year of Study';
      options = YEARS;
      selectedValue = year;
      onSelect = (val) => {
        setYear(val);
        setActiveModal(null);
      };
    } else if (activeModal === 'semester') {
      title = 'Select Semester';
      options = SEMESTERS;
      selectedValue = semester;
      onSelect = (val) => {
        setSemester(val);
        setActiveModal(null);
      };
    }

    return (
      <View style={styles.sheetContainer}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <TouchableOpacity 
            onPress={() => setActiveModal(null)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <CloseIcon size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
          {options.map((item) => {
            const isSelected = selectedValue === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                style={[styles.sheetOption, isSelected && styles.sheetOptionActive]}
                onPress={() => onSelect(item.value)}
                activeOpacity={0.7}
              >
                <View style={styles.sheetOptionLeft}>
                  <Text style={[styles.sheetOptionLabel, isSelected && styles.sheetOptionLabelActive]}>
                    {item.label}
                  </Text>
                  {item.subLabel ? (
                    <Text style={[styles.sheetOptionSub, isSelected && styles.sheetOptionSubActive]}>
                      {item.subLabel}
                    </Text>
                  ) : null}
                </View>
                {isSelected && <CheckIcon size={20} color={colors.primary} />}
              </TouchableOpacity>
            );
          })}

          {activeModal === 'branch' && (
            <TouchableOpacity
              style={[styles.sheetOption, isOtherBranch && styles.sheetOptionActive]}
              onPress={() => onSelect('__other__')}
              activeOpacity={0.7}
            >
              <View style={styles.sheetOptionLeft}>
                <Text style={[styles.sheetOptionLabel, isOtherBranch && styles.sheetOptionLabelActive]}>
                  Other Department / Specialization
                </Text>
                <Text style={styles.sheetOptionSub}>Type your custom department</Text>
              </View>
              {isOtherBranch && <CheckIcon size={20} color={colors.primary} />}
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    );
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
          showsVerticalScrollIndicator={false}
        >
          {/* Top Institutional Header */}
          <View style={styles.topBar}>
            <Image
              source={require('../../../assets/giet-logo-transparent.png')}
              style={styles.logoBadge}
              resizeMode="contain"
            />
            <View style={styles.topBarTextWrap}>
              <Text style={styles.topInstitution}>GIET (AUTONOMOUS)</Text>
              <Text style={styles.topStep}>Step 2 of 2 • Student Setup</Text>
            </View>
            <View style={styles.sparkleBadge}>
              <SparklesIcon size={14} color="#0E526B" />
            </View>
          </View>

          {/* Heading */}
          <View style={styles.headingSection}>
            <Text style={styles.title}>Student Profile</Text>
            <Text style={styles.subtitle}>
              Enter your official academic details for your QR pass and event access.
            </Text>

            {user?.email ? (
              <View style={styles.emailPill}>
                <View style={styles.greenDot} />
                <Text style={styles.emailText} numberOfLines={1}>
                  {user.email}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Form Section 1: Personal Identification */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionCategory}>PERSONAL & CONTACT</Text>

            {/* Full Name */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Full Name <Text style={styles.requiredStar}>*</Text></Text>
              <View style={[styles.inputBox, errors.name && styles.inputBoxError]}>
                <UserIcon size={18} color="#64748B" />
                <TextInput
                  style={styles.inputField}
                  placeholder="e.g., Full Name (as per ID card)"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            </View>

            {/* Roll Number / Reg. No */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>College Reg. No. / Roll No. <Text style={styles.requiredStar}>*</Text></Text>
              <View style={[styles.inputBox, errors.rollNumber && styles.inputBoxError]}>
                <IdCardIcon size={18} color="#64748B" />
                <TextInput
                  style={styles.inputField}
                  placeholder="e.g., 2401326385"
                  placeholderTextColor="#94A3B8"
                  value={rollNumber}
                  onChangeText={(text) => {
                    setRollNumber(text);
                    if (errors.rollNumber) setErrors((prev) => ({ ...prev, rollNumber: '' }));
                  }}
                  autoCapitalize="characters"
                  editable={!loading}
                />
              </View>
              <Text style={styles.helperText}>Used to verify identity on QR event check-in passes.</Text>
              {errors.rollNumber ? <Text style={styles.errorText}>{errors.rollNumber}</Text> : null}
            </View>

            {/* Mobile Number */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>WhatsApp / Contact Number <Text style={styles.requiredStar}>*</Text></Text>
              <View style={[styles.inputBox, errors.phone && styles.inputBoxError]}>
                <View style={styles.phonePrefix}>
                  <PhoneIcon size={16} color="#64748B" />
                  <Text style={styles.prefixText}>+91</Text>
                  <View style={styles.prefixDivider} />
                </View>
                <TextInput
                  style={styles.inputField}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#94A3B8"
                  value={phone}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9]/g, '');
                    setPhone(cleaned);
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                  }}
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!loading}
                />
              </View>
              {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
            </View>
          </View>

          {/* Form Section 2: Academic Details */}
          <View style={[styles.sectionContainer, { marginTop: 16 }]}>
            <Text style={styles.sectionCategory}>ACADEMIC RECORD</Text>

            {/* Degree / Program (Sleek Picker) */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Degree / Program <Text style={styles.requiredStar}>*</Text></Text>
              <TouchableOpacity
                style={[styles.pickerBox, errors.course && styles.inputBoxError]}
                onPress={() => setActiveModal('course')}
                activeOpacity={0.7}
              >
                <View style={styles.pickerLeft}>
                  <GraduationCapIcon size={19} color={colors.primary} />
                  <Text style={[styles.pickerValue, !course && { color: '#94A3B8' }]}>
                    {course || 'Select Degree / Program'}
                  </Text>
                </View>
                <ChevronDownIcon size={18} color="#94A3B8" />
              </TouchableOpacity>
              {errors.course ? <Text style={styles.errorText}>{errors.course}</Text> : null}
            </View>

            {/* Branch / Department (Sleek Picker) */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Branch / Department <Text style={styles.requiredStar}>*</Text></Text>
              <TouchableOpacity
                style={[styles.pickerBox, errors.branch && styles.inputBoxError]}
                onPress={() => setActiveModal('branch')}
                activeOpacity={0.7}
              >
                <View style={styles.pickerLeft}>
                  <BranchIcon size={19} color={colors.primary} />
                  <Text style={[styles.pickerValue, (!branch && !customBranch) && { color: '#94A3B8' }]} numberOfLines={1}>
                    {isOtherBranch ? (customBranch || 'Other Branch (Tap to specify)') : (branch || 'Select Branch / Department')}
                  </Text>
                </View>
                <ChevronDownIcon size={18} color="#94A3B8" />
              </TouchableOpacity>
              {isOtherBranch ? (
                <TextInput
                  style={[styles.customBranchInput, errors.branch && styles.inputBoxError]}
                  placeholder="Enter branch name (e.g., Data Science)"
                  placeholderTextColor="#94A3B8"
                  value={customBranch}
                  onChangeText={(t) => {
                    setCustomBranch(t);
                    if (errors.branch) setErrors((prev) => ({ ...prev, branch: '' }));
                  }}
                  autoCapitalize="words"
                />
              ) : null}
              {errors.branch ? <Text style={styles.errorText}>{errors.branch}</Text> : null}
            </View>

            {/* Year & Semester (Side-by-Side 2 Columns) */}
            <View style={styles.rowTwoCols}>
              {/* Year */}
              <View style={[styles.fieldWrapper, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Year <Text style={styles.requiredStar}>*</Text></Text>
                <TouchableOpacity
                  style={[styles.pickerBox, errors.year && styles.inputBoxError]}
                  onPress={() => setActiveModal('year')}
                  activeOpacity={0.7}
                >
                  <View style={styles.pickerLeft}>
                    <CalendarIcon size={17} color={colors.primary} />
                    <Text style={[styles.pickerValue, !year && { color: '#94A3B8' }]}>
                      {year || 'Select Year'}
                    </Text>
                  </View>
                  <ChevronDownIcon size={16} color="#94A3B8" />
                </TouchableOpacity>
                {errors.year ? <Text style={styles.errorText}>{errors.year}</Text> : null}
              </View>

              {/* Semester */}
              <View style={[styles.fieldWrapper, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Semester <Text style={styles.requiredStar}>*</Text></Text>
                <TouchableOpacity
                  style={[styles.pickerBox, errors.semester && styles.inputBoxError]}
                  onPress={() => setActiveModal('semester')}
                  activeOpacity={0.7}
                >
                  <View style={styles.pickerLeft}>
                    <CalendarIcon size={17} color={colors.primary} />
                    <Text style={[styles.pickerValue, !semester && { color: '#94A3B8' }]}>
                      {semester || 'Select Sem'}
                    </Text>
                  </View>
                  <ChevronDownIcon size={16} color="#94A3B8" />
                </TouchableOpacity>
                {errors.semester ? <Text style={styles.errorText}>{errors.semester}</Text> : null}
              </View>
            </View>

            {/* Section / Group (Optional) */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Section / Group <Text style={styles.optionalText}>(Optional)</Text></Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={[styles.inputField, { paddingLeft: 4 }]}
                  placeholder="e.g., Section A / Group 1"
                  placeholderTextColor="#94A3B8"
                  value={section}
                  onChangeText={setSection}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
            </View>
          </View>

          {/* Action CTA Button */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={[styles.ctaButton, loading && styles.ctaButtonDisabled]}
              onPress={handleComplete}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaButtonText}>
                {loading ? 'Setting up Profile...' : 'Complete & Enter Portal'}
              </Text>
              {!loading && <Text style={styles.ctaArrow}>→</Text>}
            </TouchableOpacity>

            <Text style={styles.safeFooter}>
              GIET Autonomous • Official Event Registry Platform
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modern Bottom Sheet Picker Modal */}
      <Modal
        visible={!!activeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveModal(null)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setActiveModal(null)}
        >
          <TouchableOpacity
            style={styles.modalSheet}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {renderModalContent()}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 48,
  },

  /* Top Bar */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoBadge: {
    width: 34,
    height: 34,
    marginRight: 10,
  },
  topBarTextWrap: {
    flex: 1,
  },
  topInstitution: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0E526B',
    letterSpacing: 0.8,
  },
  topStep: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  sparkleBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Heading */
  headingSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 10,
  },
  emailPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4F8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  emailText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0E526B',
  },

  /* Section */
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionCategory: {
    fontSize: 11,
    fontWeight: '800',
    color: '#187393',
    letterSpacing: 1.1,
    marginBottom: 14,
  },

  /* Fields */
  fieldWrapper: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  requiredStar: {
    color: '#DC2626',
    fontWeight: '700',
  },
  optionalText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '400',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputBoxError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputField: {
    flex: 1,
    height: '100%',
    marginLeft: 10,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  helperText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    marginLeft: 2,
  },
  errorText: {
    fontSize: 11,
    color: '#DC2626',
    marginTop: 4,
    marginLeft: 2,
    fontWeight: '500',
  },

  /* Phone prefix */
  phonePrefix: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prefixText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginLeft: 6,
  },
  prefixDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },

  /* Pickers */
  pickerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  pickerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  pickerValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 10,
  },
  customBranchInput: {
    height: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#0F172A',
    marginTop: 8,
  },

  /* Row 2 cols */
  rowTwoCols: {
    flexDirection: 'row',
  },

  /* Bottom CTA */
  bottomSection: {
    marginTop: 22,
    alignItems: 'center',
  },
  ctaButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#187393',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#187393',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  ctaArrow: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  safeFooter: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 12,
    fontWeight: '500',
  },

  /* Modal Bottom Sheet */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '75%',
    paddingBottom: 24,
  },
  sheetContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  sheetScroll: {
    maxHeight: 360,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginVertical: 2,
  },
  sheetOptionActive: {
    backgroundColor: '#F0F9FB',
  },
  sheetOptionLeft: {
    flex: 1,
  },
  sheetOptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  sheetOptionLabelActive: {
    color: '#0E526B',
    fontWeight: '700',
  },
  sheetOptionSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  sheetOptionSubActive: {
    color: '#187393',
  },
});

export default CompleteProfileScreen;
