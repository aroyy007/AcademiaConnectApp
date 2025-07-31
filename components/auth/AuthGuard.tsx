import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { COLORS } from '@/constants/colors';
import { FONT, FONT_SIZE } from '@/constants/typography';
import { SPACING } from '@/constants/spacing';
import { router } from 'expo-router';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AuthGuard = ({ children, fallback }: AuthGuardProps) => {
  const { user, profile, loading, initialized } = useAuth();

  useEffect(() => {
    // Only redirect if we're fully initialized and definitely not authenticated
    if (initialized && !loading && (!user || !profile)) {
      console.log('AuthGuard: Redirecting to login - user:', !!user, 'profile:', !!profile);
      router.replace('/login');
    }
  }, [initialized, loading, user, profile]);

  // Show loading while checking authentication
  if (!initialized || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  // Show fallback if not authenticated (this should rarely be seen due to redirect)
  if (!user || !profile) {
    return fallback || (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Authentication Required</Text>
        <Text style={styles.errorMessage}>
          Redirecting to login...
        </Text>
      </View>
    );
  }

  // Render children if authenticated
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  loadingText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  errorTitle: {
    fontFamily: FONT.semiBold,
    fontSize: FONT_SIZE.xl,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
