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
import { ArrowLeft, Mail, Lock, CircleAlert as AlertCircle } from 'lucide-react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { COLORS } from '@/constants/colors';
import { FONT, FONT_SIZE, LINE_HEIGHT } from '@/constants/typography';
import { SPACING, BORDER_RADIUS } from '@/constants/spacing';
import { InputField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { GoogleButton } from '@/components/ui/GoogleButton';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/hooks/useAuth';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required')
    .test(
      'is-edu-email',
      'Must be an East Delta University email',
      (value) => value && value.endsWith('@eastdelta.edu.bd')
    ),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export default function LoginScreen() {
  const [error, setError] = useState<string | null>(null);
  const { signIn, signInWithGoogle, loading } = useAuth();
  
  const handleLogin = async (values: { email: string; password: string }) => {
    setError(null);
    
    const { data, error: signInError } = await signIn(values.email, values.password);
    
    if (signInError) {
      setError(signInError.message || 'Login failed. Please try again.');
      return;
    }
    
    if (data?.user) {
      // Navigation will be handled by the auth state change
      router.replace('/(tabs)/feed');
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    
    const { data, error: signInError } = await signInWithGoogle();
    
    if (signInError) {
      setError('Google login failed. Please try again.');
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
          
          <View style={styles.header}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <AlertCircle size={20} color={COLORS.error} />
              <Text style={styles.errorMessage}>{error}</Text>
            </View>
          )}
          
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={handleLogin}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View style={styles.form}>
                <InputField
                  icon={<Mail size={20} color={COLORS.textSecondary} />}
                  placeholder="EDUemail (@eastdelta.edu.bd)"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={touched.email && errors.email}
                />
                
                <InputField
                  icon={<Lock size={20} color={COLORS.textSecondary} />}
                  placeholder="Password"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  secureTextEntry
                  error={touched.password && errors.password}
                />

                <Link href="/forgot-password" asChild>
                  <TouchableOpacity>
                    <Text style={styles.forgotPassword}>Forgot password?</Text>
                  </TouchableOpacity>
                </Link>
                
                <Button 
                  title="Sign In" 
                  onPress={handleSubmit} 
                  loading={loading} 
                  style={styles.loginButton}
                />
                
                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>Or sign in with Google</Text>
                  <View style={styles.divider} />
                </View>
                
                <GoogleButton 
                  onPress={handleGoogleLogin} 
                  loading={loading}
                />
                
                <View style={styles.signupContainer}>
                  <Text style={styles.signupText}>Don't have an account? </Text>
                  <Link href="/signup" asChild>
                    <TouchableOpacity>
                      <Text style={styles.signupLink}>Sign Up</Text>
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
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  backButton: {
    marginTop: SPACING.lg,
    padding: SPACING.sm,
    alignSelf: 'flex-start',
  },
  header: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  title: {
    fontFamily: FONT.semiBold,
    fontSize: FONT_SIZE.xxxl,
    lineHeight: LINE_HEIGHT.xxxl,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.lg,
    lineHeight: LINE_HEIGHT.lg,
    color: COLORS.textSecondary,
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
    gap: SPACING.md,
  },
  forgotPassword: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: '#3B3C36', // Changed from COLORS.primary to #3B3C36
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  loginButton: {
    marginTop: SPACING.md,
    backgroundColor: '#3B3C36', // Changed from COLORS.primary to #3B3C36
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
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
    marginHorizontal: SPACING.md,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  signupText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  signupLink: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: '#3B3C36', // Changed from COLORS.primary to #3B3C36
  },
});
