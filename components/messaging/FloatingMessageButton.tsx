import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Animated,
} from 'react-native';
import { MessageSquare } from 'lucide-react-native';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { FONT, FONT_SIZE } from '@/constants/typography';
import { SPACING, BORDER_RADIUS } from '@/constants/spacing';

interface FloatingMessageButtonProps {
  unreadCount?: number;
}

export const FloatingMessageButton = ({ unreadCount = 0 }: FloatingMessageButtonProps) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to messages
    router.push('/messages');
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        activeOpacity={0.8}
        accessibilityLabel="Open messages"
        accessibilityRole="button"
      >
        <MessageSquare size={24} color={COLORS.card} />
        
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount.toString()}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: SPACING.xl + 72 + 16, // Elevated by 16px above the tab bar (72px height + 16px spacing)
    right: SPACING.md,
    zIndex: 1000,
    elevation: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: '#3B3C36',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    // Enhanced elevation effect to match the plus button
    elevation: 12,
    shadowColor: '#3B3C36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.round,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  badgeText: {
    fontFamily: FONT.semiBold,
    fontSize: FONT_SIZE.xs,
    color: COLORS.card,
    lineHeight: 12,
  },
});