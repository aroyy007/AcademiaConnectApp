import React, { ReactNode } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS } from '@/constants/colors';
import { FONT, FONT_SIZE } from '@/constants/typography';
import { SPACING, BORDER_RADIUS } from '@/constants/spacing';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  icon?: ReactNode;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button = ({ 
  title,
  icon,
  loading = false,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
  ...props
}: ButtonProps) => {
  // Determine button style based on variant
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      case 'primary':
      default:
        return styles.primaryButton;
    }
  };
  
  // Determine text style based on variant
  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.outlineButtonText;
      case 'primary':
      case 'secondary':
      default:
        return styles.buttonText;
    }
  };
  
  // Determine size style
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallButton;
      case 'large':
        return styles.largeButton;
      case 'medium':
      default:
        return {};
    }
  };
  
  // Determine text size style
  const getTextSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallButtonText;
      case 'large':
        return styles.largeButtonText;
      case 'medium':
      default:
        return {};
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        getSizeStyle(),
        loading && styles.disabledButton,
        style,
      ]}
      disabled={loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? '#3B3C36' : COLORS.card}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              getTextStyle(),
              getTextSizeStyle(),
              icon && styles.textWithIcon,
              textStyle,
            ]}
          >
            {title}
          </Text>
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
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  primaryButton: {
    backgroundColor: '#3B3C36',
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3B3C36',
  },
  smallButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  largeButton: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: FONT.semiBold,
    fontSize: FONT_SIZE.md,
    color: COLORS.card,
    textAlign: 'center',
  },
  outlineButtonText: {
    fontFamily: FONT.semiBold,
    fontSize: FONT_SIZE.md,
    color: '#3B3C36',
    textAlign: 'center',
  },
  smallButtonText: {
    fontSize: FONT_SIZE.sm,
  },
  largeButtonText: {
    fontSize: FONT_SIZE.lg,
  },
  textWithIcon: {
    marginLeft: SPACING.sm,
  },
});