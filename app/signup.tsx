import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { router, Link } from 'expo-router';
import { ArrowLeft, User, Mail, Building2, Hash, Lock, GraduationCap, CircleAlert as AlertCircle } from 'lucide-react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { COLORS } from '@/constants/colors';
import { FONT, FONT_SIZE, LINE_HEIGHT } from '@/constants/typography';
import { SPACING, BORDER_RADIUS } from '@/constants/spacing';
import { InputField } from '@/components/ui/InputField';
import { PickerField } from '@/components/ui/PickerField';
import { Button } from '@/components/ui/Button';
import { GoogleButton } from '@/components/ui/GoogleButton';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/hooks/useAuth';

const SignupSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Full name is required'),
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required')
    .test(
      'is-edu-email',
      'Must be an East Delta University email',
      (value) => value && value.endsWith('@eastdelta.edu.bd')
    ),
  semester: Yup.number()
    .required('Current semester is required')
    .min(1, 'Semester must be between 1 and 12')
    .max(12, 'Semester must be between 1 and 12'),
  department: Yup.string().required('Department is required'),
  section: Yup.string()
    .required('Section is required')
    .oneOf(['1', '2', '3', '4'], 'Section must be 1, 2, 3, or 4'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase and number')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match!')
    .required('Please confirm your password'),
});

const departments = [
  { label: 'Computer Science & Engineering', value: 'CSE' },
  { label: 'Electrical & Electronic Engineering', value: 'EEE' },
  { label: 'Bachelor of Business Administration', value: 'BBA' },
  { label: 'English', value: 'ENG' },
  { label: 'Law', value: 'LAW' },
];

const sections = [
  { label: 'Section 1', value: '1' },
  { label: 'Section 2', value: '2' },
  { label: 'Section 3', value: '3' },
  { label: 'Section 4', value: '4' },
];

export default function SignupScreen() {
  const [error, setError] = useState<string | null>(null);
  const { signUp, signInWithGoogle, loading } = useAuth();
  
  const handleSignup = async (values: {
    fullName: string;
    email: string;
    semester: number;
    department: string;
    section: string;
    password: string;
    confirmPassword: string;
  }) => {
    setError(null);
    
    // Find department ID
    const selectedDept = departments.find(dept => dept.value === values.department);
    
    const profileData = {
      fullName: values.fullName,
      semester: values.semester,
      section: values.section,
      departmentCode: values.department,
      departmentName: selectedDept?.label || values.department,
    };
    
    const { data, error: signUpError } = await signUp(values.email, values.password, profileData);
    
    if (signUpError) {
      setError(signUpError.message || 'Sign up failed. Please try again.');
      return;
    }
    
    if (data?.user) {
      // Navigation will be handled by the auth state change
      router.replace('/(tabs)/feed');
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    
    const { data, error: signInError } = await signInWithGoogle();
    
    if (signInError) {
      setError('Google sign up failed. Please try again.');
      return;
    }
    
    if (data?.user) {
      router.replace('/(tabs)/feed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
          
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join Academia Connect for free!
            </Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <AlertCircle size={20} color={COLORS.error} />
              <Text style={styles.errorMessage}>{error}</Text>
            </View>
          )}
          
          <Formik
            initialValues={{ 
              fullName: '', 
              email: '', 
              semester: '', 
              department: '', 
              section: '', 
              password: '',
              confirmPassword: '',
            }}
            validationSchema={SignupSchema}
            onSubmit={handleSignup}
          >
            {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
              <View style={styles.form}>
                <Text style={styles.fieldLabel}>Full Name</Text>
                <InputField
                  icon={<User size={20} color={COLORS.textSecondary} />}
                  placeholder="Enter your full name"
                  value={values.fullName}
                  onChangeText={handleChange('fullName')}
                  onBlur={handleBlur('fullName')}
                  error={touched.fullName && errors.fullName}
                  autoCapitalize="words"
                />
                
                <Text style={styles.fieldLabel}>Email Address</Text>
                <InputField
                  icon={<Mail size={20} color={COLORS.textSecondary} />}
                  placeholder="student@eastdelta.edu.bd"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={touched.email && errors.email}
                />

                <Text style={styles.fieldLabel}>Department</Text>
                <PickerField
                  icon={<Building2 size={20} color={COLORS.textSecondary} />}
                  placeholder="Select your department"
                  selectedValue={values.department}
                  onValueChange={(value) => setFieldValue('department', value)}
                  items={departments}
                  error={touched.department && errors.department}
                />

                <Text style={styles.fieldLabel}>Current Semester</Text>
                <InputField
                  icon={<GraduationCap size={20} color={COLORS.textSecondary} />}
                  placeholder="Enter semester (1-12)"
                  value={values.semester.toString()}
                  onChangeText={(text) => {
                    const value = parseInt(text) || '';
                    setFieldValue('semester', value);
                  }}
                  onBlur={handleBlur('semester')}
                  keyboardType="numeric"
                  error={touched.semester && errors.semester}
                />

                <Text style={styles.fieldLabel}>Section</Text>
                <PickerField
                  icon={<Hash size={20} color={COLORS.textSecondary} />}
                  placeholder="Select your section"
                  selectedValue={values.section}
                  onValueChange={(value) => setFieldValue('section', value)}
                  items={sections}
                  error={touched.section && errors.section}
                />
                
                <Text style={styles.fieldLabel}>Password</Text>
                <InputField
                  icon={<Lock size={20} color={COLORS.textSecondary} />}
                  placeholder="Create a strong password"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  secureTextEntry
                  error={touched.password && errors.password}
                />
                
                <Text style={styles.fieldLabel}>Password Confirmation</Text>
                <InputField
                  icon={<Lock size={20} color={COLORS.textSecondary} />}
                  placeholder="Confirm your password"
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  secureTextEntry
                  error={touched.confirmPassword && errors.confirmPassword}
                />
                
                <Button 
                  title="Sign Up" 
                  onPress={handleSubmit} 
                  loading={loading}
                  style={styles.signupButton}
                />
                
                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>Or sign up with Google</Text>
                  <View style={styles.divider} />
                </View>
                
                <GoogleButton 
                  onPress={handleGoogleSignup}
                  loading={loading}
                />
                
                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>Already have an account? </Text>
                  <Link href="/login" asChild>
                    <TouchableOpacity>
                      <Text style={styles.loginLink}>Sign In</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  backButton: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
    alignSelf: 'flex-start',
    borderRadius: BORDER_RADIUS.sm,
  },
  header: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  title: {
    fontFamily: FONT.semiBold,
    fontSize: FONT_SIZE.xxxl,
    lineHeight: LINE_HEIGHT.xxxl,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.lg,
    lineHeight: LINE_HEIGHT.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '10',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  errorMessage: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: COLORS.error,
    marginLeft: SPACING.sm,
  },
  form: {
    width: '100%',
  },
  fieldLabel: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  signupButton: {
    marginTop: SPACING.xl,
    paddingVertical: SPACING.lg,
    backgroundColor: '#3B3C36', // Changed from COLORS.primary to #3B3C36
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.lg,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  loginText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  loginLink: {
    fontFamily: FONT.semiBold,
    fontSize: FONT_SIZE.md,
    color: '#3B3C36', // Changed from COLORS.primary to #3B3C36
  },
});
