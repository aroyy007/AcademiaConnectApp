import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  TouchableOpacityProps,
} from 'react-native';
import { COLORS } from '@/constants/colors';
import { FONT, FONT_SIZE } from '@/constants/typography';
import { SPACING, BORDER_RADIUS } from '@/constants/spacing';

interface GoogleButtonProps extends TouchableOpacityProps {
  loading?: boolean;
}

export const GoogleButton = ({ 
  loading = false, 
  ...props 
}: GoogleButtonProps) => {
  return (
    <TouchableOpacity
      style={[styles.button, loading && styles.disabledButton]}
      disabled={loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.text} />
      ) : (
        <>
          <View style={styles.googleIconContainer}>
            <Text style={styles.googleIcon}>G</Text>
          </View>
          <Text style={styles.buttonText}>Continue with Google</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  disabledButton: {
    opacity: 0.7,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  googleIcon: {
    fontFamily: FONT.semiBold,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  buttonText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
});
