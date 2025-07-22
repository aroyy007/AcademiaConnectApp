import React, { ReactNode } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { CircleAlert as AlertCircle } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { FONT, FONT_SIZE } from '@/constants/typography';
import { SPACING, BORDER_RADIUS } from '@/constants/spacing';

interface InputFieldProps extends TextInputProps {
  icon?: ReactNode;
  error?: string | false;
}

export const InputField = ({ 
  icon, 
  error, 
  style,
  ...props 
}: InputFieldProps) => {
  return (
    <View style={styles.container}>
      <View 
        style={[
          styles.inputContainer, 
          error && styles.inputContainerError,
          style
        ]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.placeholder}
          selectionColor="#3B3C36"
          {...props}
        />
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle size={14} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  inputContainerError: {
    borderColor: COLORS.error,
  },
  iconContainer: {
    paddingHorizontal: SPACING.md,
  },
  input: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: SPACING.sm,
  },
  errorText: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.xs,
    color: COLORS.error,
    marginLeft: 4,
  },
});